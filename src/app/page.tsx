"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { routes } from "@/config/routes";

/** `/` n'est jamais une page en soi : redirige vers le tableau de bord ou la connexion dès que la session est connue. */
export default function Home() {
  const router = useRouter();
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!hasHydrated) return;
    router.replace(isAuthenticated ? routes.dashboard.home : routes.auth.login);
  }, [hasHydrated, isAuthenticated, router]);

  return null;
}
