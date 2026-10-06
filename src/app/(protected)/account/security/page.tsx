"use client";

import { PageHeader } from "@/components/data-display/page-header";
import { AccountChangePasswordCard } from "@/modules/auth/components/account-change-password-card";
import { SessionsCard } from "@/modules/auth/components/sessions-card";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_utilisateurs.md § B2 « Sécurité & sessions ». */
export default function AccountSecurityPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader breadcrumbs={[{ label: "Mon profil", href: routes.account.profile }, { label: "Sécurité" }]} title={translate("page.security.title")} description={translate("page.security.desc")} />
      <AccountChangePasswordCard />
      <SessionsCard />
    </div>
  );
}
