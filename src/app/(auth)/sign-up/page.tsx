import AuthForm from "@/components/forms/auth-form";
import SignUpForm from "@/components/forms/sign-up-form";
import ROUTES from "@/constants/routes";

const SignUp = () => {
  return (
    <AuthForm
      title="Join Mentora"
      subTitle="Create an account to get your personalized mental wellness guidance."
      backButtonMessage="Already have an account..?"
      backButtonLabel="Sign in"
      backButtonHref={ROUTES.SIGN_IN}
      showSocial
    >
      <SignUpForm />
    </AuthForm>
  );
};

export default SignUp;
