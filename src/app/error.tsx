"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { translate } from "@/i18n/translate";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background text-center">
      <h1 className="text-2xl font-semibold text-foreground">Une erreur est survenue</h1>
      <p className="text-sm text-muted-foreground">{translate("t.reessayezOuRevenezPlusTardSiLeProblemePersiste")}</p>
      <Button onClick={reset}>{translate("action.retry")}</Button>
    </div>
  );
}
