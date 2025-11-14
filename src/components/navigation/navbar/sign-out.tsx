"use client";

import {LogOut} from "lucide-react";
import {signOut} from "next-auth/react";

import {Button} from "@/components/ui/button";
import ROUTES from "@/constants/routes";

const Logout = () => {
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: ROUTES.HOME,
      redirect: true,
    });
  };

  return (
    <Button
      onClick={handleSignOut}
      className="-ml-2.5 h-fit cursor-pointer p-0 font-normal dark:hover:bg-transparent"
      variant="ghost"
    >
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  );
};

export default Logout;
