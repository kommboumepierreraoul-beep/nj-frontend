"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { shippingRatesApi } from "../api/shipping-rates.api";
import { ApiError } from "@/lib/http/api-error";
import type { ShippingRatePayload } from "../types";
import { translate } from "@/i18n/translate";

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["shipping-rates", "list"] });
}

export function useCreateShippingRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShippingRatePayload) => shippingRatesApi.create(payload),
    onSuccess: () => {
      invalidate(queryClient);
      toast.success(translate("toast.palierCree"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdateShippingRate(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ShippingRatePayload>) => shippingRatesApi.update(id, payload),
    onSuccess: () => {
      invalidate(queryClient);
      toast.success(translate("toast.palierMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteShippingRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => shippingRatesApi.remove(id),
    onSuccess: () => {
      invalidate(queryClient);
      toast.success(translate("toast.palierSupprime"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
