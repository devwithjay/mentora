"use server";

import bcrypt from "bcryptjs";
import {ExtractTablesWithRelations, eq} from "drizzle-orm";
import {NeonQueryResultHKT} from "drizzle-orm/neon-serverless";
import {PgTransaction} from "drizzle-orm/pg-core";
import slugify from "slugify";
import {z} from "zod/v4";

import {signIn} from "@/auth";
import {db} from "@/db";
import {users} from "@/db/schema";
import {AccountSchema, accounts} from "@/db/schema/accounts";
import {
  OAuthParams,
  SignInParams,
  SignUpParams,
  oAuthSchema,
  signInSchema,
  signUpSchema,
} from "@/db/schema/users";
import {env} from "@/env";
import {action, handleError} from "@/lib/handlers";
import {NotFoundError} from "@/lib/http-errors";

export const getAccountByProviderId = async (
  params: string
): Promise<
  ActionResponse<Omit<AccountSchema, "name" | "providerAccountId">>
> => {
  const validationResult = await action({
    params,
    schema: z.string().min(1, {message: "Provider Account ID is required."}),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const account = await db.query.accounts.findFirst({
      where: (accounts, {eq}) => eq(accounts.providerAccountId, params),
      columns: {
        userId: true,
        password: true,
        provider: true,
      },
    });
    if (!account) throw new NotFoundError("Account");

    return {success: true, data: account, status: 200};
  } catch (error: unknown) {
    return handleError(error) as ErrorResponse;
  }
};

const generateUniqueUsername = async (
  baseUsername: string,
  tx: PgTransaction<
    NeonQueryResultHKT,
    typeof import("@/db/schema"),
    ExtractTablesWithRelations<typeof import("@/db/schema")>
  >
): Promise<string> => {
  const username = slugify(baseUsername, {
    strict: true,
    trim: true,
  });
  const exists = await tx.query.users.findFirst({
    where: (users, {eq}) => eq(users.username, username),
  });
  if (!exists) {
    return slugify(username, {
      strict: true,
      trim: true,
    });
  }

  let counter = 1;
  while (true) {
    const newUsername = slugify(`${baseUsername}${counter}`, {
      lower: true,
      strict: true,
      trim: true,
    });
    const exists = await tx.query.users.findFirst({
      where: (users, {eq}) => eq(users.username, newUsername),
    });
    if (!exists) return newUsername;
    counter++;
  }
};

export const oAuthSignIn = async (
  params: OAuthParams
): Promise<ActionResponse> => {
  const validationResult = await action<OAuthParams>({
    params,
    schema: oAuthSchema,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {provider, providerAccountId, user} = validationResult.params!;

  try {
    await db.transaction(async tx => {
      let existingUser = await tx.query.users.findFirst({
        where: (users, {eq}) => eq(users.email, user.email),
      });

      if (!existingUser) {
        const username = await generateUniqueUsername(user.username, tx);

        const [newUser] = await tx
          .insert(users)
          .values({
            name: user.name,
            username,
            email: user.email,
            image: user.image,
          })
          .returning();

        existingUser = newUser;
      } else {
        const updatedData: {name?: string; image?: string} = {};

        if (existingUser.name !== user.name) updatedData.name = user.name;
        if (existingUser.image !== user.image) updatedData.image = user.image;

        if (Object.keys(updatedData).length > 0) {
          await tx
            .update(users)
            .set(updatedData)
            .where(eq(users.id, existingUser.id));
        }
      }

      const currentUser = existingUser;

      const existingAccount = await tx.query.accounts.findFirst({
        where: (accounts, {and, eq}) =>
          and(
            eq(accounts.userId, currentUser.id),
            eq(accounts.provider, provider),
            eq(accounts.providerAccountId, providerAccountId)
          ),
      });

      if (!existingAccount) {
        await tx.insert(accounts).values({
          type: provider === "github" ? "oauth" : "oidc",
          userId: currentUser.id,
          name: currentUser.name,
          provider,
          providerAccountId,
        });
      }
    });

    return {success: true};
  } catch (error: unknown) {
    return handleError(error) as ErrorResponse;
  }
};

export const signUpWithCredentials = async (
  params: SignUpParams
): Promise<ActionResponse> => {
  const validationResult = await action<SignUpParams>({
    params,
    schema: signUpSchema,
  });
  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const {name, email, username, password} = validationResult.params!;

  try {
    const existingUser = await db.query.users.findFirst({
      where: (users, {eq}) => eq(users.email, email),
    });
    if (existingUser) throw new Error("Email already in use");

    const existingUsername = await db.query.users.findFirst({
      where: (users, {ilike}) => ilike(users.username, username),
    });
    if (existingUsername) throw new Error("Username already taken");

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.transaction(async tx => {
      const [newUser] = await tx
        .insert(users)
        .values({
          name,
          username,
          email,
        })
        .returning();
      await tx.insert(accounts).values({
        userId: newUser.id,
        name,
        password: hashedPassword,
        provider: "credentials",
        providerAccountId: email,
        type: "email",
      });
    });

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return {success: true};
  } catch (error: unknown) {
    return handleError(error) as ErrorResponse;
  }
};

export const signInWithCredentials = async (
  params: SignInParams
): Promise<ActionResponse> => {
  const validationResult = await action<SignInParams>({
    params,
    schema: signInSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }
  const {email, password} = validationResult.params!;

  try {
    const existingUser = await db.query.users.findFirst({
      where: (users, {eq}) => eq(users.email, email),
    });
    if (!existingUser) throw new NotFoundError("User");

    const existingAccount = await db.query.accounts.findFirst({
      where: (accounts, {and, eq}) =>
        and(
          eq(accounts.provider, "credentials"),
          eq(accounts.providerAccountId, email)
        ),
    });

    if (!existingAccount) throw new NotFoundError("Account");

    const passwordMatch = await bcrypt.compare(
      password,
      existingAccount.password!
    );
    if (!passwordMatch) throw new Error("Invalid credentials");

    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return {success: true};
  } catch (error: unknown) {
    return handleError(error) as ErrorResponse;
  }
};

export const signInAsGuest = async (): Promise<ActionResponse> => {
  const GUEST_EMAIL = env.GUEST_EMAIL;
  const GUEST_PASSWORD = env.GUEST_PASSWORD;

  try {
    const existingUser = await db.query.users.findFirst({
      where: (users, {eq}) => eq(users.email, GUEST_EMAIL),
    });
    if (!existingUser) throw new NotFoundError("Guest User");

    const existingAccount = await db.query.accounts.findFirst({
      where: (accounts, {and, eq}) =>
        and(
          eq(accounts.provider, "credentials"),
          eq(accounts.providerAccountId, GUEST_EMAIL)
        ),
    });
    if (!existingAccount) throw new NotFoundError("Guest Account");

    const passwordMatch = await bcrypt.compare(
      GUEST_PASSWORD,
      existingAccount.password!
    );
    if (!passwordMatch) throw new Error("Invalid guest credentials");

    await signIn("credentials", {
      email: GUEST_EMAIL,
      password: GUEST_PASSWORD,
      redirect: false,
    });

    return {success: true};
  } catch (error: unknown) {
    return handleError(error) as ErrorResponse;
  }
};
