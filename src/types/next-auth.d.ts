import type {DefaultSession} from "next-auth";
import "next-auth/jwt";

import {userRoleEnum} from "@/db/schema";

export type ExtendedUser = DefaultSession["user"] & {
  username: string;
  role: (typeof userRoleEnum.enumValues)[number];
  plan: string;
};

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
    role?: (typeof userRoleEnum.enumValues)[number];
    plan?: string;
  }
}
