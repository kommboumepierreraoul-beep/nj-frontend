"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormSection } from "@/components/forms/form-section";
import { DialogFormHeader, DialogFormFooter } from "@/components/forms/dialog-form-chrome";
import { flowStageThresholdSchema, type FlowStageThresholdSchema } from "../schemas/flow-stage-threshold.schema";
import { useCreateFlowStageThreshold, useUpdateFlowStageThreshold } from "../hooks/use-flow-stage-threshold-mutations";
import { FLOW_TYPE_LABELS, THRESHOLD_TYPE_LABELS } from "../badges";
import { PURCHASE_ORDER_STATUS_LABELS } from "@/modules/purchase-orders/badges";
import { SALES_ORDER_STATUS_LABELS } from "@/modules/sales-orders/badges";
import type { FlowStageThreshold, FlowType } from "../types";
import { translate } from "@/i18n/translate";

const FLOW_TYPES: FlowType[] = ["ACHAT", "VENTE", "ACTIVITE"];

/**
 * Doc/spec_pages_analyse_flux.md § 2 — `flow_type`/`stage_code` obligatoires
 * à la création, verrouillés (lecture seule) à l'édition : pour changer
 * l'étape ciblée, supprimer et recréer plutôt que modifier. `stage_code`
 * propose les valeurs de `PurchaseOrderStatus`/`SalesOrderStatus` pour
 * ACHAT/VENTE, texte libre pour ACTIVITE.
 */
export function FlowStageThresholdFormDialog({
  open,
  onOpenChange,
  threshold,
  defaultFlowType = "ACHAT",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  threshold?: FlowStageThreshold | null;
  defaultFlowType?: FlowType;
}) {
  const isEdit = Boolean(threshold);
  const createMutation = useCreateFlowStageThreshold();
  const updateMutation = useUpdateFlowStageThreshold(threshold?.id ?? 0);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FlowStageThresholdSchema>({
    resolver: zodResolver(flowStageThresholdSchema),
    defaultValues: { flow_type: defaultFlowType, threshold_type: "DUREE_JOURS", is_active: true },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      threshold
        ? {
            flow_type: threshold.flow_type,
            stage_code: threshold.stage_code,
            label: threshold.label,
            threshold_type: threshold.threshold_type,
            threshold_value: threshold.threshold_value,
            is_active: threshold.is_active,
            sort_order: threshold.sort_order,
          }
        : { flow_type: defaultFlowType, threshold_type: "DUREE_JOURS", is_active: true },
    );
  }, [open, threshold, defaultFlowType, reset]);

  const flowType = watch("flow_type");
  const isActive = watch("is_active");
  const stageOptions = flowType === "ACHAT" ? PURCHASE_ORDER_STATUS_LABELS : flowType === "VENTE" ? SALES_ORDER_STATUS_LABELS : null;

  function onSubmit(values: FlowStageThresholdSchema) {
    if (isEdit && threshold) {
      updateMutation.mutate(
        { label: values.label, threshold_type: values.threshold_type, threshold_value: values.threshold_value, is_active: values.is_active, sort_order: values.sort_order },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createMutation.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[560px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={isEdit ? "Modifier le seuil" : "Nouveau seuil"} pending={isPending} />
          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            <FormSection cols={2}>
              <FormField label={translate("field.flux")} htmlFor="flow_type" required>
                {isEdit ? (
                  <Input id="flow_type" value={FLOW_TYPE_LABELS[threshold!.flow_type]} disabled readOnly />
                ) : (
                  <Controller
                    control={control}
                    name="flow_type"
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          setValue("stage_code", "");
                        }}
                      >
                        <SelectTrigger id="flow_type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FLOW_TYPES.map((value) => (
                            <SelectItem key={value} value={value}>
                              {FLOW_TYPE_LABELS[value]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                )}
              </FormField>
              <FormField label={translate("field.etapeIndicateurCode")} htmlFor="stage_code" required error={errors.stage_code?.message}>
                {isEdit ? (
                  <Input id="stage_code" value={threshold!.stage_code} disabled readOnly />
                ) : stageOptions ? (
                  <Controller
                    control={control}
                    name="stage_code"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="stage_code">
                          <SelectValue placeholder={translate("ph.selectionnerUneEtape")} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(stageOptions).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label} ({value})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <Input id="stage_code" {...register("stage_code")} placeholder={translate("ph.exAuthLoginFailed")} />
                )}
              </FormField>
            </FormSection>
            <FormField label={translate("field.libelle")} htmlFor="label" required error={errors.label?.message}>
              <Input id="label" {...register("label")} placeholder={translate("ph.libelleAfficheDansLOngletVueDEnsemble")} />
            </FormField>
            <FormSection cols={2}>
              <FormField label={translate("field.typeDeSeuil")} htmlFor="threshold_type">
                <Controller
                  control={control}
                  name="threshold_type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="threshold_type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(THRESHOLD_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label={translate("field.valeur")} htmlFor="threshold_value" required error={errors.threshold_value?.message}>
                <Input id="threshold_value" type="number" step="1" min={0} {...register("threshold_value")} />
              </FormField>
              <FormField label={translate("field.ordreDAffichage")} htmlFor="sort_order">
                <Input id="sort_order" type="number" {...register("sort_order")} />
              </FormField>
            </FormSection>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
              <Label htmlFor="is_active">Seuil actif</Label>
              <Switch id="is_active" checked={isActive ?? true} onCheckedChange={(value) => setValue("is_active", value)} />
            </div>
          </div>
          <DialogFormFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{translate("action.cancel")}</Button>
            <Button type="submit" disabled={isPending}>
              {isEdit ? "Enregistrer" : translate("t.creerLeSeuil")}
            </Button>
          </DialogFormFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
