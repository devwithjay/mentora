import {Button} from "@/components/ui/button";

const Login = () => {
  return (
    <div>
      <Button
        variant="ghost"
        size="default"
        className="cursor-pointer border border-(--border-primary) text-(--text-primary)"
      >
        Login
      </Button>
    </div>
  );
};

export default Login;
