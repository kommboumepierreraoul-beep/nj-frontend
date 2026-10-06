"use client";

import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/data-display/avatar";
import { PageHeader } from "@/components/data-display/page-header";
import { useAuthStore } from "@/stores/auth.store";
import { ROLE_LABELS, ROLE_TONES, statusLabel, statusTone } from "@/modules/users/badges";
import { formatDateTime } from "@/lib/format";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_utilisateurs.md § B1 « Mon profil » — lecture seule, email modifiable uniquement par un administrateur depuis C4 (décision §10.1). */
export default function AccountProfilePage() {
  const user = useAuthStore((state) => state.user);

  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={translate("page.account.title")} description={translate("page.account.desc")} />

      <div className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center gap-4">
          <Avatar name={user.full_name || user.name} src={user.avatar_url} size={64} />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-foreground">{user.full_name || user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone={ROLE_TONES[user.role]}>{ROLE_LABELS[user.role]}</Badge>
            <Badge tone={statusTone(user.is_active)}>{statusLabel(user.is_active)}</Badge>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{translate("t.email")}</dt>
            <dd className="mt-0.5 text-sm text-foreground">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{translate("t.methodeDeConnexion")}</dt>
            <dd className="mt-0.5 text-sm text-foreground">{user.google_id ? "Google + mot de passe" : "Mot de passe"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{translate("t.derniereConnexion")}</dt>
            <dd className="mt-0.5 text-sm text-foreground">{user.last_login_at ? formatDateTime(user.last_login_at) : "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Membre depuis</dt>
            <dd className="mt-0.5 text-sm text-foreground">{formatDateTime(user.created_at)}</dd>
          </div>
        </dl>

        <p className="mt-4 text-xs text-muted-foreground">
          L&apos;email n&apos;est modifiable que par un administrateur depuis la fiche utilisateur — contactez-en un si vous devez le changer.
        </p>

        <div className="mt-5 border-t border-border pt-5">
          <Button asChild variant="outline">
            <Link href={routes.account.security}>
              <ShieldCheck className="h-4 w-4" />
              Gérer la sécurité
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
