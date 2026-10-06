"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { RecordPriceDialog } from "./record-price-dialog";
import { useVariantPriceHistory } from "../hooks/use-variant-price-history";
import { PRICE_SOURCE_LABELS } from "../badges";
import { formatCurrency, formatDate } from "@/lib/format";
import type { VariantPriceHistoryEntry } from "../types";
import { translate } from "@/i18n/translate";

/** Liste chronologique en lecture seule (Doc/spec_pages_produits.md § 4, onglet « Historique des prix »). */
export function VariantPriceHistoryTab({ productId, variantId }: { productId: number; variantId: number }) {
  const query = useVariantPriceHistory(productId, variantId);
  const [formOpen, setFormOpen] = useState(false);

  const columns: DataTableColumn<VariantPriceHistoryEntry>[] = [
    { key: "date", header: "Date d'effet", render: (row) => formatDate(row.effective_date) },
    { key: "price", header: "Prix", render: (row) => formatCurrency(row.price, row.currency.code) },
    { key: "source", header: "Source", render: (row) => <Badge tone="neutral">{PRICE_SOURCE_LABELS[row.source]}</Badge> },
    { key: "supplier", header: "Fournisseur", render: (row) => row.supplier?.name ?? "—" },
    { key: "created_at", header: translate("t.enregistreLe"), render: (row) => formatDate(row.created_at) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.historiqueDesPrix")}</p>
          <p className="text-xs text-text-tertiary">{translate("t.lectureSeuleLesRelevesNeSontNiModifiablesNiSupprimable")}</p>
        </div>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Enregistrer un nouveau prix
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={query.data}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        onRetry={() => query.refetch()}
        rowKey={(row) => row.id}
        emptyTitle={translate("t.aucunReleveDePrix")}
      />
      <RecordPriceDialog open={formOpen} onOpenChange={setFormOpen} productId={productId} variantId={variantId} />
    </div>
  );
}
