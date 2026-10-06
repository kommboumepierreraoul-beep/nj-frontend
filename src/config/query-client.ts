import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/http/api-error";

const NON_RETRYABLE_KINDS: ApiError["kind"][] = ["unauthenticated", "forbidden", "validation", "not_found", "locked"];

/**
 * Défauts partagés par toute l'application. `refetchOnWindowFocus: false` est
 * un choix délibéré pour un back-office (évite des rafraîchissements
 * surprenants pendant la saisie d'un formulaire) ; chaque écran peut le
 * réactiver localement s'il a besoin de données très fraîches (ex. le
 * dashboard temps réel).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && NON_RETRYABLE_KINDS.includes(error.kind)) {
            return false;
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
