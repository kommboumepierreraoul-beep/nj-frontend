"use client";

import { useQuery } from "@tanstack/react-query";
import { usersApi } from "../api/users.api";

export function useUser(id: number) {
  return useQuery({
    queryKey: ["users", "detail", id],
    queryFn: () => usersApi.show(id),
    select: (data) => data.data,
    enabled: Number.isInteger(id),
  });
}
