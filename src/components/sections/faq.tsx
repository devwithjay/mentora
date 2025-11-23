"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {faqs} from "@/constants";

const FAQSection = () => {
  return (
    <section className="pt-12">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-primary text-center text-3xl font-bold sm:text-4xl">
          Frequently Asked Questions
        </h2>

        <p className="text-secondary mt-2 text-center">
          Answers to common questions about Mentora.
        </p>

        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-primary">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-secondary">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
