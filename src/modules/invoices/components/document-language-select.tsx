"use client";

import { Languages } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { translate } from "@/i18n/translate";

/** "" = automatique (langue préférée du client, résolue côté serveur). */
export type DocumentLanguageChoice = "" | "FR" | "EN";

/**
 * Choix de la langue d'un document PDF à l'émission (proforma, avoir…).
 * « Automatique » laisse l'API retomber sur `clients.preferred_language`.
 * Voir Doc/documents_bilingues_addendum.md.
 */
export function DocumentLanguageSelect({
  value,
  onChange,
  disabled,
}: {
  value: DocumentLanguageChoice;
  onChange: (value: DocumentLanguageChoice) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        <Languages className="h-3.5 w-3.5" />
        {translate("docLang.label")}
      </label>
      <Select value={value === "" ? "AUTO" : value} onValueChange={(next) => onChange(next === "AUTO" ? "" : (next as "FR" | "EN"))} disabled={disabled}>
        <SelectTrigger className="h-10 w-full sm:w-[240px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AUTO">{translate("docLang.auto")}</SelectItem>
          <SelectItem value="FR">{translate("docLang.fr")}</SelectItem>
          <SelectItem value="EN">{translate("docLang.en")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
