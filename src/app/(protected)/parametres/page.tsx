"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  Award,
  Banknote,
  Building2,
  KeyRound,
  Lock,
  Megaphone,
  Paperclip,
  Percent,
  Plane,
  Ruler,
  ShieldCheck,
  SlidersHorizontal,
  Tag,
  Tags,
  Truck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/data-display/page-header";
import { InfoBanner } from "@/components/data-display/info-banner";
import { useAuthStore } from "@/stores/auth.store";
import { hasAnyPermission, hasRole } from "@/lib/auth/permissions";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/permissions";
import { translate } from "@/i18n/translate";

const INERT_MESSAGE = "Cette section n'est pas encore disponible.";

interface HubItem {
  label: string;
  hint: string;
  icon: LucideIcon;
  href: string | null;
  permissions?: string[];
  roles?: UserRole[];
}

interface HubDomain {
  key: string;
  title: string;
  description: string;
  items: HubItem[];
  /** Domaine entièrement hors périmètre API actuel (§ 8.2 de la spec) — bandeau d'avertissement dédié. */
  outOfScope?: string;
}

/**
 * Doc/design_system_maquette_complete.md § 5.10 « Paramètres (hub transverse) » —
 * page unique regroupant les six domaines de configuration du tableau § 5.10.
 * Chaque domaine reprend exactement les sections listées dans ce tableau ;
 * seul ajout : « Tags produits » dans Catalogue, référentiel déjà construit
 * (routes.products.tags) et absent du tableau par omission plutôt que par
 * exclusion volontaire — il a sa place naturelle ici au même titre que
 * Catégories/Attributs.
 *
 * Les entrées sans route (`href: null`) correspondent aux référentiels sans
 * endpoint API à ce jour (Entreprise entièrement, Numérotation & validité,
 * Documents, Unités de mesure — voir § 8.2 et § 5.10) : elles restent
 * visibles pour respecter le plan à 6 domaines de la maquette, mais rendues
 * inertes (survol atténué, clic → toast) au lieu de pointer vers une route
 * inventée — même convention que AppSidebar pour les entrées de menu sans
 * page correspondante.
 */
const buildDomains = (): HubDomain[] => [
  {
    key: "entreprise",
    title: "Entreprise",
    description: translate("t.identiteDeLEntrepriseMoyensDePaiementDevises"),
    items: [
      { label: translate("page.company.identitySection"), icon: Building2, hint: translate("t.informationsReprisesEnEnTeteDeTousLesDocumentsPdfP"), href: routes.settings.company, permissions: ["company_settings.view", "company_settings.manage"] },
      { label: "Moyens de paiement", icon: Wallet, hint: translate("t.comptesDeReglementImprimesAuBasDesProformasEtFactu2"), href: `${routes.settings.company}#moyens-de-paiement`, permissions: ["company_settings.view", "company_settings.manage"] },
      { label: "Devises", icon: Banknote, hint: translate("t.devisesProposeesDansLesFormulairesDeCommandeDePaie"), href: `${routes.settings.company}#devises`, permissions: ["company_settings.view", "company_settings.manage"] },
    ],
  },
  {
    key: "commercial",
    title: "Commercial",
    description: translate("t.baremesEtSeuilsAppliquesAuxCommandesEtALeurSuivi"),
    items: [
      { label: translate("guide.p.baremeDeCommission"), icon: Percent, hint: translate("t.paliersEvaluesDansLOrdreALaCreationDUneCommandeLaC"), href: routes.settings.commissions, permissions: ["sales_orders.view", "sales_orders.manage"] },
      { label: "Tarifs de transport", icon: Plane, hint: translate("t.grilleAerienneEtMaritimeUtiliseePourLEstimationLog"), href: routes.settings.shippingRates, permissions: ["sales_orders.view", "sales_orders.manage"] },
      { label: "Seuils d'analyse des flux", icon: SlidersHorizontal, hint: translate("t.limitesAuDelaDesquellesUneEtapeRemonteGoulot"), href: routes.settings.flowAnalyticsThresholds, permissions: ["flow_analytics.view"] },
      { label: translate("t.numerotationValidite"), icon: Tag, hint: translate("t.prefixesDesReferencesGenereesAutomatiquementEtDela"), href: null },
    ],
  },
  {
    key: "clients",
    title: "Clients",
    description: translate("t.referentielsUtilisesSurLesFichesEtFiltresClients"),
    items: [
      { label: translate("t.categoriesClientsProvenances"), icon: Award, hint: translate("t.segmentationDuPortefeuilleUtiliseeDansLesFiltresEt"), href: routes.clients.categories, permissions: ["clients.view", "clients.manage"] },
      { label: "Canaux de contact", icon: Megaphone, hint: translate("t.commentLeClientEstEntreEnRelationAvecNjGlobalTrade"), href: routes.clients.contactChannels, permissions: ["clients.view", "clients.manage"] },
    ],
  },
  {
    key: "catalogue",
    title: "Catalogue",
    description: translate("t.referentielsUtilisesSurLesFichesEtVariantesProduit"),
    items: [
      { label: translate("t.categoriesProduits"), icon: Tags, hint: "Arborescence du catalogue, reprise dans les fiches et les filtres produits.", href: routes.products.categories, permissions: ["products.view", "products.manage"] },
      { label: "Attributs de variante", icon: SlidersHorizontal, hint: translate("t.caracteristiquesDeclinantUnProduitEnVariantesCoule"), href: routes.products.attributes, permissions: ["products.view", "products.manage"] },
      { label: "Tags produits", icon: Tag, hint: translate("t.etiquettesLibresUtiliseesPourRetrouverEtRegrouperD"), href: routes.products.tags, permissions: ["products.view", "products.manage"] },
      { label: translate("t.unitesDeMesure"), icon: Ruler, hint: translate("t.unitesProposeesSurLesLignesDeCommandeEtLesFichesPr"), href: null },
    ],
  },
  {
    key: "documents",
    title: "Documents",
    description: translate("t.referentielsTransversesLiesAuxPiecesJointesEtAuTra"),
    items: [
      { label: translate("t.typesDePiecesJointes"), icon: Paperclip, hint: translate("t.valeursProposeesDansLeSelecteurTypeDeMediaDesPiece"), href: null },
      { label: "Modes de transport", icon: Truck, hint: translate("t.modesProposesSurLaCommandeEtAffichesSurLesDocument"), href: null },
    ],
  },
  {
    key: "acces",
    title: translate("nav.settings.access"),
    description: "Rôles et permissions applicables aux comptes administrateurs.",
    items: [
      { label: "Rôles", icon: ShieldCheck, hint: "Rôles attribuables aux utilisateurs. Un SUPER_ADMIN passe toujours outre les permissions.", href: routes.users.roles, roles: ["SUPER_ADMIN"] },
      { label: "Catalogue des permissions", icon: KeyRound, hint: "Permissions fines contrôlant chaque action de l'API, en lecture seule.", href: routes.users.permissionsCatalog, roles: ["SUPER_ADMIN"] },
    ],
  },
];

export default function SettingsHubPage() {
  const user = useAuthStore((state) => state.user);

  const isItemVisible = (item: HubItem) => {
    if (!item.href) return true;
    if (item.roles && !item.roles.some((role) => hasRole(user, role))) return false;
    if (item.permissions && !hasAnyPermission(user, item.permissions)) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Tableau de bord", href: routes.dashboard.home }, { label: translate("nav.settings") }]}
        title={translate("page.settings.title")}
        description={translate("page.settings.desc")}
      />

      <InfoBanner>
        Deux règles valent partout : désactiver conserve l&apos;historique là où supprimer l&apos;efface, et une valeur déjà utilisée sur un document émis n&apos;est jamais réécrite rétroactivement.
      </InfoBanner>

      <div className="space-y-8">
        {buildDomains().map((domain) => {
          const visibleItems = domain.items.filter(isItemVisible);
          if (visibleItems.length === 0) return null;

          return (
            <section key={domain.key} className="space-y-3">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{domain.title}</h2>
                <p className="text-xs text-text-tertiary">{domain.description}</p>
              </div>

              {domain.outOfScope ? <InfoBanner className="text-xs">{domain.outOfScope}</InfoBanner> : null}

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map((item) => {
                  const inert = !item.href;
                  const cardClassName = cn(
                    "flex flex-col gap-3 rounded-[14px] border border-border bg-surface p-[18px] text-left transition-colors",
                    inert ? "cursor-pointer opacity-70 hover:border-border" : "cursor-pointer hover:border-accent hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]",
                  );

                  const cardBody = (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[10px] bg-accent-bg">
                          <item.icon className="h-5 w-5 text-link" />
                        </div>
                        {inert ? <Lock className="h-3.5 w-3.5 flex-none text-text-tertiary" /> : null}
                      </div>
                      <div className="text-[15px] font-bold tracking-[-0.01em] text-foreground">{item.label}</div>
                      <p className="text-xs leading-[1.5] text-text-tertiary text-pretty">{item.hint}</p>
                      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-2.5">
                        <span className="text-xs font-semibold text-muted-foreground">{inert ? "Non disponible" : "Configurer"}</span>
                        {!inert && <ArrowRight className="h-4 w-4 text-accent" />}
                      </div>
                    </>
                  );

                  return item.href ? (
                    <Link key={item.label} href={item.href} className={cardClassName}>
                      {cardBody}
                    </Link>
                  ) : (
                    <button key={item.label} type="button" onClick={() => toast.info(INERT_MESSAGE)} className={cardClassName}>
                      {cardBody}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
