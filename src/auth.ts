import {redirect} from "next/navigation";
import {cache} from "react";

import {DrizzleAdapter} from "@auth/drizzle-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import {getAccountByProviderId, getUserById, oAuthSignIn} from "@/actions";
import ROUTES from "@/constants/routes";
import {db} from "@/db";
import {signInSchema} from "@/db/schema/users";

export const {handlers, auth, signIn, signOut} = NextAuth({
  adapter: DrizzleAdapter(db!),
  session: {strategy: "jwt"},
  providers: [
    GitHub,
    Google,
    Credentials({
      async authorize(credentials) {
        const {success, data} = signInSchema.safeParse(credentials);

        if (success) {
          const {email, password} = data;

          const {data: existingAccount} = await getAccountByProviderId(email);
          if (!existingAccount || !existingAccount.password) return null;

          const {data: existingUser} = await getUserById(
            existingAccount.userId!
          );

          if (!existingUser) return null;

          const passwordsMatch = await bcrypt.compare(
            password,
            existingAccount.password
          );

          if (passwordsMatch)
            return {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              image: existingUser.image,
            };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async signIn({user, profile, account}) {
      if (account?.type === "credentials") return true;
      if (!account || !user) return false;

      const userInfo = {
        name: user.name!,
        email: user.email!,
        image: user.image!,
        username:
          account.provider === "github"
            ? (profile?.login as string)
            : (user.email!.split("@")[0] as string),
      };

      const {success} = await oAuthSignIn({
        mode: "oauth",
        provider: account.provider as "github" | "google",
        providerAccountId: account.providerAccountId,
        user: userInfo,
      });

      if (!success) return false;

      return true;
    },
    async jwt({token, account}) {
      if (account) {
        const {data: existingAccount, success} = await getAccountByProviderId(
          account.type === "credentials"
            ? token.email!
            : account.providerAccountId
        );

        if (!success || !existingAccount) return token;

        const userId = existingAccount.userId;

        const {data: existingUser} = await getUserById(userId!);
        if (!existingUser) return token;

        if (userId) token.sub = userId.toString();
        token.username = existingUser.username;
        token.role = existingUser.role;
      }

      return token;
    },
    async session({session, token}) {
      if (token.sub && session.user) session.user.id = token.sub;
      if (token.username && session.user)
        session.user.username = token.username;
      if (token.role && session.user) session.user.role = token.role;

      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-up",
    error: "/auth-error",
  },
});

export const getSession = cache(async () => {
  return await auth();
});

export const getCurrentUser = async () => {
  const session = await getSession();
  return session?.user || null;
};

export const requireAuth = async () => {
  const session = await getSession();

  if (!session?.user) {
    redirect(ROUTES.SIGN_IN);
  }
  return session.user;
};

export const requireRole = async (allowedRoles: string[]) => {
  const session = await getSession();

  if (!session?.user) {
    redirect(ROUTES.SIGN_IN);
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect(ROUTES.FORBIDDEN);
  }

  return session.user;
};
