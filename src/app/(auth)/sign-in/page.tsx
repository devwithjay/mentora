import AuthForm from "@/components/forms/auth-form";
import SignInForm from "@/components/forms/sign-in-form";
import ROUTES from "@/constants/routes";

const SignIn = () => {
  return (
    <AuthForm
      title="Welcome Back"
      subTitle="Login to continue your mental wellness journey."
      backButtonMessage="Don't have an account yet?"
      backButtonLabel="Sign up"
      backButtonHref={ROUTES.SIGN_UP}
      showSocial
    >
      <SignInForm />
    </AuthForm>
  );
};

export default SignIn;
