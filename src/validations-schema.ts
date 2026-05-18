import { z } from "zod";
export const createUserSchema = z
  .object({
    firstName: z
      .string()
      .min(2, { message: "First name must be at least 2 characters long" }),
    lastName: z
      .string()
      .min(2, { message: "Last name must be at least 2 characters long" }),
    userName: z
      .string()
      .min(2, { message: "Username must be at least 2 characters long" }),
    email: z.string().email({ message: "invalid email address" }),
    password: z
      .string()
      .min(4, { message: "Password must be at least 4 characters long" }),
    passwordConfirmation: z.string().min(4, {
      message: "Password confirmation must be at least 4 characters long",
    }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
  });

// export const adminSchema = z.object({})
export const loginSchema = z.object({
  email: z.string().email({ message: "invalid email address" }),
  password: z
    .string()
    .min(4, { message: "Password must be at least 4 characters long" }),
});

export const resetPassword = z.object({
  email: z.string().email({ message: "invalid email address" }),
});
