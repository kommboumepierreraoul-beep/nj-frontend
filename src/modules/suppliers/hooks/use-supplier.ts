"use client";

import { useQuery } from "@tanstack/react-query";
import { suppliersApi } from "../api/suppliers.api";

export function useSupplier(id: number) {
  return useQuery({
    queryKey: ["suppliers", "detail", id],
    queryFn: () => suppliersApi.get(id),
    select: (data) => data.data,
  });
}
