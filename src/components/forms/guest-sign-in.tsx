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
      className="mt-8 min-h-10 w-full cursor-pointer py-2"
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
      Add commentMore actions
    </Button>
  );
};
