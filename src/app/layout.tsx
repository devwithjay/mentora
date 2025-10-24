import type {Metadata} from "next";

import Providers from "@/components/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Mentora",
  description:
    "A modern mental wellness guide inspired by timeless Bhagavad Gita teachings.",
};

export default function GlobalLayout({children}: {children: React.ReactNode}) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className="flex h-[100dvh] flex-col">
          <Providers>{children}</Providers>
        </body>
      </html>
    </>
  );
}
