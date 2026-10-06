"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Pencil, ShieldAlert, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/data-display/page-header";
import { ErrorState } from "@/components/data-display/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { AttachmentDropzone } from "@/components/forms/attachment-dropzone";
import { CategoryBadge } from "@/modules/clients/components/category-badge";
import { ClientFormDialog } from "@/modules/clients/components/client-form-dialog";
import { ContactsTab } from "@/modules/clients/components/contacts-tab";
import { TagsTab } from "@/modules/clients/components/tags-tab";
import { ChangeStatusDialog } from "@/modules/clients/components/change-status-dialog";
import { AdjustValueSegmentDialog } from "@/modules/clients/components/adjust-value-segment-dialog";
import { useClient } from "@/modules/clients/hooks/use-client";
import {
  BILLING_MODE_LABELS,
  CLIENT_STATUS_LABELS,
  CLIENT_STATUS_TONES,
  CLIENT_TYPE_LABELS,
  VALUE_SEGMENT_LABELS,
  VALUE_SEGMENT_TONES,
} from "@/modules/clients/badges";
import { routes } from "@/config/routes";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatCountryLabel } from "@/lib/countries";
import { translate } from "@/i18n/translate";

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const clientId = Number(id);
  if (!Number.isInteger(clientId)) notFound();

  const query = useClient(clientId);
  const [editOpen, setEditOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [segmentOpen, setSegmentOpen] = useState(false);

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

  const client = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: translate("page.clients.title"), href: routes.clients.list }, { label: client.full_name }]}
        title={client.full_name}
        badges={
          <>
            <CategoryBadge category={client.category} />
            <Badge tone={CLIENT_STATUS_TONES[client.status]}>{CLIENT_STATUS_LABELS[client.status]}</Badge>
            <Badge tone={VALUE_SEGMENT_TONES[client.value_segment]}>{VALUE_SEGMENT_LABELS[client.value_segment]}</Badge>
            <Badge tone="neutral">{CLIENT_TYPE_LABELS[client.client_type]}</Badge>
          </>
        }
        description={client.preferred_contact ? `${client.preferred_contact.channel_type.label} · ${client.preferred_contact.value}` : translate("t.aucunContactPrefereDefini")}
        actions={
          <>
            <Button variant="outline" onClick={() => setStatusOpen(true)}>
              <ShieldAlert className="h-4 w-4" />
              {translate("t.changerLeStatut")}
            </Button>
            <Button variant="outline" onClick={() => setSegmentOpen(true)}>
              <UserCheck className="h-4 w-4" />
              {translate("t.ajusterLeSegmentBtn")}
            </Button>
            <Button onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              {translate("action.edit")}
            </Button>
          </>
        }
      />

      {/* Ordre calqué sur `sf()` de viewClient() (NJ Global Trade
          Clients.dc.html lignes 1205-1210) : type/dénomination/provenance/
          parrain, puis localisation complète, puis préférences commerciales. */}
      <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3">
        <InfoItem label={translate("field.type")} value={CLIENT_TYPE_LABELS[client.client_type]} />
        <InfoItem label={translate("t.denominationLegale")} value={client.legal_name ?? "—"} />
        <InfoItem label={translate("ph.provenance")} value={client.category?.label ?? "—"} />
        <InfoItem label={translate("t.parrainePar")} value={client.referred_by_client?.full_name ?? "—"} />
        <InfoItem label={translate("field.pays")} value={formatCountryLabel(client.country)} />
        <InfoItem label={translate("field.ville")} value={client.city ?? "—"} />
        <InfoItem label={translate("t.region")} value={client.region ?? "—"} />
        <InfoItem label={translate("field.adresse")} value={client.address_line ?? "—"} />
        <InfoItem label={translate("t.devisePreferee")} value={client.preferred_currency?.code ?? "—"} />
        <InfoItem label={translate("t.languePreferee")} value={client.preferred_language} />
        <InfoItem label={translate("field.modeDeFacturation")} value={BILLING_MODE_LABELS[client.billing_mode]} />
        <InfoItem label={translate("t.validiteProforma")} value={client.proforma_validity_days ? translate("t.xJours", { x: client.proforma_validity_days }) : translate("t.defaut7Jours")} />
        <InfoItem
          label={translate("t.commission")}
          value={client.has_custom_commission && client.custom_commission_rate !== null ? `${translate("t.derogatoireLabel")} — ${formatCurrency(client.custom_commission_rate)}` : translate("t.baremeStandard")}
        />
        <InfoItem label={translate("t.creeLe")} value={formatDate(client.created_at)} />
        {client.internal_notes ? <InfoItem label={translate("field.notesInternes")} value={client.internal_notes} className="sm:col-span-2 lg:col-span-3" /> : null}
      </div>

      <Tabs defaultValue="contacts">
        <TabsList>
          <TabsTrigger value="contacts">{translate("tab.contacts")}</TabsTrigger>
          <TabsTrigger value="tags">{translate("tab.tags")}</TabsTrigger>
          <TabsTrigger value="documents">{translate("tab.documents")}</TabsTrigger>
        </TabsList>
        <TabsContent value="contacts">
          <ContactsTab clientId={client.id} />
        </TabsContent>
        <TabsContent value="tags">
          <TagsTab clientId={client.id} assignedTags={client.tags ?? []} />
        </TabsContent>
        <TabsContent value="documents">
          <AttachmentDropzone attachableType="client" attachableId={client.id} mediaTypes={["CLIENT_DOCUMENT", "OTHER"]} />
        </TabsContent>
      </Tabs>

      <ClientFormDialog open={editOpen} onOpenChange={setEditOpen} client={client} />
      <ChangeStatusDialog open={statusOpen} onOpenChange={setStatusOpen} clientId={client.id} currentStatus={client.status} />
      <AdjustValueSegmentDialog open={segmentOpen} onOpenChange={setSegmentOpen} clientId={client.id} currentSegment={client.value_segment} />
    </div>
  );
}

function InfoItem({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm text-foreground">{value}</p>
    </div>
  );
}
