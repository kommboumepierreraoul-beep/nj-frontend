"use client";

import { useQuery } from "@tanstack/react-query";
import { referenceDataApi } from "../api/reference-data.api";

export function useUnits() {
  return useQuery({
    queryKey: ["reference-data", "units"],
    queryFn: () => referenceDataApi.units(),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000,
  });
}
