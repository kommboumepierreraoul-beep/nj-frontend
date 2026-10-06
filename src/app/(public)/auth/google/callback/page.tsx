import { Suspense } from "react";
import type { Metadata } from "next";
import { GoogleCallbackClient } from "@/modules/auth/components/google-callback-client";

export const metadata: Metadata = { title: "Connexion Google — NJ Global Trade" };

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Chargement...</p>
        </div>
      }
    >
      <GoogleCallbackClient />
    </Suspense>
  );
}
