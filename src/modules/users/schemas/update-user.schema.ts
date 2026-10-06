import { z } from "zod";

/**
 * Doc/spec_pages_utilisateurs.md § C4 — `email_confirmation` est un champ de
 * saisie uniquement (jamais envoyé à l'API), demandé « pour limiter les
 * fautes de frappe vu l'impact sur la connexion ». `is_active` n'est pas ici
 * : géré par l'action séparée « Désactiver/Réactiver » (§ Actions rapides).
 */
export const updateUserSchema = z
  .object({
    full_name: z.string().min(1, "Le nom complet est obligatoire.").max(255),
    email: z.string().min(1, "L'email est obligatoire.").email("Format d'email invalide.").max(255),
    email_confirmation: z.string().min(1, "Merci de confirmer le nouvel email."),
    role: z.enum(["ADMIN", "SUPER_ADMIN"]),
  })
  .refine((data) => data.email === data.email_confirmation, {
    message: "Les deux emails ne correspondent pas.",
    path: ["email_confirmation"],
  });

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
