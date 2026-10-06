import { z } from "zod";

export const contactChannelSchema = z.object({
  code: z.string().min(1, "Le code est requis.").max(255),
  label: z.string().min(1, "Le libellé est requis.").max(255),
  icon: z.string().max(255).optional().or(z.literal("")),
  is_active: z.boolean(),
});

export type ContactChannelSchema = z.infer<typeof contactChannelSchema>;
