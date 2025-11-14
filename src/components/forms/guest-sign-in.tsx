"use client";

import {useRouter} from "next/navigation";
import {useTransition} from "react";

import {RotateCw} from "lucide-react";
import {toast} from "sonner";

import {signInAsGuest} from "@/actions";
import {Button} from "@/components/ui/button";
import ROUTES from "@/constants/routes";

export const GuestSignIn = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const result = await signInAsGuest();

      if (result?.success) {
        toast.success("Signed in as guest successfully");

        router.replace(ROUTES.HOME);
      } else {
        toast.error(`Error ${result?.status}`, {
          description: result?.error?.message,
        });
      }
    });
  };

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className="border-primary text-secondary mt-4 min-h-11 w-full cursor-pointer border bg-transparent text-base shadow-none dark:hover:bg-transparent"
      disabled={isPending}
    >
      {isPending ? (
        <>
          <RotateCw className="animate-spin" />
          <span>Signing in...</span>
        </>
      ) : (
        <>Continue as Guest</>
      )}
    </Button>
  );
};
