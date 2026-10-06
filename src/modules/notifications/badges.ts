import { ShoppingCart, Truck, CreditCard, Receipt, LineChart, Shield, type LucideIcon } from "lucide-react";
import type { BadgeProps } from "@/components/ui/badge";
import type { NotificationCategory, NotificationPriority } from "./types";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_notifications.md § Badges — couleurs réutilisées des modules existants plutôt qu'inventées (COMMANDE↔Commandes clients, ACHAT↔Fournisseurs, PAIEMENT↔Factures/encaissements). */
export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  get COMMANDE() { return translate("badge.notifications.category.COMMANDE"); },
  get ACHAT() { return translate("badge.notifications.category.ACHAT"); },
  get PAIEMENT() { return translate("badge.notifications.category.PAIEMENT"); },
  get RELANCE() { return translate("badge.notifications.category.RELANCE"); },
  get FLUX() { return translate("badge.notifications.category.FLUX"); },
  get SECURITE() { return translate("badge.notifications.category.SECURITE"); },
};

export const CATEGORY_TONES: Record<NotificationCategory, NonNullable<BadgeProps["tone"]>> = {
  COMMANDE: "warning",
  ACHAT: "suppliers",
  PAIEMENT: "success",
  RELANCE: "destructive",
  FLUX: "accent",
  SECURITE: "neutral",
};

/** Icône de catégorie (NJ Global Trade Notifications.dc.html § catégories / nj-notification-data.js) — reprend les icônes déjà associées à chaque module dans `src/config/nav-icons.tsx` (shopping_cart/local_shipping/credit_card/receipt_long/monitoring) plutôt que d'en inventer ; `shield` (Sécurité) n'a pas d'entrée de menu dédiée. */
export const CATEGORY_ICONS: Record<NotificationCategory, LucideIcon> = {
  COMMANDE: ShoppingCart,
  ACHAT: Truck,
  PAIEMENT: CreditCard,
  RELANCE: Receipt,
  FLUX: LineChart,
  SECURITE: Shield,
};

/** Puce d'icône 34×34 (voir `kpi-card.tsx`/`audit`) déclinée pour les tons de `CATEGORY_TONES` — mêmes jetons Tailwind que les badges, jamais une couleur ad hoc. */
export const CATEGORY_ICON_BOX_CLASSES: Record<NotificationCategory, string> = {
  COMMANDE: "bg-warning-bg text-warning",
  ACHAT: "bg-module-suppliers-bg text-module-suppliers",
  PAIEMENT: "bg-success-bg text-success",
  RELANCE: "bg-destructive-bg text-destructive",
  FLUX: "bg-accent-bg text-accent-hover",
  SECURITE: "bg-neutral-bg text-neutral",
};

/** Doc/spec_pages_notifications.md § 3 (tableau « Libellé suggéré ») — libellés longs propres à la page Préférences, plus descriptifs que `CATEGORY_LABELS` (réservé aux badges de la liste/cloche). */
export const CATEGORY_PREFERENCE_LABELS: Record<NotificationCategory, string> = {
  get COMMANDE() { return translate("badge.notifications.categoryPreference.COMMANDE"); },
  get ACHAT() { return translate("badge.notifications.categoryPreference.ACHAT"); },
  get PAIEMENT() { return translate("badge.notifications.categoryPreference.PAIEMENT"); },
  get RELANCE() { return translate("badge.notifications.categoryPreference.RELANCE"); },
  get FLUX() { return translate("badge.notifications.categoryPreference.FLUX"); },
  get SECURITE() { return translate("badge.notifications.categoryPreference.SECURITE"); },
};

/** Aide contextuelle sous chaque ligne de la page Préférences (nj-notification-data.js § CATEGORIES.help) — reprend les libellés déjà associés à chaque catégorie plutôt que d'en inventer. */
export const CATEGORY_HELP_TEXT: Record<NotificationCategory, string> = {
  get COMMANDE() { return translate("badge.notifications.categoryHelp.COMMANDE"); },
  get ACHAT() { return translate("badge.notifications.categoryHelp.ACHAT"); },
  get PAIEMENT() { return translate("badge.notifications.categoryHelp.PAIEMENT"); },
  get RELANCE() { return translate("badge.notifications.categoryHelp.RELANCE"); },
  get FLUX() { return translate("badge.notifications.categoryHelp.FLUX"); },
  get SECURITE() { return translate("badge.notifications.categoryHelp.SECURITE"); },
};

export const PRIORITY_LABELS: Record<NotificationPriority, string> = {
  get INFO() { return translate("badge.notifications.priority.INFO"); },
  get IMPORTANT() { return translate("badge.notifications.priority.IMPORTANT"); },
  get CRITIQUE() { return translate("badge.notifications.priority.CRITIQUE"); },
};

export const PRIORITY_TONES: Record<NotificationPriority, NonNullable<BadgeProps["tone"]>> = {
  INFO: "neutral",
  IMPORTANT: "warning",
  CRITIQUE: "destructive",
};
