"use server";

import {eq} from "drizzle-orm";
import {z} from "zod/v4";

import {db} from "@/db";
import {subscriptions} from "@/db/schema";
import {SelectUserModel, users} from "@/db/schema/users";
import {action, handleError} from "@/lib/handlers";
import {NotFoundError} from "@/lib/http-errors";
import {razorpay} from "@/lib/razorpay";

export const getUserById = async (
  params: string
): Promise<ActionResponse<SelectUserModel>> => {
  const validationResult = await action({
    params,
    schema: z.uuid({message: "Invalid user ID"}),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const user = await db.query.users.findFirst({
      where: (users, {eq}) => eq(users.id, params),
    });
    if (!user) throw new NotFoundError("User");

    return {success: true, data: user, status: 200};
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};

const updateProfileSchema = z.object({
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

export const updateUserProfile = async (
  params: unknown
): Promise<ActionResponse<SelectUserModel>> => {
  const validationResult = await action({
    params,
    schema: updateProfileSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const {params: data} = validationResult as {
    params: z.infer<typeof updateProfileSchema>;
  };

  try {
    const existingUser = await db.query.users.findFirst({
      where: (users, {eq, and, ne}) =>
        and(eq(users.username, data.username), ne(users.id, data.userId)),
    });

    if (existingUser) {
      return {
        success: false,
        error: {
          message: "Username is already taken.",
        },
        status: 409,
      };
    }

    const [updated] = await db
      .update(users)
      .set({
        name: data.name,
        username: data.username,
        image: data.image || null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, data.userId))
      .returning();

    if (!updated) throw new NotFoundError("User");

    return {
      success: true,
      data: updated,
      status: 200,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
export const cancelSubscription = async (
  params: string
): Promise<ActionResponse<SelectUserModel>> => {
  const validationResult = await action({
    params,
    schema: z.uuid({message: "Invalid user ID"}),
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  try {
    const user = await db.query.users.findFirst({
      where: (users, {eq}) => eq(users.id, params),
    });

    if (!user) throw new NotFoundError("User");

    if (user.plan === "Free") {
      return {
        success: false,
        error: {
          message: "You don't have an active subscription to cancel.",
        },
        status: 400,
      };
    }

    const activeSubscription = await db.query.subscriptions.findFirst({
      where: (subscriptions, {eq, and}) =>
        and(
          eq(subscriptions.userId, params),
          eq(subscriptions.status, "active")
        ),
      orderBy: (subscriptions, {desc}) => [desc(subscriptions.createdAt)],
    });

    if (!activeSubscription) {
      return {
        success: false,
        error: {
          message: "No active subscription found.",
        },
        status: 400,
      };
    }

    let refundId = null;
    if (activeSubscription.paymentId) {
      try {
        const payment = await razorpay.payments.fetch(
          activeSubscription.paymentId
        );

        const refund = await razorpay.payments.refund(
          activeSubscription.paymentId,
          {
            amount: payment.amount,
            speed: "normal",
            notes: {
              reason: "Subscription cancelled by user",
              userId: params,
            },
          }
        );

        refundId = refund.id;

        if (activeSubscription.orderId) {
          try {
            await razorpay.subscriptions.cancel(
              activeSubscription.orderId,
              false
            );
          } catch (subError) {
            console.error("Error cancelling Razorpay subscription:", subError);
          }
        }
      } catch (refundError) {
        console.error("Refund error:", refundError);
        return {
          success: false,
          error: {
            message: "Failed to process refund. Please contact support.",
          },
          status: 500,
        };
      }
    }

    await db
      .update(subscriptions)
      .set({
        status: "cancelled",
        refundId: refundId || null,
        refundStatus: refundId ? "processing" : null,
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, activeSubscription.id));

    const [updatedUser] = await db
      .update(users)
      .set({
        plan: "Free",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, params))
      .returning();

    if (!updatedUser) throw new NotFoundError("User");

    return {
      success: true,
      data: updatedUser,
      status: 200,

      ...(refundId && {
        meta: {
          refundId,
          message: "Subscription cancelled and refund initiated successfully.",
        },
      }),
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
};
