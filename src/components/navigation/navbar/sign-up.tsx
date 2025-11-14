"use client";

import {useRouter} from "next/navigation";

import {Button} from "@/components/ui/button";
import ROUTES from "@/constants/routes";

const SignUp = () => {
  const router = useRouter();
  return (
    <div>
      <Button
        onClick={() => router.push(ROUTES.SIGN_UP)}
        variant="default"
        size="default"
        className="btn-primary w-full"
      >
        Sign Up Now
      </Button>
    </div>
  );
};

export default SignUp;
