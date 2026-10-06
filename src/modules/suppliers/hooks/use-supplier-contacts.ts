"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { suppliersApi } from "../api/suppliers.api";
import { ApiError } from "@/lib/http/api-error";
import type { SupplierContactPayload } from "../types";
import { translate } from "@/i18n/translate";

function key(supplierId: number) {
  return ["suppliers", "contacts", supplierId] as const;
}

export function useSupplierContacts(supplierId: number) {
  return useQuery({
    queryKey: key(supplierId),
    queryFn: () => suppliersApi.contacts(supplierId),
    select: (data) => data.data,
  });
}

export function useCreateSupplierContact(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierContactPayload) => suppliersApi.createContact(supplierId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      toast.success(translate("toast.contactAjoute"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.ajoutImpossible")),
  });
}

export function useUpdateSupplierContact(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, payload }: { contactId: number; payload: Partial<SupplierContactPayload> }) =>
      suppliersApi.updateContact(supplierId, contactId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      toast.success(translate("toast.contactMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteSupplierContact(supplierId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: number) => suppliersApi.removeContact(supplierId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(supplierId) });
      toast.success(translate("toast.contactSupprime"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
