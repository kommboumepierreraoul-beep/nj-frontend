"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { attachmentsApi } from "../api/attachments.api";
import { ApiError } from "@/lib/http/api-error";
import type { AttachableType, CreateAttachmentPayload, UpdateAttachmentPayload } from "../types";
import { translate } from "@/i18n/translate";

function key(attachableType: AttachableType, attachableId: number) {
  return ["attachments", attachableType, attachableId] as const;
}

export function useAttachments(attachableType: AttachableType, attachableId: number | undefined) {
  return useQuery({
    queryKey: key(attachableType, attachableId ?? 0),
    queryFn: () => attachmentsApi.list({ attachable_type: attachableType, attachable_id: attachableId as number }),
    enabled: attachableId !== undefined,
    select: (data) => data.data,
  });
}

export function useCreateAttachment(attachableType: AttachableType, attachableId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<CreateAttachmentPayload, "attachable_type" | "attachable_id">) =>
      attachmentsApi.create({ ...payload, attachable_type: attachableType, attachable_id: attachableId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(attachableType, attachableId) });
      toast.success(translate("toast.pieceJointeAjoutee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.ajoutImpossible")),
  });
}

export function useUpdateAttachment(attachableType: AttachableType, attachableId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAttachmentPayload }) =>
      attachmentsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(attachableType, attachableId) });
      toast.success(translate("toast.pieceJointeMiseAJour"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.miseAJourImpossible")),
  });
}

export function useDeleteAttachment(attachableType: AttachableType, attachableId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => attachmentsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key(attachableType, attachableId) });
      toast.success(translate("toast.pieceJointeSupprimee"));
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : translate("toast.suppressionImpossible")),
  });
}
