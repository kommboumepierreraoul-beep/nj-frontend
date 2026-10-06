"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { CircleHelp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FieldHelpEntry {
  field: string;
  help: string;
}

/**
 * Bouton « Aide sur les champs » (§ 4.6), calqué sur NJ Global Trade
 * Clients.dc.html lignes 639-642 : pastille dorée pâle distincte des boutons
 * outline classiques, présente dans chaque formulaire de la maquette.
 * `entries` reprend la colonne "Règles" de la spec du formulaire concerné.
 */
export function HelpButton({ entries, className }: { entries: FieldHelpEntry[]; className?: string }) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] border-[1.5px] border-accent/30 bg-accent-bg px-3 text-[12.5px] font-semibold text-link hover:bg-accent-bg",
            className,
          )}
        >
          <CircleHelp className="h-[18px] w-[18px]" />
          Aide sur les champs
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="end"
          sideOffset={8}
          className="z-[75] max-h-[min(70vh,420px)] w-[min(360px,90vw)] overflow-y-auto rounded-[13px] border border-border bg-surface p-4 shadow-[0_18px_48px_rgba(0,0,0,0.18)]"
        >
          <p className="mb-3 text-[13px] font-bold text-foreground">Aide sur les champs</p>
          <dl className="flex flex-col gap-3">
            {entries.map((entry) => (
              <div key={entry.field}>
                <dt className="text-[12.5px] font-bold text-foreground">{entry.field}</dt>
                <dd className="text-[11.5px] text-muted-foreground">{entry.help}</dd>
              </div>
            ))}
          </dl>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
