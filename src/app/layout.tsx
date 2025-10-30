import type {Metadata} from "next";
import React from "react";

import Providers from "@/components/providers";
import {Toaster} from "@/components/ui/sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "mentora",
  description:
    "A modern mental wellness guide inspired by timeless Bhagavad Gita teachings.",
};

export default function GlobalLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className="flex h-dvh flex-col">
          <Providers>{children}</Providers>
          <Toaster richColors />
        </body>
      </html>
    </>
  );
}
