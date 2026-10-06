"use client";

import { useState } from "react";
import { Pencil, Plus, TrendingUp, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/data-display/page-header";
import { PageSuspense } from "@/components/layout/page-suspense";
import { TableSection } from "@/components/data-display/table-section";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { CompanyIdentityForm } from "@/modules/company/components/company-identity-form";
import { PaymentMethodFormDialog } from "@/modules/company/components/payment-method-form-dialog";
import { CurrencyFormDialog } from "@/modules/company/components/currency-form-dialog";
import { ExchangeRateDialog } from "@/modules/company/components/exchange-rate-dialog";
import {
  useAdminCurrencies,
  useCompanyPaymentMethodMutations,
  useCompanyPaymentMethods,
  useCurrencyMutations,
} from "@/modules/company/hooks/use-company";
import type { AdminCurrency, CompanyPaymentMethod } from "@/modules/company/types";
import { formatDate, formatNumber, toNumber } from "@/lib/format";
import { routes } from "@/config/routes";
import { translate } from "@/i18n/translate";

const METHOD_TYPE_LABELS: Record<string, string> = {
  MOBILE_MONEY: "Mobile Money",
  BANK_TRANSFER: "Virement bancaire",
  CASH: "Espèces",
  OTHER: "Autre",
};

/** Doc/design_system_maquette_complete.md § 5.10 — domaine « Entreprise » : identité, moyens de paiement, devises. */
export default function CompanySettingsPage() {
  return (
    <PageSuspense>
      <CompanySettingsPageContent />
    </PageSuspense>
  );
}

function CompanySettingsPageContent() {
  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Tableau de bord", href: routes.dashboard.home },
          { label: translate("nav.settings"), href: routes.settings.hub },
          { label: "Entreprise" },
        ]}
        title={translate("page.company.title")}
        badges={<Badge tone="neutral">{translate("t.entreprise")}</Badge>}
        description={translate("page.company.desc")}
      />

      <div data-tour="company-identity">
        <TableSection title={translate("section.companyIdentity")} hint={translate("section.companyIdentityHint")}>
          <div className="p-[18px]">
            <CompanyIdentityForm />
          </div>
        </TableSection>
      </div>

      <PaymentMethodsSection />
      <CurrenciesSection />
    </div>
  );
}

function PaymentMethodsSection() {
  const query = useCompanyPaymentMethods();
  const { remove } = useCompanyPaymentMethodMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyPaymentMethod | null>(null);
  const [toDelete, setToDelete] = useState<CompanyPaymentMethod | null>(null);

  const columns: DataTableColumn<CompanyPaymentMethod>[] = [
    { key: "label", header: translate("col.label"), render: (row) => <span className="font-medium text-foreground">{row.label}</span> },
    { key: "type", header: translate("col.type"), render: (row) => METHOD_TYPE_LABELS[row.method_type] ?? row.method_type },
    {
      key: "coords",
      header: translate("col.details"),
      render: (row) => <span className="text-muted-foreground">{row.iban ?? row.account_number ?? row.instructions ?? "—"}</span>,
    },
    {
      key: "flags",
      header: translate("col.state"),
      width: "180px",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          <Badge tone={row.is_active ? "success" : "neutral"}>{row.is_active ? translate("value.active") : translate("value.inactive")}</Badge>
          {row.show_on_documents ? <Badge tone="neutral">{translate("t.surDocuments")}</Badge> : null}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" title={translate("tooltip.edit")} onClick={() => { setEditing(row); setFormOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title={translate("tooltip.delete")} onClick={() => setToDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <section id="moyens-de-paiement" data-tour="company-payment-methods" className="scroll-mt-24">
      <TableSection
        title={translate("section.paymentMethods")}
        hint={translate("t.comptesDeReglementImprimesAuBasDesProformasEtFactu")}
        action={
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Nouveau moyen
          </Button>
        }
      >
        <DataTable
          className="rounded-t-none border-0"
          columns={columns}
          data={query.data}
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          onRetry={() => query.refetch()}
          rowKey={(row) => row.id}
          emptyTitle={translate("page.company.methodsEmpty")}
          emptyDescription={translate("page.company.methodsEmptyDesc")}
        />
      </TableSection>

      <PaymentMethodFormDialog open={formOpen} onOpenChange={setFormOpen} method={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("page.company.methodDeleteTitle")}
        description={toDelete ? `« ${toDelete.label} » ne sera plus proposé ni imprimé. Désactiver le conserve dans l'historique.` : undefined}
        confirmLabel="Supprimer"
        isPending={remove.isPending}
        onConfirm={() => { if (toDelete) remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) }); }}
      />
    </section>
  );
}

function CurrenciesSection() {
  const query = useAdminCurrencies();
  const { remove } = useCurrencyMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCurrency | null>(null);
  const [rateTarget, setRateTarget] = useState<AdminCurrency | null>(null);
  const [toDelete, setToDelete] = useState<AdminCurrency | null>(null);

  const columns: DataTableColumn<AdminCurrency>[] = [
    {
      key: "code",
      header: translate("col.currency"),
      render: (row) => (
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-foreground">{row.code}</span>
          <span className="text-muted-foreground">{row.name}</span>
          {row.is_default ? <Badge tone="neutral">{translate("t.parDefaut")}</Badge> : null}
        </span>
      ),
    },
    { key: "symbol", header: translate("col.symbol"), width: "90px", render: (row) => row.symbol ?? "—" },
    {
      key: "rate",
      header: translate("col.lastRate"),
      render: (row) =>
        toNumber(row.latest_rate_to_xaf) !== null ? (
          <span>
            {formatNumber(row.latest_rate_to_xaf, 2)}
            {row.latest_rate_effective_date ? <span className="text-text-tertiary"> · {formatDate(row.latest_rate_effective_date)}</span> : null}
          </span>
        ) : (
          <span className="text-text-tertiary">{row.code === "XAF" ? "Devise pivot" : "—"}</span>
        ),
    },
    { key: "active", header: translate("col.state"), width: "110px", render: (row) => <Badge tone={row.is_active ? "success" : "neutral"}>{row.is_active ? translate("value.activeF") : translate("value.inactiveF")}</Badge> },
    {
      key: "actions",
      header: "",
      width: "130px",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.code !== "XAF" ? (
            <Button variant="ghost" size="icon" title={translate("tooltip.addRate")} onClick={() => setRateTarget(row)}>
              <TrendingUp className="h-4 w-4" />
            </Button>
          ) : null}
          <Button variant="ghost" size="icon" title={translate("tooltip.edit")} onClick={() => { setEditing(row); setFormOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          {!row.is_default ? (
            <Button variant="ghost" size="icon" title={translate("tooltip.delete")} onClick={() => setToDelete(row)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <section id="devises" data-tour="company-currencies" className="scroll-mt-24">
      <TableSection
        title={translate("section.currencies")}
        hint={translate("t.proposeesDansLesFormulairesDeCommandeDePaiementEtD")}
        action={
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Nouvelle devise
          </Button>
        }
      >
        <DataTable
          className="rounded-t-none border-0"
          columns={columns}
          data={query.data}
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          onRetry={() => query.refetch()}
          rowKey={(row) => row.id}
          emptyTitle={translate("page.company.currenciesEmpty")}
        />
      </TableSection>

      <CurrencyFormDialog open={formOpen} onOpenChange={setFormOpen} currency={editing} />
      <ExchangeRateDialog open={Boolean(rateTarget)} onOpenChange={(open) => !open && setRateTarget(null)} currency={rateTarget} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("page.company.currencyDeleteTitle")}
        description={toDelete ? `« ${toDelete.code} » sera retirée des sélecteurs. Refusé si elle est encore utilisée (commandes, factures, prix fournisseurs…) — désactivez-la dans ce cas.` : undefined}
        confirmLabel="Supprimer"
        isPending={remove.isPending}
        onConfirm={() => { if (toDelete) remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) }); }}
      />
    </section>
  );
}
