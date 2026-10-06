import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bandeau d'information discret, réutilisable par tout module ayant besoin
 * d'afficher une limite de donnée réelle ou un avertissement contextuel à
 * l'écran plutôt que de le cacher dans un tooltip (ex. Doc/spec_pages_analyse_flux.md
 * § champ `limite`, Doc/spec_pages_notifications.md § 3 note sur le canal in-app).
 */
export function InfoBanner({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-start gap-2.5 rounded-lg border border-accent-bg bg-accent-bg px-4 py-3 text-sm text-accent-hover", className)}>
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
