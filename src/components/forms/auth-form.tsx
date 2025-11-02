import type {Route} from "next";
import Link from "next/link";
import {ReactNode} from "react";

import SocialAuthForm from "@/components/forms/social-auth-form";
import Logo from "@/components/navigation/navbar/logo";
import ROUTES from "@/constants/routes";
import {cn} from "@/lib/utils";

type AuthFormProps = {
  children: ReactNode;
  title: string;
  subTitle: string;
  backButtonLabel: string;
  backButtonMessage: string;
  backButtonHref: Route<string> | URL;
  showSocial?: boolean;
};

const AuthForm = ({
  children,
  title,
  subTitle,
  backButtonLabel,
  backButtonMessage,
  backButtonHref,
  showSocial = false,
}: AuthFormProps) => {
  return (
    <section className="w-full max-w-[410px] scale-95 rounded-xl px-6 py-10 sm:px-8">
      <div className="flex w-full flex-col items-center justify-center gap-y-4 text-center">
        <Logo className="mb-2 scale-150" />

        <h1 className={cn("text-primary text-2xl font-semibold")}>{title}</h1>
        <p className="text-secondary max-w-[340px] text-sm leading-relaxed">
          {subTitle}
        </p>
      </div>

      <div className="mt-8 w-full">{children}</div>

      <div className="my-4 flex items-center">
        <div className="border-primary grow border"></div>
        <div className="text-secondary px-2 text-xs">OR</div>
        <div className="border-primary grow border"></div>
      </div>

      {showSocial && <SocialAuthForm />}

      <Link
        href={backButtonHref || ROUTES.HOME}
        className="text-secondary mt-6 inline-block w-full text-center text-base font-light"
      >
        {backButtonMessage}
        <span className="text-brand ml-1.5 font-medium">{backButtonLabel}</span>
      </Link>
    </section>
  );
};

export default AuthForm;
