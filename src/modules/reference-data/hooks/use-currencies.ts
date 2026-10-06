"use client";

import { useQuery } from "@tanstack/react-query";
import { referenceDataApi } from "../api/reference-data.api";

export function useCurrencies() {
  return useQuery({
    queryKey: ["reference-data", "currencies"],
    queryFn: () => referenceDataApi.currencies(),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000,
  });
}
