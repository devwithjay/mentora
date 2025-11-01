import {relations} from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type {AdapterAccountType} from "next-auth/adapters";

import {users} from "@/db/schema";

export const accounts = pgTable(
  "account",
  {
    userId: uuid("user_id").references(() => users.id, {onDelete: "cascade"}),
    password: varchar("password", {length: 255}),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  account => [
    primaryKey({columns: [account.provider, account.providerAccountId]}),
  ]
);

export const accountsRelations = relations(accounts, ({one}) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));
