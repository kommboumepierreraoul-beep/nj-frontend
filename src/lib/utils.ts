import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Fusionne des classes Tailwind conditionnelles en résolvant les conflits
 * (ex. `cn("px-2", condition && "px-4")` garde bien "px-4"). Utilisé par tous
 * les composants de src/components/ui.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Génère un slug à partir d'un libellé (minuscules, accents retirés, séparateurs
 * `-`) — utilisé pour pré-remplir `slug`/`code` depuis `name` dans les
 * formulaires Produits/Catégories/Tags (Doc/spec_pages_produits.md : « slug
 * auto-généré depuis name, éditable »). Reste un point de départ modifiable
 * par l'utilisateur, jamais imposé côté validation.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
