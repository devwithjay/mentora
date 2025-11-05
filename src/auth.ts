import {DrizzleAdapter} from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import {getAccountByProvider, oAuthSignIn} from "@/actions";
import {db} from "@/db";

export const {handlers, auth, signIn, signOut} = NextAuth({
  adapter: DrizzleAdapter(db!),
  session: {strategy: "jwt"},
  providers: [GitHub, Google],
  callbacks: {
    async session({session, token}) {
      session.user.id = token.sub as string;
      return session;
    },
    async jwt({token, account}) {
      if (account) {
        const {data: existingAccount, success} = await getAccountByProvider(
          account.type === "credentials"
            ? token.email!
            : account.providerAccountId
        );

        if (!success || !existingAccount) return token;

        const userId = existingAccount.userId;

        if (userId) token.sub = userId.toString();
      }

      return token;
    },
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
  },
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-up",
    error: "/auth-error",
  },
});
