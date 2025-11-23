"use client";

import Link from "next/link";

import {ArrowRight, Sparkles} from "lucide-react";
import {useSession} from "next-auth/react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {CTA_CONTENT} from "@/constants";

const CTASection = () => {
  const {data: session, status} = useSession();
  const isAuthenticated = status === "authenticated";
  const currentPlan = session?.user?.plan ?? "Free";
  const isSubscribed =
    typeof currentPlan === "string" && ["Basic", "Pro"].includes(currentPlan);

  const primaryHref = isAuthenticated ? "/chat" : "/sign-up";
  const primaryLabel = isAuthenticated
    ? isSubscribed
      ? "Continue in chat"
      : "Go to chat"
    : "Create free account";

  const subtleNote = isAuthenticated
    ? isSubscribed
      ? `You're on the ${currentPlan} plan.`
      : "You're on the Free plan. You can upgrade anytime."
    : CTA_CONTENT.note;

  return (
    <section className="py-6 md:py-10">
      <div className="relative">
        <div className="relative z-10 px-6 py-12 text-center sm:px-12 sm:py-16">
          <Badge
            variant="outline"
            className="border-primary bg-brand-secondary text-brand mb-6 inline-flex items-center gap-1.5 px-3 py-1.5"
          >
            <Sparkles className="size-3.5" />
            Start your journey
          </Badge>

          <h2 className="text-primary text-3xl font-bold sm:text-4xl lg:text-5xl">
            {CTA_CONTENT.title}
          </h2>

          <p className="text-secondary mx-auto mt-4 max-w-xl text-sm sm:text-base">
            {CTA_CONTENT.description}
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href={primaryHref}>
              <Button className="btn-primary group rounded-full px-5 py-2.5 text-sm font-semibold sm:px-6">
                {primaryLabel}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <p className="text-secondary mt-4 text-xs">{subtleNote}</p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
