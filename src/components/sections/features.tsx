"use client";
import {FEATURES} from "@/constants";

import MorphCard from "../ui/morph-card";

const FeaturesSection = () => {
  return (
    <section className="py-6 md:py-10">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-primary text-center text-3xl font-bold sm:text-4xl">
          Why choose Mentora?
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, idx) => (
            <MorphCard
              key={idx}
              containerClassName="h-full"
              className="flex flex-col gap-3 p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl">
                <feature.icon className="text-brand h-6 w-6" />
              </div>
              <h3 className="text-primary text-lg font-semibold">
                {feature.title}
              </h3>
              <p className="text-secondary text-sm leading-relaxed">
                {feature.description}
              </p>
            </MorphCard>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
