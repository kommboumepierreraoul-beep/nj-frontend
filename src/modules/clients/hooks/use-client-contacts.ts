"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientsApi } from "../api/clients.api";
import { ApiError } from "@/lib/http/api-error";
import type { CreateContactPayload, UpdateContactPayload } from "../types";
import { translate } from "@/i18n/translate";

function key(clientId: number) {
  return ["clients", "contacts", clientId] as const;
}

export function useClientContacts(clientId: number) {
  return useQuery({
    queryKey: key(clientId),
    queryFn: () => clientsApi.contacts(clientId),
    select: (data) => data.data,
  });
}

export function useCreateClientContact(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateContactPayload) => clientsApi.createContact(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(clientId) });
      queryClient.invalidateQueries({ queryKey: ["clients", "detail", clientId] });
      toast.success(translate("toast.contactAjoute"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.ajoutImpossible")),
  });
}

export function useUpdateClientContact(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contactId, payload }: { contactId: number; payload: UpdateContactPayload }) =>
      clientsApi.updateContact(clientId, contactId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(clientId) });
      queryClient.invalidateQueries({ queryKey: ["clients", "detail", clientId] });
      toast.success(translate("toast.contactMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteClientContact(clientId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contactId: number) => clientsApi.removeContact(clientId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(clientId) });
      queryClient.invalidateQueries({ queryKey: ["clients", "detail", clientId] });
      toast.success(translate("toast.contactSupprime"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
