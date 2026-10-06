"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";

/** Doc/spec_pages_utilisateurs.md § B2 « Sessions actives » — `GET /auth/sessions`, ajouté au backend § 11.10. */
export function useSessions() {
  return useQuery({
    queryKey: ["auth", "sessions"],
    queryFn: () => authApi.sessions(),
    select: (data) => data.data,
  });
}
