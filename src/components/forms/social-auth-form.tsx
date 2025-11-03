"use client";

import Image from "next/image";

import {Button} from "@/components/ui/button";

const SocialAuthForm = () => {
  const buttonClass =
    "min-h-11 w-full cursor-pointer bg-transparent dark:hover:bg-transparent border-primary border-1 shadow-none text-secondary";

  return (
    <div className="mt-6 flex flex-col gap-4">
      <Button className={buttonClass} onClick={() => {}} variant="ghost">
        <Image
          src="/icons/github.svg"
          alt="Github Logo"
          width={22}
          height={22}
          className="object-contain invert dark:invert-0"
        />
        <span className="text-base">Continue with Github</span>
      </Button>

      <Button className={buttonClass} onClick={() => {}}>
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
