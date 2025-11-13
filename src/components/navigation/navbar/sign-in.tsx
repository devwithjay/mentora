"use client";

import {useRouter} from "next/navigation";

import {Button} from "@/components/ui/button";
import ROUTES from "@/constants/routes";

const Login = () => {
  const router = useRouter();

  return (
    <>
      <Button
        variant="ghost"
        className="btn-secondary"
        onClick={() => router.push(ROUTES.SIGN_IN)}
      >
        Login
      </Button>
    </>
  );
};

export default Login;
