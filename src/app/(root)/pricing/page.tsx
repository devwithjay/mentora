"use client";
import Link from "next/link";

import {Check} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {plans} from "@/constants";

const PricingPage = () => {
  return (
    <div className="px-6 py-16 sm:px-10 lg:px-20">
      <div className="mx-auto mb-16 max-w-4xl text-center">
        <Badge
          variant="outline"
          className="border-primary text-brand mx-auto mb-4 bg-(--background-brand-secondary)/40"
        >
          Pricing Plans
        </Badge>
        <h1 className="text-primary text-4xl font-bold sm:text-5xl">
          Choose the plan that fits you
        </h1>
        <p className="text-secondary mt-3 sm:text-lg">
          Upgrade anytime. No commitments. All plans include Mentora’s warm,
          supportive AI.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`relative flex flex-col rounded-3xl border p-8 ${
              plan.highlight
                ? "border-primary bg-(--background-brand-secondary)/50"
                : "bg-primary border-(--border-primary)"
            }`}
          >
            {plan.highlight && (
              <Badge className="bg-brand absolute top-4 right-4 text-white">
                Popular
              </Badge>
            )}

            <h3 className="text-primary text-xl font-semibold">{plan.name}</h3>

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
              <Link href="/sign-up">
                <Button
                  className={`w-full rounded-full py-5 font-semibold ${
                    plan.buttonVariant === "outline"
                      ? "btn-secondary"
                      : "btn-primary"
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <p className="text-secondary mt-10 text-center text-xs">
        All subscriptions can be cancelled anytime. No extra fees.
      </p>
    </div>
  );
};

export default PricingPage;
