"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { rfqApi } from "../api/rfq.api";
import { ApiError } from "@/lib/http/api-error";
import { routes } from "@/config/routes";
import type { RfqFormValues } from "../types";
import { translate } from "@/i18n/translate";

export function useCreateRfq() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: RfqFormValues) => rfqApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rfqs", "list"] });
      toast.success(translate("toast.rfqCreee"));
      router.push(routes.suppliers.rfqDetail(data.data.id));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdateRfq(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<RfqFormValues>) => rfqApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfqs", "list"] });
      queryClient.invalidateQueries({ queryKey: ["rfqs", "detail", id] });
      toast.success(translate("toast.rfqMiseAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteRfq() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: number) => rfqApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rfqs", "list"] });
      toast.success(translate("toast.rfqSupprimee"));
      router.push(routes.suppliers.rfqList);
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
