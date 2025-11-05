import {InferSelectModel, relations} from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {createInsertSchema} from "drizzle-zod";
import type {AdapterAccountType} from "next-auth/adapters";
import z from "zod/v4";

import {timestamps, users} from "@/db/schema";

export const accounts = pgTable(
  "account",
  {
    userId: uuid("user_id").references(() => users.id, {onDelete: "cascade"}),
    name: varchar("name", {length: 255}).notNull(),
    password: varchar("password", {length: 100}),
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
    ...timestamps,
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

const baseSchema = createInsertSchema(accounts, {
  userId: schema => schema.min(1, {message: "User ID is required."}),
  name: schema =>
    schema
      .min(1, {message: "Name is required."})
      .max(255, {message: "Name cannot exceed 255 characters."})
      .regex(/^[a-zA-Z\s]+$/, {
        message: "Name can only contain letters and spaces.",
      }),
  password: schema =>
    schema
      .min(6, {message: "Password must be at least 6 characters long."})
      .max(100, {message: "Password cannot exceed 100 characters."})
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter.",
      })
      .regex(/[0-9]/, {message: "Password must contain at least one number."})
      .regex(/[^a-zA-Z0-9]/, {
        message: "Password must contain at least one special character.",
      })
      .optional(),
  provider: schema => schema.min(1, {message: "Provider is required."}),
  providerAccountId: schema =>
    schema.min(1, {message: "Provider Account ID is required."}),
}).pick({
  userId: true,
  name: true,
  password: true,
  provider: true,
  providerAccountId: true,
});

export const accountSchema = z.object({
  ...baseSchema.shape,
});

export type AccountSchema = z.infer<typeof accountSchema>;
export type SelectAccountModel = InferSelectModel<typeof accounts>;
