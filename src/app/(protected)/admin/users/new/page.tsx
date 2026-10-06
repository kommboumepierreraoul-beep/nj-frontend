"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/data-display/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-section";
import { InfoBanner } from "@/components/data-display/info-banner";
import { inviteUserSchema, type InviteUserSchema } from "@/modules/users/schemas/invite-user.schema";
import { useInviteUser } from "@/modules/users/hooks/use-user-mutations";
import { ROLE_LABELS } from "@/modules/users/badges";
import { useAuthStore } from "@/stores/auth.store";
import { routes } from "@/config/routes";
import type { UserRole } from "@/types/permissions";
import { translate } from "@/i18n/translate";

const ADMIN_ONLY: UserRole[] = ["ADMIN"];
const ALL_ROLES: UserRole[] = ["ADMIN", "SUPER_ADMIN"];

/** Doc/spec_pages_utilisateurs.md § C3 « Inviter un utilisateur » — page dédiée (route `/admin/users/new`, pas une modale, conformément au plan de routes fourni). */
export default function InviteUserPage() {
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";
  const roleOptions = isSuperAdmin ? ALL_ROLES : ADMIN_ONLY;

  const mutation = useInviteUser();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InviteUserSchema>({ resolver: zodResolver(inviteUserSchema), defaultValues: { role: "ADMIN" } });

  function onSubmit(values: InviteUserSchema) {
    mutation.mutate(values, {
      onSuccess: (response) => router.push(routes.users.detail(response.data.id)),
    });
  }

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader breadcrumbs={[{ label: translate("page.users.title"), href: routes.users.list }, { label: translate("page.userInvite.crumb") }]} title={translate("page.userInvite.title")} description={translate("page.userInvite.desc")} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <FormField label={translate("field.nomComplet")} htmlFor="full_name" required error={errors.full_name?.message}>
          <Input id="full_name" {...register("full_name")} placeholder={translate("t.exAwaDiallo")} />
        </FormField>
        <FormField label={translate("t.email")} htmlFor="email" required error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} placeholder="prenom.nom@njglobaltrade.com" />
        </FormField>
        <FormField label={translate("t.role")} htmlFor="role" required>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role} value={role}>
                      {ROLE_LABELS[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <InfoBanner>{translate("t.aucunMotDePasseNEstTransmisParEmailLUtilisateurDef")}</InfoBanner>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {translate("action.cancel")}
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? translate("t.envoiEnCours") : translate("t.envoyerLInvitation")}
          </Button>
        </div>
      </form>
    </div>
  );
}
