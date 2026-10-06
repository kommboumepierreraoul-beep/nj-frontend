import type { LucideIcon } from "lucide-react";
import {
  Building2,
  BadgePercent,
  LayoutDashboard,
  Loader2,
  Moon,
  PanelLeft,
  ReceiptText,
  Rocket,
  Smartphone,
} from "lucide-react";

/**
 * Guide interactif de présentation (style « nouveautés » des modales rapides
 * de Figma). Sert deux usages :
 *  1. première visite — présenter le système ;
 *  2. mises à jour futures — décrire ce qui change, marqué « Nouveau ».
 *
 * Pour annoncer une future mise à jour : bumper `WHATS_NEW_RELEASE` et ajouter
 * les étapes correspondantes avec `since` = cette nouvelle valeur. Les étapes
 * dont `since === WHATS_NEW_RELEASE` portent le badge « Nouveau » ; le reste
 * fait office de rappel de contexte.
 */
export const WHATS_NEW_RELEASE = "2026.09";

/** Clé localStorage : dernière version vue par cet appareil. */
export const WHATS_NEW_STORAGE_KEY = "nj.whatsNew";

export interface WhatsNewStep {
  id: string;
  /** Version qui a introduit ce point. */
  since: string;
  icon: LucideIcon;
  /** Clés i18n (src/i18n/messages.ts, namespace `whatsNew.*`). */
  titleKey: string;
  bodyKey: string;
}

export const WHATS_NEW_STEPS: WhatsNewStep[] = [
  {
    id: "welcome",
    since: "2026.09",
    icon: Rocket,
    titleKey: "whatsNew.welcome.title",
    bodyKey: "whatsNew.welcome.body",
  },
  {
    id: "dashboard",
    since: "2026.09",
    icon: LayoutDashboard,
    titleKey: "whatsNew.dashboard.title",
    bodyKey: "whatsNew.dashboard.body",
  },
  {
    id: "myspace",
    since: "2026.09",
    icon: PanelLeft,
    titleKey: "whatsNew.myspace.title",
    bodyKey: "whatsNew.myspace.body",
  },
  {
    id: "receipt",
    since: "2026.09",
    icon: ReceiptText,
    titleKey: "whatsNew.receipt.title",
    bodyKey: "whatsNew.receipt.body",
  },
  {
    id: "vat",
    since: "2026.09",
    icon: BadgePercent,
    titleKey: "whatsNew.vat.title",
    bodyKey: "whatsNew.vat.body",
  },
  {
    id: "theme",
    since: "2026.09",
    icon: Moon,
    titleKey: "whatsNew.theme.title",
    bodyKey: "whatsNew.theme.body",
  },
  {
    id: "progress",
    since: "2026.09",
    icon: Loader2,
    titleKey: "whatsNew.progress.title",
    bodyKey: "whatsNew.progress.body",
  },
  {
    id: "mobile",
    since: "2026.09",
    icon: Smartphone,
    titleKey: "whatsNew.mobile.title",
    bodyKey: "whatsNew.mobile.body",
  },
  {
    id: "bilingual",
    since: "2026.09",
    icon: Building2,
    titleKey: "whatsNew.bilingual.title",
    bodyKey: "whatsNew.bilingual.body",
  },
];
