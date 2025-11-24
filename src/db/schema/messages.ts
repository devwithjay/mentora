import {type InferSelectModel, relations} from "drizzle-orm";
import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import {createInsertSchema} from "drizzle-zod";
import {z} from "zod/v4";

import {users} from "@/db/schema/users";

import {timestamps} from "./columns.helpers";

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {onDelete: "cascade"}),
  title: varchar("title", {length: 255}),
  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  }).defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversations.id, {onDelete: "cascade"}),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {onDelete: "cascade"}),
  role: text("role", {enum: ["user", "assistant"]}).notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  ...timestamps,
});

export const conversationsRelations = relations(
  conversations,
  ({one, many}) => ({
    user: one(users, {
      fields: [conversations.userId],
      references: [users.id],
    }),
    messages: many(chatMessages),
  })
);

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
  conversation: one(conversations, {
    fields: [chatMessages.conversationId],
    references: [conversations.id],
  }),
}));

const baseMessageSchema = createInsertSchema(chatMessages, {
  role: schema =>
    schema.refine(val => ["user", "assistant"].includes(val), {
      message: "Role must be either user or assistant.",
    }),
});

export const createMessageSchema = z.object({
  conversationId: baseMessageSchema.shape.conversationId,
  userId: baseMessageSchema.shape.userId,
  role: baseMessageSchema.shape.role,
  content: baseMessageSchema.shape.content,
  metadata: baseMessageSchema.shape.metadata.optional(),
});

export const createConversationSchema = z.object({
  userId: z.uuid(),
  title: z.string().max(255).optional(),
});

export type SelectMessage = InferSelectModel<typeof chatMessages>;
export type SelectConversation = InferSelectModel<typeof conversations>;
export type CreateMessageParams = z.infer<typeof createMessageSchema>;
export type CreateConversationParams = z.infer<typeof createConversationSchema>;
