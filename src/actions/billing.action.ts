"use server";

import crypto from "crypto";
import {eq} from "drizzle-orm";
import Razorpay from "razorpay";
import {z} from "zod";

import {auth} from "@/auth";
import {db} from "@/db";
import {
  type SelectSubscriptionModel,
  subscriptions,
} from "@/db/schema/subscriptions";
import {env} from "@/env";
import {action, handleError} from "@/lib/handlers";
import {NotFoundError} from "@/lib/http-errors";

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

const PLAN_TO_RAZORPAY_PLAN: Record<"basic" | "pro", string> = {
  basic: env.RAZORPAY_BASIC_PLAN_ID,
  pro: env.RAZORPAY_PRO_PLAN_ID,
};

const createRazorpaySubscriptionSchema = z.object({
  plan: z.enum(["basic", "pro"]),
});

const verifyRazorpaySubscriptionSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_subscription_id: z.string(),
  razorpay_signature: z.string(),
});

export const createRazorpaySubscription = async (
  params: z.infer<typeof createRazorpaySubscriptionSchema>
): Promise<
  ActionResponse<{
    subscriptionId: string;
    keyId: string;
    plan: "basic" | "pro";
    userName: string | null | undefined;
    userEmail: string | null | undefined;
  }>
> => {
  const validationResult = await action({
    params,
    schema: createRazorpaySubscriptionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      throw new Error("Unauthorized");
    }

    const {plan} = validationResult.params!;
    const razorpayPlanId = PLAN_TO_RAZORPAY_PLAN[plan];

    if (!razorpayPlanId) {
      throw new Error("Razorpay plan not configured");
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: 1,
      notes: {
        userId: session.user.id,
        plan,
      },
    });

    await db.insert(subscriptions).values({
      userId: session.user.id,
      plan,
      orderId: subscription.id,
      status: "pending",
    });

    return {
      success: true,
      data: {
        subscriptionId: subscription.id,
        keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        plan,
        userName: session.user.name,
        userEmail: session.user.email,
      },
      status: 201,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

export const verifyRazorpaySubscription = async (
  params: z.infer<typeof verifyRazorpaySubscriptionSchema>
): Promise<ActionResponse<SelectSubscriptionModel>> => {
  const validationResult = await action({
    params,
    schema: verifyRazorpaySubscriptionSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const {razorpay_payment_id, razorpay_subscription_id, razorpay_signature} =
      validationResult.params!;

    const sign = `${razorpay_subscription_id}|${razorpay_payment_id}`;

    const expectedSign = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      throw new Error("Invalid Razorpay signature");
    }

    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.orderId, razorpay_subscription_id))
      .limit(1);

    const sub = rows[0];

    if (!sub) {
      throw new NotFoundError("Subscription");
    }

    const [updated] = await db
      .update(subscriptions)
      .set({
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, sub.id))
      .returning();

    return {
      success: true,
      data: updated,
      status: 200,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
