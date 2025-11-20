import {and, eq} from "drizzle-orm";

import {db} from "@/db";
import {userDailyUsage} from "@/db/schema/usage";

export type PlanName = "Free" | "Basic" | "Pro" | null | undefined;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getPlanLimit(plan: PlanName): number {
  switch (plan) {
    case "Pro":
      return Infinity;
    case "Basic":
      return 100;
    case "Free":
    default:
      return 5;
  }
}

export async function checkMessageLimit(userId: string, plan: PlanName) {
  const limit = getPlanLimit(plan);
  const dateKey = todayKey();

  if (limit === Infinity) {
    return {allowed: true, remaining: Infinity, limit};
  }

  const [row] = await db
    .select()
    .from(userDailyUsage)
    .where(
      and(
        eq(userDailyUsage.userId, userId),
        eq(userDailyUsage.dateKey, dateKey)
      )
    );

  const used = row?.usedMessages ?? 0;

  if (!row) {
    await db.insert(userDailyUsage).values({
      userId,
      dateKey,
      usedMessages: 0,
    });
  }

  if (used >= limit) {
    return {allowed: false, remaining: 0, limit};
  }

  return {allowed: true, remaining: limit - used, limit};
}

export async function incrementMessageUsage(userId: string) {
  const dateKey = todayKey();

  const [row] = await db
    .select()
    .from(userDailyUsage)
    .where(
      and(
        eq(userDailyUsage.userId, userId),
        eq(userDailyUsage.dateKey, dateKey)
      )
    );

  if (!row) {
    await db.insert(userDailyUsage).values({
      userId,
      dateKey,
      usedMessages: 1,
    });
    return;
  }

  await db
    .update(userDailyUsage)
    .set({usedMessages: row.usedMessages + 1})
    .where(
      and(
        eq(userDailyUsage.userId, userId),
        eq(userDailyUsage.dateKey, dateKey)
      )
    );
}
