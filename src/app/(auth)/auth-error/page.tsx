import {ExclamationTriangleIcon} from "@radix-ui/react-icons";

import AuthForm from "@/components/forms/auth-form";

const AuthErrorPage = () => {
  return (
    <AuthForm
      title=""
      subTitle="Something went wrong"
      backButtonLabel="Back to signin"
      backButtonMessage=""
      backButtonHref="/sign-in"
    >
      <div className="flex w-full items-center justify-center">
        <ExclamationTriangleIcon className="text-destructive mt-8 size-5" />
      </div>
    </AuthForm>
  );
};

export default AuthErrorPage;
