"use client";

import { useQuery } from "@tanstack/react-query";
import { permissionsCatalogApi } from "../api/permissions.api";

export function usePermissionsCatalog() {
  return useQuery({
    queryKey: ["permissions", "catalog"],
    queryFn: () => permissionsCatalogApi.list(),
    select: (data) => data.data,
    staleTime: 5 * 60_000,
  });
}
