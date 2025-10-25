import {Button} from "@/components/ui/button";

const SignUp = () => {
  return (
    <div>
      <Button
        variant="default"
        size="default"
        className="cursor-pointer bg-(--background-brand) text-white hover:bg-(--background-brand-hover)"
      >
        Sign Up Now
      </Button>
    </div>
  );
};

export default SignUp;
