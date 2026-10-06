"use client";

import { useAuthStore } from "@/stores/auth.store";
import type { UserRole } from "@/types/permissions";

/** `usePermission("clients.manage")` — true immédiatement pour un SUPER_ADMIN. */
export function usePermission(code: string): boolean {
  return useAuthStore((state) => state.hasPermission(code));
}

export function useRole(role: UserRole): boolean {
  return useAuthStore((state) => state.hasRole(role));
}
