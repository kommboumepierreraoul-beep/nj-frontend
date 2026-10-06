"use client";

import * as React from "react";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { translate } from "@/i18n/translate";

export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
}

/**
 * Select à recherche (combobox) — même chrome que `SelectTrigger`
 * (`components/ui/select.tsx`) : déclencheur h-46, bordure 1.5, chevron ;
 * panneau `PopoverContent` avec champ de recherche en tête et liste
 * défilable. Deux modes :
 *  - liste statique : filtrage local sur `label` ;
 *  - recherche asynchrone : passer `onSearchChange` (le parent recharge
 *    `options`), aucun filtrage local n'est alors appliqué.
 */
export function Combobox({
  value,
  onValueChange,
  options,
  placeholder = translate("t.selectionner"),
  searchPlaceholder = "Rechercher…",
  emptyText = translate("t.aucunResultat2"),
  loading = false,
  clearable = true,
  disabled = false,
  onSearchChange,
  id,
  triggerClassName,
  contentClassName,
}: {
  value?: string | null;
  onValueChange: (value: string | undefined) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  onSearchChange?: (query: string) => void;
  id?: string;
  triggerClassName?: string;
  contentClassName?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selected = options.find((option) => option.value === String(value));

  const filtered = React.useMemo(() => {
    if (onSearchChange) return options; // filtrage délégué au parent
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query, onSearchChange]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
      onSearchChange?.("");
    }
  }

  function pick(optionValue: string) {
    onValueChange(optionValue === String(value) && clearable ? undefined : optionValue);
    handleOpenChange(false);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        id={id}
        type="button"
        disabled={disabled}
        className={cn(
          "flex h-[46px] w-full items-center justify-between gap-2 rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 text-[13.5px] text-foreground",
          "focus:outline-none focus-visible:border-accent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          triggerClassName,
        )}
      >
        <span className={cn("min-w-0 flex-1 truncate text-left", !selected && "text-text-quaternary")}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {clearable && selected && !disabled ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label="Effacer"
              onClick={(event) => {
                event.stopPropagation();
                onValueChange(undefined);
              }}
              className="rounded p-0.5 text-text-quaternary hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          ) : null}
          <ChevronDown className="h-4 w-4 opacity-60" />
        </span>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className={cn("w-[--radix-popover-trigger-width] p-0", contentClassName)}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex items-center gap-2 border-b border-border px-3">
          <Search className="h-3.5 w-3.5 shrink-0 text-text-quaternary" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              onSearchChange?.(event.target.value);
            }}
            placeholder={searchPlaceholder}
            className="h-10 w-full bg-transparent text-[13px] text-foreground outline-none placeholder:text-text-quaternary"
          />
          {loading ? <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-text-quaternary" /> : null}
        </div>

        <div className="max-h-[240px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-[12.5px] text-muted-foreground">
              {loading ? "Recherche…" : emptyText}
            </div>
          ) : (
            filtered.map((option) => {
              const isSelected = option.value === String(value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => pick(option.value)}
                  className={cn(
                    "flex w-full items-start gap-2 px-3 py-2 text-left text-[13px] hover:bg-surface-subtle focus:bg-surface-subtle focus:outline-none",
                    isSelected && "bg-surface-subtle",
                  )}
                >
                  <Check className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", isSelected ? "opacity-100 text-accent" : "opacity-0")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-foreground">{option.label}</span>
                    {option.description ? (
                      <span className="block truncate text-[11.5px] text-muted-foreground">{option.description}</span>
                    ) : null}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
