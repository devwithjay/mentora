import {InferSelectModel, relations} from "drizzle-orm";
import {pgTable, text, timestamp, uuid, varchar} from "drizzle-orm/pg-core";
import {createInsertSchema} from "drizzle-zod";
import {z} from "zod/v4";

import {users} from "@/db/schema/users";

export const planEnum = text("plan", {
  enum: ["free", "basic", "pro"],
}).notNull();

export const subscriptionStatusEnum = text("subscription_status", {
  enum: ["pending", "active", "failed", "cancelled"],
}).notNull();

export const subscriptions = pgTable("subscription", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {onDelete: "cascade"}),
  plan: planEnum.default("free"),
  orderId: varchar("order_id", {length: 255}),
  paymentId: varchar("payment_id", {length: 255}),
  status: subscriptionStatusEnum.default("pending"),
  signature: varchar("signature", {length: 255}),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
});

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

const baseInsertSchema = createInsertSchema(subscriptions, {
  plan: schema =>
    schema.refine(val => ["free", "basic", "pro"].includes(val), {
      message: "Plan must be either free, basic, or pro.",
    }),
  orderId: schema =>
    schema.max(255, "Order ID cannot exceed 255 characters.").optional(),
  paymentId: schema =>
    schema.max(255, "Payment ID cannot exceed 255 characters.").optional(),
  signature: schema =>
    schema.max(255, "Signature cannot exceed 255 characters.").optional(),
  status: schema =>
    schema.refine(
      val => ["pending", "active", "failed", "cancelled"].includes(val),
      {message: "Invalid subscription status."}
    ),
}).pick({
  userId: true,
  plan: true,
  orderId: true,
  paymentId: true,
  signature: true,
  status: true,
});

export const createSubscriptionSchema = z.object({
  userId: baseInsertSchema.shape.userId,
  plan: baseInsertSchema.shape.plan,
});

export const updateSubscriptionSchema = z.object({
  orderId: baseInsertSchema.shape.orderId.optional(),
  paymentId: baseInsertSchema.shape.paymentId.optional(),
  signature: baseInsertSchema.shape.signature.optional(),
  status: baseInsertSchema.shape.status.optional(),
});

export type SelectSubscriptionModel = InferSelectModel<typeof subscriptions>;
export type CreateSubscriptionParams = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionParams = z.infer<typeof updateSubscriptionSchema>;
