"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createQueryClient } from "@/config/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // useState(fn) garantit un seul QueryClient par montage (pas de recréation à chaque rendu),
  // sans risque de fuite entre requêtes côté serveur (chaque utilisateur en aurait un différent).
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
