"use client";

import { useMemo, useState, type ReactNode } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { translate } from "@/i18n/translate";

export interface ComboboxOption {
  value: string;
  label: string;
  /** Texte additionnel comparé à la recherche (ex. code ISO d'un pays) sans être affiché. */
  keywords?: string;
  icon?: ReactNode;
}

/**
 * Sélecteur unique avec champ de recherche intégré (§ demande frontend :
 * « les select doivent avoir un champ recherche pour trouver rapidement le
 * pays »). Construit sur `@radix-ui/react-popover` — déjà une dépendance du
 * projet, jusqu'ici inutilisée — plutôt que `@radix-ui/react-select`, qui
 * n'expose aucun mécanisme de filtrage. Générique : réutilisable pour tout
 * champ à liste longue, pas seulement les pays.
 */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = translate("ph.selectionner"),
  searchPlaceholder = "Rechercher…",
  emptyLabel = translate("t.aucunResultat2"),
  clearLabel,
  disabled,
  id,
}: {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  /** Libellé de l'option de désélection en tête de liste ; omise si absente. */
  clearLabel?: string;
  disabled?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => `${option.label} ${option.keywords ?? ""}`.toLowerCase().includes(query));
  }, [options, search]);

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverPrimitive.Trigger asChild disabled={disabled}>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            "flex h-[46px] w-full items-center justify-between gap-2 rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 text-left text-[13.5px] text-foreground",
            "focus:outline-none focus-visible:border-accent disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-text-quaternary",
          )}
        >
          <span className="flex min-w-0 items-center gap-1.5 truncate">
            {selected?.icon}
            <span className="truncate">{selected ? selected.label : placeholder}</span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className="z-[70] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[10px] border border-border bg-surface text-foreground shadow-[0_12px_32px_rgba(0,0,0,0.14)]"
        >
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-6 w-full bg-transparent text-[13px] text-foreground placeholder:text-text-quaternary focus:outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1">
            {clearLabel ? (
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-background",
                  !value && "text-link",
                )}
              >
                <Check className={cn("h-3.5 w-3.5", value ? "opacity-0" : "opacity-100")} />
                {clearLabel}
              </button>
            ) : null}
            {filtered.length === 0 ? (
              <p className="px-2.5 py-3 text-center text-[12.5px] text-text-tertiary">{emptyLabel}</p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-background",
                    option.value === value && "bg-accent-bg text-link",
                  )}
                >
                  <Check className={cn("h-3.5 w-3.5 shrink-0", option.value === value ? "opacity-100" : "opacity-0")} />
                  {option.icon}
                  <span className="truncate">{option.label}</span>
                </button>
              ))
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
