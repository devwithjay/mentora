"use server";

import {eq} from "drizzle-orm";
import {z} from "zod/v4";

import {db} from "@/db";
import {
  CreateSubscriptionParams,
  SelectSubscriptionModel,
  UpdateSubscriptionParams,
  createSubscriptionSchema,
  subscriptions,
  updateSubscriptionSchema,
} from "@/db/schema/subscriptions";
import {action, handleError} from "@/lib/handlers";
import {NotFoundError} from "@/lib/http-errors";

export const getSubscriptionByUserId = async (
  params: string
): Promise<ActionResponse<SelectSubscriptionModel>> => {
  const validationResult = await action({
    params,
    schema: z.uuid({message: "Invalid user ID"}),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const subscription = await db.query.subscriptions.findFirst({
      where: (s, {eq}) => eq(s.userId, params),
    });

    if (!subscription) throw new NotFoundError("Subscription");

    return {success: true, data: subscription, status: 200};
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const createSubscription = async (
  params: CreateSubscriptionParams
): Promise<ActionResponse<SelectSubscriptionModel>> => {
  const validationResult = await action({
    params,
    schema: createSubscriptionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const [created] = await db
      .insert(subscriptions)
      .values(validationResult.params!)
      .returning();

    return {success: true, data: created, status: 201};
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const updateSubscription = async (
  id: string,
  params: UpdateSubscriptionParams
): Promise<ActionResponse<SelectSubscriptionModel>> => {
  const idCheck = await action({
    params: id,
    schema: z.uuid({message: "Invalid subscription ID"}),
  });

  if (idCheck instanceof Error) {
    return handleError(idCheck) as ErrorResponse;
  }

  const validationResult = await action({
    params,
    schema: updateSubscriptionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const [updated] = await db
      .update(subscriptions)
      .set(validationResult.params!)
      .where(eq(subscriptions.id, id))
      .returning();

    if (!updated) throw new NotFoundError("Subscription");

    return {success: true, data: updated, status: 200};
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
