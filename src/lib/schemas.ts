import {z} from "zod/v4";

export const SignInSchema = z.object({
  email: z.email({message: "Please provide a valid email address."}),

  password: z
    .string()
    .min(6, {message: "Password must be at least 6 characters long."})
    .max(100, {message: "Password cannot exceed 100 characters."}),
});
