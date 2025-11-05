"use server";

import {ExtractTablesWithRelations, eq} from "drizzle-orm";
import {NeonQueryResultHKT} from "drizzle-orm/neon-serverless";
import {PgTransaction} from "drizzle-orm/pg-core";
import slugify from "slugify";
import {z} from "zod/v4";

import {db} from "@/db";
import {users} from "@/db/schema";
import {AccountSchema, accounts} from "@/db/schema/accounts";
import {OAuthSchema, oAuthSchema} from "@/db/schema/users";
import {action, handleError} from "@/lib/handlers";
import {NotFoundError} from "@/lib/http-errors";

export const getAccountByProvider = async (
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
    lower: true,
    strict: true,
    trim: true,
  });
  const exists = await tx.query.users.findFirst({
    where: (users, {eq}) => eq(users.username, username),
  });
  if (!exists) {
    return slugify(username, {
      lower: true,
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
  params: OAuthSchema
): Promise<ActionResponse> => {
  const validationResult = await action<OAuthSchema>({
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
