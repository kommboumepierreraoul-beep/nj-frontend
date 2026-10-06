"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { VariantFormDialog } from "./variant-form-dialog";
import { useProductVariants } from "../hooks/use-product-variants";
import { useDeleteVariant } from "../hooks/use-variant-mutations";
import { VARIANT_LEVEL_LABELS, VARIANT_LEVEL_TONES } from "../badges";
import { formatCurrency } from "@/lib/format";
import { routes } from "@/config/routes";
import type { ProductVariant } from "../types";
import { translate } from "@/i18n/translate";

/** Section « Variantes » de la fiche produit (Doc/spec_pages_produits.md § 3.4). */
export function VariantsTab({ productId }: { productId: number }) {
  const router = useRouter();
  const query = useProductVariants(productId);
  const deleteMutation = useDeleteVariant(productId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ProductVariant | null>(null);
  const [toDelete, setToDelete] = useState<ProductVariant | null>(null);

  const columns: DataTableColumn<ProductVariant>[] = [
    {
      key: "sku",
      header: "SKU",
      render: (row) => (
        <Link href={routes.products.variantDetail(productId, row.id)} className="font-medium text-accent-hover hover:underline">
          {row.sku}
        </Link>
      ),
    },
    { key: "name", header: "Nom", render: (row) => row.name },
    { key: "level", header: "Niveau", render: (row) => <Badge tone={VARIANT_LEVEL_TONES[row.level]}>{VARIANT_LEVEL_LABELS[row.level]}</Badge> },
    { key: "purchase_price", header: "Prix d'achat", render: (row) => formatCurrency(row.purchase_price, row.purchase_currency.code) },
    { key: "sale_price", header: "Prix de vente", render: (row) => (row.sale_price !== null && row.sale_currency ? formatCurrency(row.sale_price, row.sale_currency.code) : "—") },
    {
      key: "default",
      header: "",
      render: (row) => (row.is_default ? <Badge tone="accent"><Star className="mr-1 h-3 w-3" />{translate("t.defaut")}</Badge> : null),
    },
    { key: "status", header: "Statut", render: (row) => <Badge tone={row.is_active ? "success" : "neutral"}>{row.is_active ? "Active" : "Inactive"}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" title={translate("t.detailVariante")} onClick={() => router.push(routes.products.variantDetail(productId, row.id))}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Modifier"
            onClick={() => {
              setEditing(row);
              setFormOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Supprimer" onClick={() => setToDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.variantes")}</p>
          <p className="text-xs text-text-tertiary">{translate("t.uneSeuleVarianteParDefautParProduit")}</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Ajouter une variante
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
        emptyTitle="Aucune variante"
        emptyDescription={translate("t.ajoutezLaPremiereVarianteDeCeProduit")}
      />
      <VariantFormDialog open={formOpen} onOpenChange={setFormOpen} productId={productId} variant={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={translate("t.supprimerCetteVariante")}
        description={translate("t.cetteActionEstIrreversible")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) });
        }}
      />
    </div>
  );
}
