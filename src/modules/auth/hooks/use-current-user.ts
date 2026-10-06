"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/auth.store";

/**
 * Revalide l'utilisateur courant (et ses permissions) depuis l'API tant qu'un
 * token est présent — une permission modifiée côté admin se reflète donc au
 * prochain montage sans obliger l'utilisateur à se reconnecter. Le nettoyage
 * de session sur 401 est déjà centralisé dans api-client.ts, pas dupliqué ici.
 */
export function useCurrentUser() {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => authApi.me(),
    enabled: Boolean(token),
    staleTime: 60_000,
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data.user);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  return query;
}
