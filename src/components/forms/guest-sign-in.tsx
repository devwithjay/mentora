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
      variant="outline"
      onClick={onClick}
      className="text-secondary border-primary mt-4 flex min-h-11 w-full cursor-pointer gap-4 border bg-transparent text-base shadow-none hover:bg-transparent"
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
