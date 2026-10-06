"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { shippingRatesApi } from "../api/shipping-rates.api";
import type { ShippingRateListFilters } from "../types";

export function useShippingRates(filters: ShippingRateListFilters) {
  return useQuery({
    queryKey: ["shipping-rates", "list", filters],
    queryFn: () => shippingRatesApi.list(filters),
    select: (data) => data.data,
    placeholderData: keepPreviousData,
  });
}
