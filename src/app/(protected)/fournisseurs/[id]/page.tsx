"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Ban, BadgeCheck, FolderOpen, Landmark, MessagesSquare, Pencil, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/data-display/page-header";
import { SummaryCard } from "@/components/data-display/summary-card";
import { ErrorState } from "@/components/data-display/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SupplierFormDialog } from "@/modules/suppliers/components/supplier-form-dialog";
import { VerifySupplierDialog } from "@/modules/suppliers/components/verify-supplier-dialog";
import { BlacklistSupplierDialog } from "@/modules/suppliers/components/blacklist-supplier-dialog";
import { ContactsTab } from "@/modules/suppliers/components/contacts-tab";
import { BankAccountsTab } from "@/modules/suppliers/components/bank-accounts-tab";
import { DocumentsTab } from "@/modules/suppliers/components/documents-tab";
import { EvaluationsTab } from "@/modules/suppliers/components/evaluations-tab";
import { CommunicationLogsTab } from "@/modules/suppliers/components/communication-logs-tab";
import { useSupplier } from "@/modules/suppliers/hooks/use-supplier";
import { SUPPLIER_RELIABILITY_BAR_CLASSES, SUPPLIER_RELIABILITY_LABELS, SUPPLIER_RELIABILITY_TONES } from "@/modules/suppliers/badges";
import { routes } from "@/config/routes";
import { formatDate, toNumber } from "@/lib/format";
import { formatCountryLabel } from "@/lib/countries";
import { translate } from "@/i18n/translate";

export default function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const supplierId = Number(id);
  if (!Number.isInteger(supplierId)) notFound();

  const query = useSupplier(supplierId);
  const [editOpen, setEditOpen] = useState(false);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [blacklistOpen, setBlacklistOpen] = useState(false);

  if (query.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
  }

  const supplier = query.data;
  const reliabilityScore = toNumber(supplier.reliability_score);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: translate("page.suppliers.title"), href: routes.suppliers.list }, { label: supplier.company_name }]}
        title={supplier.company_name}
        badges={
          <>
            <Badge tone={SUPPLIER_RELIABILITY_TONES[supplier.reliability]}>{translate("t.fiabiliteLabel")} {SUPPLIER_RELIABILITY_LABELS[supplier.reliability]}</Badge>
            <Badge tone={supplier.is_active ? "success" : "neutral"}>{supplier.is_active ? translate("t.actif") : translate("t.inactif")}</Badge>
            {supplier.is_blacklisted ? (
              <Badge tone="destructive">
                <Ban className="mr-1 h-3 w-3" />
                {translate("field.listeNoire")}
              </Badge>
            ) : null}
          </>
        }
        description={supplier.contact_name ? translate("t.contactPrefix", { x: supplier.contact_name }) : undefined}
        actions={
          <>
            <Button variant="outline" onClick={() => setVerifyOpen(true)}>
              <BadgeCheck className="h-4 w-4" />
              {translate("t.verifierBtn")}
            </Button>
            <Button variant="outline" onClick={() => setBlacklistOpen(true)}>
              <Ban className="h-4 w-4" />
              {translate("field.listeNoire")}
            </Button>
            <Button onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              {translate("action.edit")}
            </Button>
          </>
        }
      />

      <SummaryCard
        title={translate("section.generalInfo")}
        indicator={
          reliabilityScore !== null ? (
            <div className="flex items-center gap-3.5">
              <span className="text-[9.5px] font-semibold tracking-[0.14em] text-text-tertiary uppercase">{translate("t.scoreDeFiabilite")}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-[28px] leading-none font-extrabold tracking-[-0.03em] text-foreground">{reliabilityScore.toFixed(1)}</span>
                <span className="text-[12.5px] font-semibold text-text-tertiary">/ 5</span>
              </div>
              <div className="h-[7px] w-[120px] overflow-hidden rounded-full bg-neutral-bg">
                <div
                  className={`h-full rounded-full ${SUPPLIER_RELIABILITY_BAR_CLASSES[supplier.reliability]}`}
                  style={{ width: `${(reliabilityScore / 5) * 100}%` }}
                />
              </div>
            </div>
          ) : null
        }
        fields={[
          { label: translate("field.nomDuContact"), value: supplier.contact_name ?? "—" },
          { label: translate("badge.suppliers.communicationChannel.PHONE"), value: supplier.phone ?? "—" },
          { label: "WhatsApp", value: supplier.whatsapp ?? "—" },
          { label: "WeChat", value: supplier.wechat_id ?? "—" },
          { label: translate("field.eMail"), value: supplier.email ?? "—" },
          { label: translate("field.siteWeb"), value: supplier.website ?? "—" },
          { label: translate("t.profilAlibaba"), value: supplier.alibaba_profile_url ?? "—" },
          { label: translate("t.denominationLegale"), value: supplier.legal_name ?? "—" },
          { label: translate("field.province"), value: supplier.province ?? "—" },
          { label: translate("field.ville"), value: supplier.city ?? "—" },
          { label: translate("field.pays"), value: formatCountryLabel(supplier.country) },
          { label: translate("field.adresse"), value: supplier.address_line ?? "—" },
          { label: translate("t.creeLe"), value: formatDate(supplier.created_at) },
          { label: translate("field.conditionsDePaiement"), value: supplier.payment_terms ?? "—", className: "sm:col-span-2" },
          { label: translate("field.notes"), value: supplier.notes ?? "—", className: "sm:col-span-2" },
        ]}
        alert={
          supplier.is_blacklisted && supplier.blacklist_reason ? (
            <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive-bg p-3.5">
              <Ban className="h-5 w-5 shrink-0 text-destructive" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[12.5px] font-bold text-destructive">{translate("t.fournisseurEnListeNoire")}</span>
                <span className="text-pretty text-[12.5px] leading-relaxed text-destructive">{supplier.blacklist_reason}</span>
              </div>
            </div>
          ) : null
        }
      />

      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts">
            <Users className="h-[18px] w-[18px]" />
            {translate("tab.contacts")}
          </TabsTrigger>
          <TabsTrigger value="bank-accounts">
            <Landmark className="h-[18px] w-[18px]" />
            {translate("t.comptesBancairesTab")}
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FolderOpen className="h-[18px] w-[18px]" />
            {translate("tab.documents")}
          </TabsTrigger>
          <TabsTrigger value="evaluations">
            <Star className="h-[18px] w-[18px]" />
            {translate("t.evaluationsTab")}
          </TabsTrigger>
          <TabsTrigger value="communications">
            <MessagesSquare className="h-[18px] w-[18px]" />
            {translate("t.historiqueDeCommunicationTab")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="contacts">
          <ContactsTab supplierId={supplier.id} />
        </TabsContent>
        <TabsContent value="bank-accounts">
          <BankAccountsTab supplierId={supplier.id} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab supplierId={supplier.id} />
        </TabsContent>
        <TabsContent value="evaluations">
          <EvaluationsTab supplierId={supplier.id} />
        </TabsContent>
        <TabsContent value="communications">
          <CommunicationLogsTab supplierId={supplier.id} />
        </TabsContent>
      </Tabs>

      <SupplierFormDialog open={editOpen} onOpenChange={setEditOpen} supplier={supplier} />
      <VerifySupplierDialog open={verifyOpen} onOpenChange={setVerifyOpen} supplierId={supplier.id} />
      <BlacklistSupplierDialog
        open={blacklistOpen}
        onOpenChange={setBlacklistOpen}
        supplierId={supplier.id}
        currentlyBlacklisted={supplier.is_blacklisted}
        currentReason={supplier.blacklist_reason}
      />
    </div>
  );
}
