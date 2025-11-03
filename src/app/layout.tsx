import type {Metadata} from "next";
import {DM_Sans} from "next/font/google";
import React from "react";

import Providers from "@/components/providers";
import {Toaster} from "@/components/ui/sonner";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "mentora",
  description:
    "A modern mental wellness guide inspired by timeless Bhagavad Gita teachings.",
};

export default function GlobalLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <body className={`${dmSans.variable} bg-primary flex h-dvh flex-col`}>
          <Providers>{children}</Providers>
          <Toaster richColors />
        </body>
      </html>
    </>
  );
}
