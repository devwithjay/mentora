import {InferSelectModel, relations} from "drizzle-orm";
import {pgTable, timestamp, uuid, varchar} from "drizzle-orm/pg-core";
import {createInsertSchema} from "drizzle-zod";
import {z} from "zod/v4";

import {accounts, timestamps, userRoleEnum} from "@/db/schema";

export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", {length: 255}).notNull(),
  username: varchar("username", {length: 30}).notNull().unique(),
  email: varchar("email", {length: 320}).notNull().unique(),
  role: userRoleEnum("user_role").default("USER").notNull(),
  image: varchar("image", {length: 2048}),
  plan: varchar("plan", {length: 20}).notNull().default("Free"),
  emailVerified: timestamp("emailVerified", {mode: "date"}),
  ...timestamps,
});

export const usersRelations = relations(users, ({many}) => ({
  accounts: many(accounts),
}));

const baseSchema = createInsertSchema(users, {
  name: schema =>
    schema
      .min(1, {message: "Name is required."})
      .max(250, {message: "Name cannot exceed 250 characters."})
      .regex(/^[a-zA-Z\s]+$/, {
        message: "Name can only contain letters and spaces.",
      }),
  username: schema =>
    schema
      .min(3, {message: "Username must be at least 3 characters long."})
      .max(30, {message: "Username cannot exceed 30 characters."})
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores.",
      }),
  email: z.email({message: "Please provide a valid email address."}),
  role: schema => schema.default("USER"),
  image: z.url({message: "Please provide a valid image URL."}).optional(),
}).pick({
  name: true,
  username: true,
  email: true,
  role: true,
  image: true,
});

export const oAuthSchema = z.object({
  mode: z.literal("oauth", {message: "Mode is required."}),
  provider: z.enum(["google", "github"]),
  providerAccountId: z
    .string()
    .min(1, {message: "Provider Account ID is required."}),
  user: z.object({
    name: baseSchema.shape.name,
    username: baseSchema.shape.username,
    email: baseSchema.shape.email,
    image: baseSchema.shape.image,
  }),
});

export const signUpSchema = z.object({
  name: baseSchema.shape.name,
  username: baseSchema.shape.username,
  email: baseSchema.shape.email,
  password: z
    .string()
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
    }),
});

export const signInSchema = z.object({
  email: baseSchema.shape.email,
  password: z.string().min(1, {message: "Password is required."}),
});

export const updateProfileSchema = z.object({
  userId: z.uuid({message: "Invalid user ID"}),
  name: z
    .string()
    .min(1, {message: "Name is required."})
    .max(250, {message: "Name cannot exceed 250 characters."})
    .regex(/^[a-zA-Z\s]+$/, {
      message: "Name can only contain letters and spaces.",
    }),
  username: z
    .string()
    .min(3, {message: "Username must be at least 3 characters long."})
    .max(30, {message: "Username cannot exceed 30 characters."})
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores.",
    }),
  image: z
    .string()
    .url({message: "Please provide a valid image URL."})
    .optional()
    .or(z.literal("")),
});

export type SelectUserModel = InferSelectModel<typeof users>;
export type OAuthParams = z.infer<typeof oAuthSchema>;
export type SignUpParams = z.infer<typeof signUpSchema>;
export type SignInParams = z.infer<typeof signInSchema>;
