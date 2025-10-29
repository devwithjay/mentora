import type {Route} from "next";
import {Poppins} from "next/font/google";
import Link from "next/link";
import {ReactNode} from "react";

import {cn} from "@/lib/utils";

import SocialAuthForm from "./social-auth-form";

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

type AuthFormProps = {
  children: ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonMessage: string;
  backButtonHref: Route<string> | URL;
  showSocial?: boolean;
};

const AuthForm = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonMessage,
  backButtonHref,
  showSocial,
}: AuthFormProps) => {
  return (
    <section className="min-w-full rounded-[10px] border px-6 py-10 shadow-md sm:min-w-[450px] sm:px-8">
      <div className="flex w-full flex-col items-center justify-center gap-y-4">
        <h1 className={cn("text-3xl font-semibold", font.className)}>
          Mentora
        </h1>
        <p className="text-muted-foreground text-sm">{headerLabel}</p>
      </div>

      {children}

      {showSocial && <SocialAuthForm />}

      <Link
        href={backButtonHref || "/"}
        className="mt-6 inline-block w-full cursor-pointer text-center text-sm font-light"
      >
        {backButtonMessage}
        <span className="ml-1.5 font-medium">{backButtonLabel}</span>
      </Link>
    </section>
  );
};

export default AuthForm;
