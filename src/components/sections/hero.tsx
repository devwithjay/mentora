"use client";

import {Route} from "next";
import Link from "next/link";

import {ArrowRight} from "lucide-react";
import {useSession} from "next-auth/react";

import {Button} from "@/components/ui/button";
import {HERO_CONTENT} from "@/constants";

import {Badge} from "../ui/badge";
import ColourfulText from "../ui/colourful-text";

const HeroSection = () => {
  const {data: session, status} = useSession();
  const isAuthenticated = status === "authenticated";
  const currentPlan = session?.user?.plan ?? "Free";
  const normalizedPlan = typeof currentPlan === "string" ? currentPlan : "Free";
  const isSubscribed = ["Basic", "Pro"].includes(normalizedPlan);

  let primaryHref = "/sign-up";
  let primaryLabel = "Start free trial";
  let secondaryHref = "/pricing";
  let secondaryLabel = "View plans";

  if (isAuthenticated) {
    primaryHref = "/chat";
    if (isSubscribed) {
      primaryLabel = "Open Mentora";
      secondaryHref = "/pricing";
      secondaryLabel = "Manage plan";
    } else {
      primaryLabel = "Go to chat";
      secondaryHref = "/pricing";
      secondaryLabel = "Upgrade plan";
    }
  }

  return (
    <section className="py-12 sm:py-16 lg:px-0">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
        <Badge
          variant="outline"
          className="border-primary text-brand inline-flex items-center gap-2 rounded-full bg-transparent px-4 py-1.5 text-xs sm:text-sm"
        >
          <span className="bg-brand h-2 w-2 animate-pulse rounded-full" />
          <span>{HERO_CONTENT.badgeText}</span>
        </Badge>

        <h1 className="text-primary text-center font-sans text-4xl leading-tight font-bold sm:text-5xl">
          {HERO_CONTENT.title.replace(HERO_CONTENT.highlight, "")}
          <span className="inline-block whitespace-nowrap">
            <ColourfulText text={HERO_CONTENT.highlight} />
          </span>
        </h1>

        <p className="text-secondary mx-auto max-w-2xl text-base sm:text-lg">
          {HERO_CONTENT.description}
        </p>

        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:justify-center">
          <Link href={primaryHref as Route} className="w-full sm:w-auto">
            <Button className="btn-primary w-full rounded-full px-4 py-2.5 text-sm font-semibold sm:px-5">
              {primaryLabel}
              <ArrowRight className="size-4" />
            </Button>
          </Link>

          <Link href={secondaryHref as Route} className="w-full sm:w-auto">
            <Button className="btn-secondary w-full rounded-full px-4 py-2.5 text-sm font-semibold">
              {secondaryLabel}
            </Button>
          </Link>
        </div>

        <div className="mt-6 grid w-full max-w-3xl grid-cols-1 gap-4 text-left text-xs sm:grid-cols-3 sm:text-sm">
          {HERO_CONTENT.stats.map((item, idx) => (
            <div key={idx} className="border-primary rounded-xl border p-4">
              <p className="text-brand font-semibold">{item.title}</p>
              <p className="text-secondary mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
