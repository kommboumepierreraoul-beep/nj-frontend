import Link from "next/link";
import { routes } from "@/config/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background text-center">
      <h1 className="text-2xl font-semibold text-foreground">Page introuvable</h1>
      <p className="text-sm text-muted-foreground">Cette page n&apos;existe pas ou plus.</p>
      <Link href={routes.home} className="text-sm font-medium text-accent underline-offset-4 hover:underline">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
