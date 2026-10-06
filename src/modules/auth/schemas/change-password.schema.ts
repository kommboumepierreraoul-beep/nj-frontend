import { z } from "zod";

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Le mot de passe actuel est requis."),
    password: z.string().min(8, "8 caractères minimum."),
    password_confirmation: z.string().min(1, "Confirmez le nouveau mot de passe."),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["password_confirmation"],
  });

export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
