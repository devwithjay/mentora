import {NextResponse} from "next/server";

import {auth} from "@/auth";
import {db} from "@/db";
import {subscriptions} from "@/db/schema/subscriptions";
import {env} from "@/env";
import {PLAN_TO_RAZORPAY_PLAN, razorpay} from "@/lib/razorpay";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({error: "Unauthorized"}, {status: 401});
  }

  const {plan} = await req.json();

  if (!["basic", "pro"].includes(plan)) {
    return NextResponse.json({error: "Invalid plan"}, {status: 400});
  }

  const planId = PLAN_TO_RAZORPAY_PLAN[plan as "basic" | "pro"];

  if (!planId) {
    return NextResponse.json(
      {error: "Razorpay plan not configured"},
      {status: 500}
    );
  }

  try {
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 0,
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

    return NextResponse.json({
      subscriptionId: subscription.id,
      userName: session.user.name,
      userEmail: session.user.email,
      keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      plan,
    });
  } catch (error) {
    console.error("[RAZORPAY_CREATE_SUBSCRIPTION]", error);
    return NextResponse.json(
      {error: "Failed to create subscription"},
      {status: 500}
    );
  }
}
