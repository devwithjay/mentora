"use client";
import Link from "next/link";

import {ArrowRight, Sparkles} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {CTA_CONTENT} from "@/constants";

const CTASection = () => {
  return (
    <section className="py-6 md:py-10">
      <div className="y relative">
        <div className="relative z-10 px-6 py-12 text-center sm:px-12 sm:py-16">
          <Badge
            variant="outline"
            className="text-brand mb-6 gap-1.5 border-(--border-primary) bg-(--background-brand-secondary)/40 px-3 py-1.5"
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
            <Link href="/sign-up">
              <Button className="group btn-primary font-semibold">
                Create free account
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-(--text-secondary)">
            {CTA_CONTENT.note}
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
