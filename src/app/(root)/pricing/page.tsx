"use client";

import {useRouter} from "next/navigation";
import {useMemo, useState} from "react";

import {Check, Loader2} from "lucide-react";
import {useSession} from "next-auth/react";
import {toast} from "sonner";

import {
  createRazorpaySubscription,
  verifyRazorpaySubscription,
} from "@/actions";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {plans} from "@/constants";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

const PricingPage = () => {
  const {data: session, status} = useSession();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const rawPlan = session?.user?.plan ?? "Free";
  const currentPlan =
    typeof rawPlan === "string" ? (rawPlan as string) : "Free";
  const currentPlanKey = currentPlan.toLowerCase() as "free" | "basic" | "pro";
  const isSubscribed = currentPlanKey === "basic" || currentPlanKey === "pro";
  const isAuthenticated = status === "authenticated";

  const visiblePlans = useMemo(
    () =>
      isSubscribed ? plans.filter(p => p.name.toLowerCase() !== "free") : plans,
    [isSubscribed]
  );

  const handleSubscribe = async (planName: string) => {
    const planKey = planName.toLowerCase() as "free" | "basic" | "pro";

    if (planKey === "free") {
      if (!isAuthenticated) {
        router.push("/sign-up");
        return;
      }

      if (currentPlanKey === "free") {
        router.push("/chat");
        return;
      }

      toast.info("You already have an active subscription.");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe");
      router.push("/sign-in");
      return;
    }

    if (currentPlanKey === planKey) {
      toast.info(`You are already on the ${currentPlan} plan.`);
      return;
    }

    if (isSubscribed && currentPlanKey !== planKey) {
      toast.error(
        `You already have an active ${currentPlan} subscription. Please contact support to change your plan.`
      );
      return;
    }

    setLoadingPlan(planName);

    try {
      const response = await createRazorpaySubscription({plan: planKey});

      if (!response.success || !response.data) {
        throw new Error(
          typeof response.error === "string"
            ? response.error
            : "Failed to create subscription"
        );
      }

      const {subscriptionId, keyId, userName, userEmail} = response.data;

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        const options = {
          key: keyId,
          subscription_id: subscriptionId,
          name: "Mentora",
          description: `${planName} Plan Subscription`,
          prefill: {
            name: userName || "",
            email: userEmail || "",
          },
          theme: {
            color: "#2f8e7e",
          },
          handler: async function (response: {
            razorpay_payment_id: string;
            razorpay_subscription_id: string;
            razorpay_signature: string;
          }) {
            try {
              const verifyResponse = await verifyRazorpaySubscription({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyResponse.success) {
                toast.success("Subscription activated successfully!");
                router.push("/chat");
              } else {
                throw new Error(
                  typeof verifyResponse.error === "string"
                    ? verifyResponse.error
                    : "Verification failed"
                );
              }
            } catch (error) {
              console.error("Verification error:", error);
              toast.error("Failed to verify payment. Please contact support.");
            } finally {
              setLoadingPlan(null);
            }
          },
          modal: {
            ondismiss: function () {
              setLoadingPlan(null);
              toast.info("Payment cancelled");
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      };

      script.onerror = () => {
        setLoadingPlan(null);
        toast.error("Failed to load payment gateway");
      };
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create subscription"
      );
      setLoadingPlan(null);
    }
  };

  return (
    <div className="bg-primary px-6 py-16 sm:px-10 lg:px-20">
      <div className="mx-auto mb-16 max-w-4xl text-center">
        <Badge
          variant="outline"
          className="border-primary text-brand bg-brand-secondary mx-auto mb-4"
        >
          Pricing Plans
        </Badge>

        <h1 className="text-primary text-4xl font-bold sm:text-5xl">
          Choose the plan that fits you
        </h1>

        <p className="text-secondary mt-3 sm:text-lg">
          Upgrade anytime. No commitments. All plans include Mentora&apos;s
          warm, supportive AI.
        </p>

        {isAuthenticated && (
          <p className="text-secondary mt-2 text-sm">
            Current plan:{" "}
            <span className="text-brand font-semibold">{currentPlan}</span>
          </p>
        )}
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePlans.map((plan, idx) => {
          const planKey = plan.name.toLowerCase() as "free" | "basic" | "pro";
          const isCurrentPlan = planKey === currentPlanKey;
          const isFreePlan = planKey === "free";

          const showPopularBadge =
            plan.highlight && !isSubscribed && !isCurrentPlan;

          const buttonDisabled =
            loadingPlan !== null ||
            isCurrentPlan ||
            (isSubscribed && !isCurrentPlan && !isFreePlan);

          const buttonLabel = isCurrentPlan
            ? "Current plan"
            : loadingPlan === plan.name
              ? "Processing..."
              : plan.buttonText;

          const cardClasses = plan.highlight
            ? "border-primary bg-brand-secondary"
            : "border-primary bg-primary";

          return (
            <div
              key={idx}
              className={`relative flex flex-col rounded-3xl border p-8 ${cardClasses}`}
            >
              {isCurrentPlan && (
                <Badge className="bg-brand absolute top-4 right-4 text-xs font-semibold text-white">
                  Current plan
                </Badge>
              )}

              {!isCurrentPlan && showPopularBadge && (
                <Badge className="bg-brand absolute top-4 right-4 text-xs font-semibold text-white">
                  Popular
                </Badge>
              )}

              <h3 className="text-primary text-xl font-semibold">
                {plan.name}
              </h3>

              <div className="mt-4 flex items-end gap-1">
                <span className="text-brand text-4xl font-bold">
                  {plan.price}
                </span>
                <span className="text-secondary">{plan.period}</span>
              </div>

              <p className="text-secondary mt-2 text-sm">{plan.description}</p>

              <ul className="mt-6 space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="text-brand mt-0.5 h-4 w-4" />
                    <span className="text-primary text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                <Button
                  onClick={() => handleSubscribe(plan.name)}
                  disabled={buttonDisabled}
                  className={`w-full rounded-full py-5 font-semibold ${
                    plan.buttonVariant === "outline"
                      ? "btn-secondary"
                      : "btn-primary"
                  }`}
                >
                  {loadingPlan === plan.name && !isCurrentPlan ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    buttonLabel
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-secondary mt-10 text-center text-xs">
        All subscriptions can be cancelled anytime. No extra fees.
      </p>
    </div>
  );
};

export default PricingPage;
