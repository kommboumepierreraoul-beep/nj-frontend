"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ActorPickerField } from "./actor-picker-field";
import { MODULE_ENTITY_TYPES, MODULE_LABELS, ENTITY_TYPE_LABELS, actionsForEntityType } from "../badges";
import type { AuditEntityType, AuditLogListFilters, AuditModule } from "../types";
import { translate } from "@/i18n/translate";

const ALL = "__all__";

/**
 * Barre de filtres (Doc/spec_pages_audit.md § Filtres), calquée sur NJ Global
 * Trade Audit.dc.html lignes 492-519 : carte à angles 14px avec la même puce
 * « Filtres » que les autres modules (ex. SupplierFilters), les champs à
 * label au-dessus en une seule rangée qui s'enroule, bouton
 * « Réinitialiser » aligné à droite, puis une note d'aide sous un filet fin
 * expliquant que le sélecteur « Module » ne fait que présélectionner le type
 * d'entité ci-dessous (§ note sous le tableau des filtres — il ne part
 * jamais dans la requête API).
 */
export function AuditLogFilters({ filters, onChange }: { filters: AuditLogListFilters; onChange: (patch: Partial<AuditLogListFilters>) => void }) {
  const [moduleFilter, setModuleFilter] = useState<AuditModule | typeof ALL>(ALL);

  const entityTypeOptions = moduleFilter === ALL ? (Object.keys(ENTITY_TYPE_LABELS) as AuditEntityType[]) : MODULE_ENTITY_TYPES[moduleFilter];
  const actionOptions = filters.entity_type ? actionsForEntityType(filters.entity_type) : [];

  function resetFilters() {
    setModuleFilter(ALL);
    onChange({ entity_type: undefined, entity_id: undefined, actor_user_id: undefined, action: undefined, from: undefined, to: undefined });
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-[14px] border border-border bg-surface p-[18px]">
      <span className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.filtres")}</span>

      <div className="flex flex-nowrap items-end gap-3 overflow-x-auto md:flex-wrap md:overflow-visible [&>*]:shrink-0">
        <div className="space-y-1.5">
          <Label>{translate("t.module")}</Label>
          <Select
            value={moduleFilter}
            onValueChange={(value) => {
              setModuleFilter(value as AuditModule | typeof ALL);
              onChange({ entity_type: undefined, action: undefined });
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder={translate("ph.tousLesModules")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{translate("t.tousLesModules")}</SelectItem>
              {(Object.entries(MODULE_LABELS) as [AuditModule, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{translate("t.typeDEntite")}</Label>
          <Select
            value={filters.entity_type ?? ALL}
            onValueChange={(value) => onChange({ entity_type: value === ALL ? undefined : (value as AuditEntityType), action: undefined })}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder={translate("ph.tousLesTypes")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{translate("t.tousLesTypes")}</SelectItem>
              {entityTypeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {ENTITY_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>{translate("t.action")}</Label>
          <Select value={filters.action ?? ALL} onValueChange={(value) => onChange({ action: value === ALL ? undefined : value })} disabled={!filters.entity_type}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder={filters.entity_type ? "Toutes les actions" : "Choisir un type d'abord"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{translate("t.toutesLesActions")}</SelectItem>
              {actionOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[140px] shrink-0 space-y-1.5 sm:w-32">
          <Label htmlFor="entity_id">{translate("t.idDEntite")}</Label>
          <Input
            id="entity_id"
            type="number"
            value={filters.entity_id ?? ""}
            onChange={(event) => onChange({ entity_id: event.target.value ? Number(event.target.value) : undefined })}
          />
        </div>

        <div className="w-[240px] shrink-0 space-y-1.5 sm:w-60">
          <Label>{translate("t.auteur")}</Label>
          <ActorPickerField value={filters.actor_user_id} onChange={(id) => onChange({ actor_user_id: id })} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="from">Du</Label>
          <Input id="from" type="date" value={filters.from ?? ""} onChange={(event) => onChange({ from: event.target.value || undefined })} className="w-40" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to">Au</Label>
          <Input id="to" type="date" value={filters.to ?? ""} onChange={(event) => onChange({ to: event.target.value || undefined })} className="w-40" />
        </div>

        <div className="hidden flex-1 md:block" />

        <button
          type="button"
          onClick={resetFilters}
          className="flex h-[46px] shrink-0 items-center rounded-[10px] border-[1.5px] border-border bg-surface px-3.5 text-[13px] font-semibold text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          Réinitialiser
        </button>
      </div>

      <div className="flex items-start gap-2.5 border-t border-border pt-3">
        <Info className="mt-px h-[15px] w-[15px] shrink-0 text-accent-hover" />
        <p className="text-xs leading-relaxed text-text-tertiary text-pretty">
          Le sélecteur « Module » ne fait que présélectionner la liste des types d&apos;entité ci-dessus : il n&apos;est jamais envoyé tel quel à l&apos;API, seul un type
          d&apos;entité précis peut être filtré à la fois.
        </p>
      </div>
    </div>
  );
}
