"use client";

import { use, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/data-display/page-header";
import { ErrorState } from "@/components/data-display/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/form-section";
import { InfoBanner } from "@/components/data-display/info-banner";
import { updateUserSchema, type UpdateUserSchema } from "@/modules/users/schemas/update-user.schema";
import { useUser } from "@/modules/users/hooks/use-user";
import { useUpdateUser, useUpdateUserStatus } from "@/modules/users/hooks/use-user-mutations";
import { ROLE_LABELS, statusLabel, statusTone } from "@/modules/users/badges";
import { useAuthStore } from "@/stores/auth.store";
import { routes } from "@/config/routes";
import type { UserRole } from "@/types/permissions";
import { translate } from "@/i18n/translate";

/** Doc/spec_pages_utilisateurs.md § C4 « Modifier un utilisateur ». */
export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = Number(id);
  if (!Number.isInteger(userId)) notFound();

  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const isSuperAdmin = currentUser?.role === "SUPER_ADMIN";

  const query = useUser(userId);
  const updateMutation = useUpdateUser(userId);
  const statusMutation = useUpdateUserStatus(userId);

  const roleOptions: UserRole[] = isSuperAdmin ? ["ADMIN", "SUPER_ADMIN"] : ["ADMIN"];
  // Un simple ADMIN ne doit pas pouvoir promouvoir ou rétrograder un SUPER_ADMIN (§ C4) : rôle verrouillé dans ce cas.
  const roleLocked = !isSuperAdmin && query.data?.role === "SUPER_ADMIN";

  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<UpdateUserSchema>({
    resolver: zodResolver(updateUserSchema),
    // Champs contrôlés dès le premier rendu (avant que `reset()` ne pose les
    // valeurs réelles dans l'effet) — évite l'avertissement React « Select is
    // changing from uncontrolled to controlled ».
    defaultValues: { full_name: "", email: "", email_confirmation: "", role: "ADMIN" },
  });

  useEffect(() => {
    if (!query.data) return;
    reset({ full_name: query.data.full_name, email: query.data.email, email_confirmation: query.data.email, role: query.data.role });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  const emailValue = watch("email");
  const emailChanged = Boolean(query.data) && emailValue !== query.data?.email;
  const showGoogleWarning = emailChanged && Boolean(query.data?.google_id);

  function onSubmit(values: UpdateUserSchema) {
    if (!query.data) return;
    updateMutation.mutate(
      { full_name: values.full_name, email: values.email, role: roleLocked ? query.data.role : values.role },
      { onSuccess: () => router.push(routes.users.detail(userId)) },
    );
  }

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const user = query.data;

  return (
    <div className="max-w-xl space-y-6">
      <PageHeader breadcrumbs={[{ label: translate("page.users.title"), href: routes.users.list }, { label: user.full_name, href: routes.users.detail(user.id) }, { label: translate("action.edit") }]} title={translate("t.modifierX", { x: user.full_name })} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg border border-border bg-surface p-5">
        <FormField label={translate("field.nomComplet")} htmlFor="full_name" required error={errors.full_name?.message}>
          <Input id="full_name" {...register("full_name")} />
        </FormField>
        <FormField label={translate("t.email")} htmlFor="email" required error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} />
        </FormField>
        <FormField label={translate("t.confirmerLeNouvelEmail")} htmlFor="email_confirmation" required error={errors.email_confirmation?.message}>
          <Input id="email_confirmation" type="email" {...register("email_confirmation")} />
        </FormField>

        {showGoogleWarning ? (
          <InfoBanner className="border-warning-bg bg-warning-bg text-warning">
            {translate("t.compteLieGoogleEmailWarning")}
          </InfoBanner>
        ) : null}

        <FormField label={translate("t.role")} htmlFor="role" required>
          <Controller
            control={control}
            name="role"
            render={({ field }) =>
              roleLocked ? (
                <Input value={ROLE_LABELS[field.value]} disabled readOnly />
              ) : (
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
              )
            }
          />
        </FormField>

        <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
          <div>
            <Label htmlFor="is_active">{translate("t.statutDuCompte")}</Label>
            <p className="text-xs text-muted-foreground">{isSuperAdmin ? translate("t.modifiableParSuperAdmin") : translate("t.lectureSeulePourAdmin")}</p>
          </div>
          {isSuperAdmin ? (
            <Switch id="is_active" checked={user.is_active} disabled={statusMutation.isPending || currentUser?.id === user.id} onCheckedChange={(value) => statusMutation.mutate({ is_active: value })} />
          ) : (
            <Badge tone={statusTone(user.is_active)}>{statusLabel(user.is_active)}</Badge>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {translate("action.cancel")}
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? translate("t.enregistrementEnCours") : translate("action.save")}
          </Button>
        </div>
      </form>
    </div>
  );
}
