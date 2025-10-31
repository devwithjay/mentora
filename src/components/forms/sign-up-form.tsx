"use client";

import {useRouter} from "next/navigation";
import {useEffect, useTransition} from "react";

import {zodResolver} from "@hookform/resolvers/zod";
import {CircleUserRound, MailIcon, RotateCw, UserIcon} from "lucide-react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";

import IconInput from "@/components/icon-input";
import PasswordInput from "@/components/password-input";
import {Button} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ROUTES from "@/constants/routes";
import {SignUpSchema} from "@/lib/schemas";

const SignUpForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.setFocus("name");
  }, [form]);

  const onSubmit = (data: z.infer<typeof SignUpSchema>) => {
    startTransition(async () => {
      console.log(data);

      const result = {
        success: true,
        error: {
          message: null,
        },
      };

      if (result?.success) {
        form.reset();
        toast.success("Signed up successfully");

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
          name="username"
          render={({field}) => (
            <FormItem className="flex flex-col gap-3.5">
              <FormControl>
                <IconInput
                  field={field}
                  placeholder="Username"
                  disabled={isPending}
                  icon={UserIcon}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({field}) => (
            <FormItem className="flex flex-col gap-3.5">
              <FormControl>
                <IconInput
                  field={field}
                  placeholder="Name"
                  disabled={isPending}
                  icon={CircleUserRound}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
            <FormItem className="flex flex-col gap-3.5">
              <FormLabel className="font-normal">Password</FormLabel>
              <FormControl>
                <PasswordInput field={field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="mt-4 min-h-10 w-full cursor-pointer bg-[var(--background-brand)] px-4 py-2 text-white hover:bg-[var(--background-brand-hover)]"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <RotateCw className="animate-spin" />
              <span>Signing up...</span>
            </>
          ) : (
            <>Sign Up Now</>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SignUpForm;
