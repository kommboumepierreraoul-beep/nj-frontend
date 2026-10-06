import { Mail, MessageCircle, MessageSquare, Phone, Share2, type LucideIcon } from "lucide-react";
import { translate } from "@/i18n/translate";

/**
 * Associe le nom d'icône libre saisi sur un canal de contact
 * (Doc/spec_pages_clients.md § 2 : « Texte ou sélecteur d'icône ») à son
 * équivalent lucide-react — même principe que `src/config/nav-icons.tsx` pour
 * la navigation. Les clés reprennent les valeurs des canaux pré-installés du
 * mockup (nj-client-data.js : mail, call, forum, share, chat) pour rester
 * cohérentes avec Email/Téléphone/WhatsApp ; un canal ajouté plus tard avec un
 * nom d'icône inconnu retombe sur l'icône générique `MessageSquare`.
 */
export const CHANNEL_ICONS: Record<string, LucideIcon> = {
  mail: Mail,
  email: Mail,
  call: Phone,
  phone: Phone,
  téléphone: Phone,
  telephone: Phone,
  forum: MessageCircle,
  whatsapp: MessageCircle,
  share: Share2,
  facebook: Share2,
  chat: MessageSquare,
};

export function getChannelIcon(name: string | null | undefined): LucideIcon {
  if (!name) return MessageSquare;
  return CHANNEL_ICONS[name.toLowerCase()] ?? MessageSquare;
}

/** Options proposées par le sélecteur d'icône du formulaire « Canal de contact ». */
export const CHANNEL_ICON_OPTIONS = [
  { value: "mail", label: "Email" },
  { value: "call", label: translate("badge.suppliers.communicationChannel.PHONE") },
  { value: "forum", label: "WhatsApp / messagerie" },
  { value: "share", label: translate("t.reseauSocial") },
  { value: "chat", label: translate("t.generique") },
];
