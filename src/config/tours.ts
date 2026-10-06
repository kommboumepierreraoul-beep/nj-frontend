import { routes } from "./routes";

/**
 * Visites guidées interactives lancées depuis le panneau « Prise en main »
 * (src/config/quick-start.ts). Chaque étape éclaire un élément réel de la page
 * (découpe dans le voile + anneau doré + curseur animé qui pointe l'élément) et
 * affiche une consigne. Une étape `advanceOn: "click"` attend que l'utilisateur
 * clique l'élément surligné pour passer à la suivante — c'est ainsi qu'on
 * enchaîne « ouvrir le formulaire » puis « remplir les champs ».
 *
 * Les sélecteurs visent des attributs `data-tour="…"` stables :
 *  - `list-new`        : bouton « + Nouveau … » d'une page de liste (ListPageActions)
 *  - `dialog-form`     : en-tête d'un formulaire en modal (DialogFormHeader)
 *  - `dialog-submit`   : pied d'un formulaire en modal (DialogFormFooter)
 *  - `company-*`       : sections de Paramètres → Entreprise
 *
 * `localStorage` :
 *  - `nj.tour.pending`   : id de visite à démarrer après navigation
 *  - `nj.tour.seen.<id>` : "done" | "skipped" (n'empêche pas de relancer)
 */
export const TOUR_PENDING_KEY = "nj.tour.pending";
export const TOUR_SEEN_PREFIX = "nj.tour.seen.";
export const TOUR_START_EVENT = "nj:start-tour";

export type TourPlacement = "top" | "bottom" | "left" | "right" | "auto";

export interface TourStep {
  selector: string;
  titleKey: string;
  bodyKey: string;
  placement?: TourPlacement;
  /** L'étape avance quand l'utilisateur clique l'élément surligné (au lieu du bouton « Suivant »). */
  advanceOn?: "click";
}

export interface Tour {
  id: string;
  /** Route sur laquelle la visite se déroule (le TourHost ne démarre que si le pathname correspond). */
  route: string;
  steps: TourStep[];
}

const createEntitySteps = (entity: "client" | "product" | "order"): TourStep[] => [
  {
    selector: '[data-tour="list-new"]',
    titleKey: `tour.${entity}.open.title`,
    bodyKey: `tour.${entity}.open.body`,
    placement: "bottom",
    advanceOn: "click",
  },
  {
    selector: '[data-tour="dialog-form"]',
    titleKey: `tour.${entity}.fill.title`,
    bodyKey: `tour.${entity}.fill.body`,
    placement: "bottom",
  },
  {
    selector: '[data-tour="dialog-submit"]',
    titleKey: `tour.${entity}.save.title`,
    bodyKey: `tour.${entity}.save.body`,
    placement: "top",
  },
];

export const TOURS: Record<string, Tour> = {
  company: {
    id: "company",
    route: routes.settings.company,
    steps: [
      { selector: '[data-tour="company-identity"]', titleKey: "tour.company.identity.title", bodyKey: "tour.company.identity.body", placement: "auto" },
      { selector: '[data-tour="company-payment-methods"]', titleKey: "tour.company.payments.title", bodyKey: "tour.company.payments.body", placement: "auto" },
      { selector: '[data-tour="company-currencies"]', titleKey: "tour.company.currencies.title", bodyKey: "tour.company.currencies.body", placement: "auto" },
    ],
  },
  client: { id: "client", route: routes.clients.list, steps: createEntitySteps("client") },
  product: { id: "product", route: routes.products.list, steps: createEntitySteps("product") },
  order: { id: "order", route: routes.salesOrders.list, steps: createEntitySteps("order") },
};

export function tourSeenKey(id: string): string {
  return TOUR_SEEN_PREFIX + id;
}
