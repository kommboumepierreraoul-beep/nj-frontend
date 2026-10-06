/**
 * Types du module Notifications (Doc/spec_pages_notifications.md). Ressource
 * strictement personnelle — pas de permission de rôle, chaque utilisateur ne
 * voit que ses propres notifications/préférences. Canaux livrés : in-app
 * (toujours actif) et email uniquement (SMS/WhatsApp retirés le 2026-08-27).
 */
export type NotificationCategory = "COMMANDE" | "ACHAT" | "PAIEMENT" | "RELANCE" | "FLUX" | "SECURITE";
export type NotificationPriority = "INFO" | "IMPORTANT" | "CRITIQUE";

export interface NotificationData {
  link?: string;
  [key: string]: unknown;
}

export interface Notification {
  id: number;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  body: string;
  data: NotificationData | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListFilters {
  category?: NotificationCategory;
  priority?: NotificationPriority;
  read?: "" | "true" | "false";
  per_page?: number;
  page?: number;
}

/** § 3 — une ligne par catégorie, `email_enabled` seul champ modifiable (in-app toujours actif, pas de colonne). */
export interface NotificationPreference {
  category: NotificationCategory;
  email_enabled: boolean;
}

export interface UpdateNotificationPreferencesPayload {
  preferences: NotificationPreference[];
}
