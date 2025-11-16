import {NextResponse} from "next/server";

import crypto from "crypto";
import {eq} from "drizzle-orm";

import {db} from "@/db";
import {subscriptions} from "@/db/schema/subscriptions";
import {env} from "@/env";

export async function POST(req: Request) {
  const body = await req.json();

  const {razorpay_payment_id, razorpay_subscription_id, razorpay_signature} =
    body;

  if (
    !razorpay_payment_id ||
    !razorpay_subscription_id ||
    !razorpay_signature
  ) {
    return NextResponse.json(
      {error: "Missing Razorpay parameters"},
      {status: 400}
    );
  }

  const sign = `${razorpay_subscription_id}|${razorpay_payment_id}`;

  const expectedSign = crypto
    .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest("hex");

  if (expectedSign !== razorpay_signature) {
    return NextResponse.json({error: "Invalid signature"}, {status: 400});
  }

  try {
    const rows = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.orderId, razorpay_subscription_id))
      .limit(1);

    const sub = rows[0];

    if (!sub) {
      return NextResponse.json(
        {error: "Subscription not found"},
        {status: 404}
      );
    }

    await db
      .update(subscriptions)
      .set({
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, sub.id));

    return NextResponse.json({success: true});
  } catch (error) {
    console.error("[RAZORPAY_VERIFY_SUBSCRIPTION]", error);
    return NextResponse.json(
      {error: "Failed to update subscription"},
      {status: 500}
    );
  }
}
