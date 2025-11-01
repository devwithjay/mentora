import {relations} from "drizzle-orm";
import {pgTable, uuid, varchar} from "drizzle-orm/pg-core";

import {accounts, timestamps, userRoleEnum} from "@/db/schema";

export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", {length: 255}).notNull(),
  email: varchar("email", {length: 320}).notNull().unique(),
  role: userRoleEnum("user_role").default("USER").notNull(),
  image: varchar("image", {length: 2048}),
  ...timestamps,
});

export const usersRelations = relations(users, ({many}) => ({
  accounts: many(accounts),
}));
