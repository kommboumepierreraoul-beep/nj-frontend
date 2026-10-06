import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "L'email est requis.").email("Email invalide."),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
