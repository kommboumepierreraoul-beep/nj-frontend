import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { translate } from "@/i18n/translate";
import { ApiError } from "@/lib/http/api-error";
import { cn } from "@/lib/utils";

/**
 * Erreur réseau/serveur (§ 4.5) : message générique + bouton réessayer ; si
 * `error` est un 429 avec `retryAfterSeconds`, l'affiche pour dissuader un
 * nouvel essai immédiat.
 */
export function ErrorState({ error, onRetry, className }: { error?: unknown; onRetry?: () => void; className?: string }) {
  const message =
    error instanceof ApiError
      ? error.kind === "rate_limited"
        ? `${translate("state.error.rateLimited")} ${error.retryAfterSeconds ? translate("state.error.retryIn", { s: error.retryAfterSeconds }) : translate("state.error.retrySoon")}`
        : error.kind === "forbidden"
          ? translate("state.error.forbidden")
          : error.kind === "network"
            ? error.message
            : translate("state.error.generic")
      : translate("state.error.generic");

  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-14 text-center", className)}>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive-bg text-destructive">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw className="h-4 w-4" />
          {translate("action.retry")}
        </Button>
      ) : null}
    </div>
  );
}
