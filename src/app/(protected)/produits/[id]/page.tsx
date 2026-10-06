"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Pencil, ShieldAlert, Layers, Tag as TagIcon, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { ErrorState } from "@/components/data-display/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsCount, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttachmentDropzone } from "@/components/forms/attachment-dropzone";
import { ProductFormDialog } from "@/modules/products/components/product-form-dialog";
import { ProductImageGallery } from "@/modules/products/components/product-image-gallery";
import { ProductTagsTab } from "@/modules/products/components/product-tags-tab";
import { VariantsTab } from "@/modules/products/components/variants-tab";
import { useProduct } from "@/modules/products/hooks/use-product";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_TONES } from "@/modules/products/badges";
import { routes } from "@/config/routes";
import { formatDate } from "@/lib/format";
import { formatCountryLabel } from "@/lib/countries";
import { translate } from "@/i18n/translate";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const query = useProduct(productId);
  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState<"variants" | "tags" | "documents">("variants");

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

  const product = query.data;

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: translate("page.products.title"), href: routes.products.list }, { label: product.name }]}
        title={product.name}
        badges={
          <>
            <Badge tone={PRODUCT_STATUS_TONES[product.status]}>{PRODUCT_STATUS_LABELS[product.status]}</Badge>
            {product.is_sensitive ? (
              <Badge tone="destructive">
                <ShieldAlert className="mr-1 h-3 w-3" />
                {translate("col.sensitive")}
              </Badge>
            ) : null}
          </>
        }
        description={`${translate("t.referenceX", { x: product.reference })}${product.category ? ` · ${product.category.name}` : ""}`}
        actions={
          <Button onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            {translate("action.edit")}
          </Button>
        }
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <ProductImageGallery productId={product.id} />

        <div className="flex flex-col gap-4 rounded-[14px] border border-border bg-surface p-5">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.informationsGenerales")}</p>
          <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <InfoItem label={translate("field.marque")} value={product.brand ?? "—"} />
            <InfoItem label={translate("field.paysDOrigine")} value={formatCountryLabel(product.country_of_origin)} />
            <InfoItem label={translate("t.uniteParDefaut")} value={product.default_unit?.name ?? "—"} />
            <InfoItem label={translate("t.poidsParDefaut")} value={product.default_weight_kg ? `${product.default_weight_kg} kg` : "—"} />
            <InfoItem label={translate("t.volumeParDefaut")} value={product.default_volume_cbm ? `${product.default_volume_cbm} m³` : "—"} />
            <InfoItem label={translate("t.quantiteMinimaleDeCommande")} value={product.min_order_quantity ? String(product.min_order_quantity) : "—"} />
            <InfoItem label={translate("t.creeLe")} value={formatDate(product.created_at)} />
            {product.is_sensitive && product.sensitivity_reason ? (
              <InfoItem label={translate("t.motifDeSensibilite")} value={product.sensitivity_reason} className="sm:col-span-2" />
            ) : null}
            {product.description ? <InfoItem label={translate("field.description")} value={product.description} className="sm:col-span-2" /> : null}
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList>
          <TabsTrigger value="variants">
            <Layers className="h-[18px] w-[18px]" />
            {translate("t.variantes")}
            <TabsCount>{product.variants_count ?? 0}</TabsCount>
          </TabsTrigger>
          <TabsTrigger value="tags">
            <TagIcon className="h-[18px] w-[18px]" />
            {translate("t.tags")}
            <TabsCount>{product.tags?.length ?? 0}</TabsCount>
          </TabsTrigger>
          <TabsTrigger value="documents">
            <Images className="h-[18px] w-[18px]" />
            {translate("tab.attachments")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="variants">
          <VariantsTab productId={product.id} />
        </TabsContent>
        <TabsContent value="tags">
          <ProductTagsTab productId={product.id} assignedTags={product.tags ?? []} />
        </TabsContent>
        <TabsContent value="documents">
          <AttachmentDropzone attachableType="product" attachableId={product.id} mediaTypes={["PRODUCT_IMAGE", "OTHER"]} allowPrimary />
        </TabsContent>
      </Tabs>

      <ProductFormDialog open={editOpen} onOpenChange={setEditOpen} product={product} />
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
