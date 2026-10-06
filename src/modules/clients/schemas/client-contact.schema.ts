import { z } from "zod";

export const clientContactSchema = z.object({
  channel_type_id: z.coerce.number().int({ message: "Le canal est requis." }),
  value: z.string().min(1, "La valeur est requise.").max(255),
  label: z.string().max(255).optional().or(z.literal("")),
  is_preferred: z.boolean(),
});

export type ClientContactSchema = z.infer<typeof clientContactSchema>;
