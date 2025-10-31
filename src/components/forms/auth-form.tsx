import type {Route} from "next";
import Link from "next/link";
import {ReactNode} from "react";

import ROUTES from "@/constants/routes";
import {cn} from "@/lib/utils";

import Logo from "../navigation/navbar/logo";
import SocialAuthForm from "./social-auth-form";

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
        <Logo className="mb-2 scale-125" />

        <h1 className={cn("text-2xl font-semibold text-(--text-primary)")}>
          {title}
        </h1>

        <p className="text-(-text-secondary) max-w-[300px] text-sm leading-relaxed">
          {subTitle}
        </p>
      </div>

      <div className="mt-8 w-full">{children}</div>

      <div className="my-4 flex items-center">
        <div className="grow border border-(--border-primary)"></div>
        <div className="text-(-text-secondary) px-2 text-xs">OR</div>
        <div className="grow border border-(--border-primary)"></div>
      </div>

      {showSocial && <SocialAuthForm />}

      <Link
        href={backButtonHref || ROUTES.HOME}
        className="text-(-text-secondary) mt-6 inline-block w-full text-center text-base font-light"
      >
        {backButtonMessage}
        <span className="ml-1.5 font-medium text-(--text-brand)">
          {backButtonLabel}
        </span>
      </Link>
    </section>
  );
};

export default AuthForm;
