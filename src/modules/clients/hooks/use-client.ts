"use client";

import { useQuery } from "@tanstack/react-query";
import { clientsApi } from "../api/clients.api";

export function useClient(id: number) {
  return useQuery({
    queryKey: ["clients", "detail", id],
    queryFn: () => clientsApi.get(id),
    select: (data) => data.data,
    enabled: id > 0,
  });
}
