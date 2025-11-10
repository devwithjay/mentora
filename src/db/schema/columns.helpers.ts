import {pgEnum, timestamp} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "ADMIN",
  "USER",
  "MODERATOR",
  "GUEST",
]);

export const timestamps = {
  createdAt: timestamp("created_at", {mode: "string"}).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", {mode: "string"}).defaultNow().notNull(),
};
