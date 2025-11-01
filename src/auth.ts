import {DrizzleAdapter} from "@auth/drizzle-adapter";
import NextAuth from "next-auth";

import {db} from "@/db";

export const {handlers, auth, signIn, signOut} = NextAuth({
  adapter: DrizzleAdapter(db!),
  session: {strategy: "jwt"},
  providers: [],
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-up",
    error: "/auth-error",
  },
});
