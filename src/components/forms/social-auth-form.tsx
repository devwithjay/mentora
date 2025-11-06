"use client";

import Image from "next/image";

import {signIn} from "next-auth/react";
import {toast} from "sonner";

import {Button} from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import {logger} from "@/lib/logger";

const SocialAuthForm = () => {
  const buttonClass =
    "min-h-11 w-full cursor-pointer bg-transparent dark:hover:bg-transparent border-primary border-1 shadow-none text-secondary";

  const onClick = async (provider: "google" | "github") => {
    try {
      await signIn(provider, {
        callbackUrl: ROUTES.HOME,
        redirect: false,
      });
    } catch (error) {
      logger.error(error);
      toast.error("Sign-in failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during sign-in",
      });
      toast.error("Sign-in failed", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during sign-in",
      });
    }
  };

  return (
    <div className="mt-6 flex flex-col gap-4">
      <Button
        className={buttonClass}
        variant="ghost"
        onClick={() => onClick("google")}
      >
        <Image
          src="/icons/github.svg"
          alt="Github Logo"
          width={22}
          height={22}
          className="object-contain invert dark:invert-0"
        />
        <span className="text-base">Continue with Github</span>
      </Button>

      <Button
        className={buttonClass}
        variant="ghost"
        onClick={() => onClick("github")}
      >
        <Image
          src="/icons/google.svg"
          alt="Google Logo"
          width={20}
          height={20}
          className="object-contain"
        />
        <span className="text-base">Continue with Google</span>
      </Button>
    </div>
  );
};

export default SocialAuthForm;
