import {pgTable, text, timestamp, uuid, varchar} from "drizzle-orm/pg-core";
import {createInsertSchema} from "drizzle-zod";
import {z} from "zod/v4";

import {users} from "@/db/schema/users";

export const issues = pgTable("issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {onDelete: "cascade"}),

  title: varchar("title", {length: 255}).notNull(),
  description: text("description").notNull(),
  category: varchar("category", {length: 100}).notNull(),

  status: varchar("status", {length: 20}).notNull().default("open"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertIssueSchema = createInsertSchema(issues, {
  title: s => s.min(3, "Title must be at least 3 characters."),

  description: s => s.min(10, "Please provide more details about the issue."),

  category: s =>
    s
      .min(3, "Category is required.")
      .max(100, "Category cannot exceed 100 chars."),
}).pick({
  userId: true,
  title: true,
  description: true,
  category: true,
});

export type InsertIssueParams = z.infer<typeof insertIssueSchema>;
export type SelectIssueModel = {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};
