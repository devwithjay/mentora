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

export const getIssuesSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  search: z.string().optional().default(""),
  status: z.enum(["all", "open", "resolved"]).default("all"),
});

export type GetIssuesParams = z.infer<typeof getIssuesSchema>;

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

export type AdminIssueModel = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type PaginatedIssuesResponse = {
  issues: AdminIssueModel[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
