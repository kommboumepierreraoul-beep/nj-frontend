"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { auditApi } from "../api/audit.api";
import type { AuditLogListFilters } from "../types";

export function useAuditLogs(filters: AuditLogListFilters) {
  return useQuery({
    queryKey: ["audit-logs", "list", filters],
    queryFn: () => auditApi.list(filters),
    placeholderData: keepPreviousData,
  });
}
