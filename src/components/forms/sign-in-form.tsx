"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, useTransition} from "react";

import {zodResolver} from "@hookform/resolvers/zod";
import {MailIcon, RotateCw} from "lucide-react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import {signInWithCredentials} from "@/actions";
import IconInput from "@/components/icon-input";
import PasswordInput from "@/components/password-input";
import {Button} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import ROUTES from "@/constants/routes";
import {SignInSchema} from "@/lib/schemas";

const SignInForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SignInSchema>>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.setFocus("email");
  }, [form]);

  const onSubmit = (data: z.infer<typeof SignInSchema>) => {
    startTransition(async () => {
      const result = await signInWithCredentials(data);

      if (result?.success) {
        form.reset();
        toast.success("Signed in successfully");

        router.replace(ROUTES.HOME);
      } else {
        toast.error(result?.error?.message || "Something went wrong");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({field}) => (
            <FormItem className="flex flex-col gap-3.5">
              <FormControl>
                <IconInput
                  field={field}
                  placeholder="alex@gmail.com"
                  disabled={isPending}
                  icon={MailIcon}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({field}) => (
            <FormItem className="gap-3.5">
              <FormControl>
                <PasswordInput field={field} disabled={isPending} />
              </FormControl>
              <FormMessage />
              <div className="text-brand mt-1.5 hidden text-left text-base">
                <Link href="/">Forgot password..?</Link>
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="btn-primary min-h-11 w-full px-4 py-2"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <RotateCw className="animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>Sign In</>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SignInForm;
