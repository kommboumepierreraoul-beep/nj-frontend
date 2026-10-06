"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { contactChannelsApi } from "../api/clients.api";
import { ApiError } from "@/lib/http/api-error";
import type { CreateContactChannelPayload, UpdateContactChannelPayload } from "../types";
import { translate } from "@/i18n/translate";

const KEY = ["clients", "contact-channels"] as const;

export function useContactChannels() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => contactChannelsApi.list(),
    select: (data) => data.data,
  });
}

export function useCreateContactChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateContactChannelPayload) => contactChannelsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.canalCree"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.creationImpossible")),
  });
}

export function useUpdateContactChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateContactChannelPayload }) => contactChannelsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.canalMisAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteContactChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => contactChannelsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
      toast.success(translate("toast.canalSupprime"));
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError && error.status === 409
          ? translate("t.desContactsClientsUtilisentEncoreCeCanalDesactivez")
          : error instanceof ApiError
            ? error.message
            : translate("toast.suppressionImpossible"),
      ),
  });
}
