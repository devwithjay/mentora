import AuthForm from "@/components/forms/auth-form";
import SignInForm from "@/components/forms/sign-in-form";

const SignIn = () => {
  return (
    <AuthForm
      headerLabel="Welcome Back"
      backButtonMessage="Don't have an account yet?"
      backButtonLabel="Sign up"
      backButtonHref="/sign-up"
      showSocial
    >
      <SignInForm />
    </AuthForm>
  );
};

export default SignIn;
