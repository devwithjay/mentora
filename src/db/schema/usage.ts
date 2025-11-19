import {relations} from "drizzle-orm";
import {integer, pgTable, uuid, varchar} from "drizzle-orm/pg-core";

import {users} from "@/db/schema/users";

import {timestamps} from "./columns.helpers";

export const userDailyUsage = pgTable("user_daily_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {onDelete: "cascade"}),
  dateKey: varchar("date_key", {length: 10}).notNull(),
  usedMessages: integer("used_messages").notNull().default(0),
  ...timestamps,
});

export const userDailyUsageRelations = relations(userDailyUsage, ({one}) => ({
  user: one(users, {
    fields: [userDailyUsage.userId],
    references: [users.id],
  }),
}));
