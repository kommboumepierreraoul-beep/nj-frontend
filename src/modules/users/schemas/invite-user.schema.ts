import { z } from "zod";

/** Doc/spec_pages_utilisateurs.md § C3 — aucun mot de passe transmis, l'utilisateur définit le sien via le lien d'invitation. */
export const inviteUserSchema = z.object({
  full_name: z.string().min(1, "Le nom complet est obligatoire.").max(255),
  email: z.string().min(1, "L'email est obligatoire.").email("Format d'email invalide.").max(255),
  role: z.enum(["ADMIN", "SUPER_ADMIN"]),
});

export type InviteUserSchema = z.infer<typeof inviteUserSchema>;
