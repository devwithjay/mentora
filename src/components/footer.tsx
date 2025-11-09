"use client";

import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-border border-t py-6 text-sm">
      <div className="text-secondary mx-12 flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row md:gap-0 xl:mx-auto">
        <div className="flex flex-wrap items-center gap-x-3 lg:gap-x-4">
          <Link href="/" className="hover:text-primary transition">
            Help & Support
          </Link>
          <Link href="/" className="hover:text-primary transition">
            Report an Issue
          </Link>
          <Link href="/" className="hover:text-primary transition">
            Privacy Policy
          </Link>
        </div>

        <div className="text-secondary flex items-center max-md:flex-col-reverse max-md:gap-6">
          <div>
            <p className="text-tertiary text-center md:mr-2 lg:mr-6">
              © {new Date().getFullYear()} Mentora. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-x-2">
            <Link
              href="https://www.linkedin.com/in/devwithjay/"
              target="_blank"
              className="group p-2 transition"
            >
              <Image
                src="/icons/linkedin.svg"
                alt="Linkedin Logo"
                width={17}
                height={17}
                className="object-contain opacity-70 hover:opacity-100 dark:invert"
              />
            </Link>

            <Link
              href="https://x.com/devwithjay"
              target="_blank"
              className="group p-2 transition"
            >
              <Image
                src="/icons/x.svg"
                alt="X Logo"
                width={13}
                height={13}
                className="mt-0.5 object-contain opacity-75 hover:opacity-100 dark:invert"
              />
            </Link>

            <Link
              href="https://github.com/devwithjay"
              target="_blank"
              className="p-2 transition-all"
            >
              <Image
                src="/icons/github.svg"
                alt="Github Logo"
                width={16}
                height={16}
                className="object-contain opacity-75 invert hover:opacity-100 dark:invert-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
