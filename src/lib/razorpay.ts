import Razorpay from "razorpay";

import {env} from "@/env";

export const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const PLAN_TO_RAZORPAY_PLAN: Record<"basic" | "pro", string> = {
  basic: env.RAZORPAY_BASIC_PLAN_ID,
  pro: env.RAZORPAY_PRO_PLAN_ID,
};
