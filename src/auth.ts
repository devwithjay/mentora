import NextAuth from "next-auth";

export const {handlers, auth, signIn, signOut} = NextAuth({
  providers: [],
  pages: {
    signIn: "/sign-in",
    signOut: "/sign-up",
    error: "/auth-error",
  },
});
