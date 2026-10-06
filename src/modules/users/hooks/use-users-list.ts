"use client";

import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../api/users.api";
import type { AdminUserListFilters } from "../types";

export function useUsersList(filters: AdminUserListFilters) {
  return useQuery({
    queryKey: ["users", "list", filters],
    queryFn: () => usersApi.list(filters),
  });
}
