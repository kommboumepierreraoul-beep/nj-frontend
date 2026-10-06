"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientsApi } from "../api/clients.api";
import { ApiError } from "@/lib/http/api-error";
import { routes } from "@/config/routes";
import type { ClientFormValues, ClientStatus, ValueSegment } from "../types";
import { translate } from "@/i18n/translate";

export function useCreateClient() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (payload: ClientFormValues) => clientsApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["clients", "list"] });
      toast.success(translate("toast.clientCree"));
      router.push(routes.clients.detail(data.data.id));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdateClient(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ClientFormValues>) => clientsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", "list"] });
      queryClient.invalidateQueries({ queryKey: ["clients", "detail", id] });
      toast.success(translate("toast.clientMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (id: number) => clientsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", "list"] });
      toast.success(translate("toast.clientSupprime"));
      router.push(routes.clients.list);
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}

export function useChangeClientStatus(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: ClientStatus) => clientsApi.changeStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", "list"] });
      queryClient.invalidateQueries({ queryKey: ["clients", "detail", id] });
      toast.success(translate("toast.statutMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.changementDeStatutImpossible")),
  });
}

export function useAdjustValueSegment(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (value_segment: ValueSegment) => clientsApi.adjustValueSegment(id, value_segment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", "detail", id] });
      toast.success(translate("toast.segmentDeValeurAjuste"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.ajustementImpossible")),
  });
}
