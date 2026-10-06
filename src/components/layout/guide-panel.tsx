"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ChevronDown,
  Download,
  HelpCircle,
  LayoutPanelLeft,
  Loader2,
  MousePointerClick,
  PanelLeftClose,
  Search,
  Settings,
  Sparkles,
  SunMoon,
  UserCircle2,
  X,
} from "lucide-react";
import { translate } from "@/i18n/translate";
import { cn } from "@/lib/utils";

export interface GuideRow {
  kind: "Élément" | "Bouton";
  icon: React.ReactNode;
  label: string;
  text: string;
}

export interface GuideGroup {
  title: string;
  icon: React.ReactNode;
  rows: GuideRow[];
}

/**
 * Panneau « Guide » ⌘//Ctrl+/ (§ 2.3, § 4.6 : « qu'il est recommandé de
 * conserver dans l'implémentation réelle »), calqué sur NJ Global Trade
 * Dashboard.dc.html lignes 182-233 — même structure (tiroir plein écran
 * depuis la droite, 480px, groupes accordéon), même contenu que
 * `SHELL_GUIDE` de nj-shell.js pour la partie transverse (navigation +
 * outils d'en-tête + formulaires). Le contenu par écran (« son contenu suit
 * l'écran affiché » côté maquette) reste à construire page par page — ce
 * panneau documente pour l'instant ce qui est identique partout.
 */
// Construit à l'appel (et non au chargement du module) pour lire la locale
// active une fois le LocaleProvider monté.
function buildGroups(): GuideGroup[] {
  return [
  {
    title: translate("guide.nav.title"),
    icon: <LayoutPanelLeft className="h-5 w-5" />,
    rows: [
      {
        kind: "Élément",
        icon: <LayoutPanelLeft className="h-[19px] w-[19px]" />,
        label: translate("guide.nav.sidebar.label"),
        text: translate("guide.nav.sidebar.text"),
      },
      {
        kind: "Bouton",
        icon: <ChevronDown className="h-[19px] w-[19px]" />,
        label: translate("guide.nav.chevron.label"),
        text: translate("guide.nav.chevron.text"),
      },
      {
        kind: "Bouton",
        icon: <PanelLeftClose className="h-[19px] w-[19px]" />,
        label: translate("guide.nav.collapse.label"),
        text: translate("guide.nav.collapse.text"),
      },
      {
        kind: "Bouton",
        icon: <Settings className="h-[19px] w-[19px]" />,
        label: translate("guide.nav.settings.label"),
        text: translate("guide.nav.settings.text"),
      },
    ],
  },
  {
    title: translate("guide.header.title"),
    icon: <Sparkles className="h-5 w-5" />,
    rows: [
      {
        kind: "Bouton",
        icon: <Search className="h-[19px] w-[19px]" />,
        label: translate("guide.header.search.label"),
        text: translate("guide.header.search.text"),
      },
      {
        kind: "Bouton",
        icon: <Sparkles className="h-[19px] w-[19px]" />,
        label: translate("guide.header.notifications.label"),
        text: translate("guide.header.notifications.text"),
      },
      {
        kind: "Bouton",
        icon: <HelpCircle className="h-[19px] w-[19px]" />,
        label: translate("guide.header.guide.label"),
        text: translate("guide.header.guide.text"),
      },
      {
        kind: "Bouton",
        icon: <SunMoon className="h-[19px] w-[19px]" />,
        label: translate("guide.header.theme.label"),
        text: translate("guide.header.theme.text"),
      },
      {
        kind: "Bouton",
        icon: <UserCircle2 className="h-[19px] w-[19px]" />,
        label: translate("guide.header.profile.label"),
        text: translate("guide.header.profile.text"),
      },
    ],
  },
  {
    title: translate("guide.forms.title"),
    icon: <MousePointerClick className="h-5 w-5" />,
    rows: [
      {
        kind: "Bouton",
        icon: <HelpCircle className="h-[19px] w-[19px]" />,
        label: translate("guide.forms.fieldHelp.label"),
        text: translate("guide.forms.fieldHelp.text"),
      },
      {
        kind: "Élément",
        icon: <span className="text-[15px] font-bold leading-none">*</span>,
        label: translate("guide.forms.required.label"),
        text: translate("guide.forms.required.text"),
      },
      {
        kind: "Bouton",
        icon: <Download className="h-[19px] w-[19px]" />,
        label: translate("guide.forms.export.label"),
        text: translate("guide.forms.export.text"),
      },
      {
        kind: "Élément",
        icon: <Loader2 className="h-[19px] w-[19px]" />,
        label: translate("guide.forms.progress.label"),
        text: translate("guide.forms.progress.text"),
      },
    ],
  },
  ];
}

export function GuidePanel({
  open,
  onOpenChange,
  sections,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Groupes propres à l'écran courant (§ 4.6 : « son contenu suit l'écran affiché ») — affichés avant les groupes transverses. */
  sections?: GuideGroup[];
}) {
  // Groupes propres à la page en premier (ouverts par défaut), puis les groupes transverses.
  const transverse = buildGroups();
  const allGroups = sections && sections.length > 0 ? [...sections, ...transverse] : transverse;
  const [openTitle, setOpenTitle] = useState<string>(allGroups[0].title);

  // Rouvre le 1er groupe quand on change d'écran (le guide propre à la page passe devant).
  // Ajustement pendant le rendu (react.dev/learn/you-might-not-need-an-effect), pas d'effet.
  const [lastFirstTitle, setLastFirstTitle] = useState(allGroups[0].title);
  if (allGroups[0].title !== lastFirstTitle) {
    setLastFirstTitle(allGroups[0].title);
    setOpenTitle(allGroups[0].title);
  }

  const hasPageGuide = Boolean(sections && sections.length > 0);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[66] bg-[#111111]/50" style={{ animation: "njFade 140ms ease" }} />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-[66] flex h-full w-full max-w-[480px] flex-col bg-surface shadow-[-24px_0_60px_rgba(0,0,0,0.28)]">
          <div className="flex shrink-0 items-start gap-3.5 border-b border-border px-6 pb-[18px] pt-[22px]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-accent-bg text-link">
              <HelpCircle className="h-[21px] w-[21px]" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <DialogPrimitive.Title className="text-[17px] font-bold tracking-[-0.015em] text-foreground">
                {translate("guide.title")}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-[12.5px] leading-[1.5] text-text-tertiary text-pretty">
                {hasPageGuide ? translate("guide.desc.page") : translate("guide.desc.shell")}
              </DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close
              title={translate("guide.close")}
              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[9px] bg-background text-muted-foreground hover:bg-border hover:text-foreground"
            >
              <X className="h-[19px] w-[19px]" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
            {allGroups.map((group) => {
              const isOpen = openTitle === group.title;
              return (
                <div
                  key={group.title}
                  className={cn(
                    "shrink-0 overflow-hidden rounded-[13px] border",
                    isOpen ? "border-accent/40 bg-accent-bg/40" : "border-border bg-surface",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenTitle(isOpen ? "" : group.title)}
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                  >
                    <span className="shrink-0 text-link">{group.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13.5px] font-bold text-foreground text-pretty">{group.title}</span>
                      <span className="block text-[11.5px] font-semibold text-text-quaternary">{translate("guide.itemCount", { n: group.rows.length })}</span>
                    </span>
                    <ChevronDown
                      className={cn("h-5 w-5 shrink-0 text-text-quaternary transition-transform", isOpen && "rotate-180")}
                    />
                  </button>
                  {isOpen ? (
                    <div className="flex flex-col gap-3 px-4 pb-3.5">
                      {group.rows.map((row) => (
                        <div key={row.label} className="flex items-start gap-[11px] rounded-[11px] border border-border bg-surface p-3">
                          <span className="mt-0.5 shrink-0 text-link">{row.icon}</span>
                          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[12.5px] font-bold text-foreground text-pretty">{row.label}</span>
                              <span
                                className={cn(
                                  "inline-flex h-[19px] shrink-0 items-center whitespace-nowrap rounded-[5px] px-[7px] text-[9.5px] font-bold tracking-[0.06em]",
                                  row.kind === "Bouton" ? "bg-accent-bg text-link" : "bg-background text-muted-foreground",
                                )}
                              >
                                {translate(row.kind === "Bouton" ? "guide.kind.button" : "guide.kind.element").toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[12.5px] leading-[1.55] text-muted-foreground text-pretty">{row.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-surface-subtle px-6 py-3.5">
            <span className="text-[11.5px] text-text-tertiary">{translate("guide.shortcut")}</span>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-9 shrink-0 rounded-[9px] bg-foreground px-4 text-[12.5px] font-semibold text-surface hover:opacity-85"
            >
              {translate("guide.dismiss")}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
