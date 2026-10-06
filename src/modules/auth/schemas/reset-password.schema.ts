import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "8 caractères minimum."),
    password_confirmation: z.string().min(1, "Confirmez le mot de passe."),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["password_confirmation"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
