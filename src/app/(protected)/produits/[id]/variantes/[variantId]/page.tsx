"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { SlidersHorizontal, Truck, History } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/data-display/page-header";
import { ErrorState } from "@/components/data-display/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsCount, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VariantAttributesTab } from "@/modules/products/components/variant-attributes-tab";
import { VariantSuppliersTab } from "@/modules/products/components/variant-suppliers-tab";
import { VariantPriceHistoryTab } from "@/modules/products/components/variant-price-history-tab";
import { useProduct } from "@/modules/products/hooks/use-product";
import { useProductVariant } from "@/modules/products/hooks/use-product-variants";
import { VARIANT_LEVEL_LABELS, VARIANT_LEVEL_TONES } from "@/modules/products/badges";
import { routes } from "@/config/routes";
import { formatCurrency } from "@/lib/format";
import { translate } from "@/i18n/translate";

export default function VariantDetailPage({ params }: { params: Promise<{ id: string; variantId: string }> }) {
  const { id, variantId } = use(params);
  const productId = Number(id);
  const variantIdNum = Number(variantId);
  if (!Number.isInteger(productId) || !Number.isInteger(variantIdNum)) notFound();

  const productQuery = useProduct(productId);
  const variantQuery = useProductVariant(productId, variantIdNum);
  const [tab, setTab] = useState<"attributes" | "suppliers" | "price-history">("attributes");

  if (productQuery.isLoading || variantQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (variantQuery.isError || !variantQuery.data) {
    return <ErrorState error={variantQuery.error} onRetry={() => variantQuery.refetch()} />;
  }

  const variant = variantQuery.data;
  const productName = productQuery.data?.name ?? translate("t.produitFallback");

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: translate("page.products.title"), href: routes.products.list },
          { label: productName, href: routes.products.detail(productId) },
          { label: variant.sku },
        ]}
        title={variant.name}
        badges={
          <>
            <Badge tone={VARIANT_LEVEL_TONES[variant.level]}>{VARIANT_LEVEL_LABELS[variant.level]}</Badge>
            <Badge tone={variant.is_active ? "success" : "neutral"}>{variant.is_active ? translate("value.activeF") : translate("value.inactiveF")}</Badge>
            {variant.is_default ? <Badge tone="accent">{translate("t.varianteParDefaut")}</Badge> : null}
          </>
        }
        description={`SKU ${variant.sku} · ${translate("t.achatPrefix")} ${formatCurrency(variant.purchase_price, variant.purchase_currency.code)}${
          variant.sale_price !== null && variant.sale_currency ? ` · ${translate("t.ventePrefix")} ${formatCurrency(variant.sale_price, variant.sale_currency.code)}` : ""
        }`}
      />

      <div className="flex flex-col gap-4 rounded-[14px] border border-border bg-surface p-5">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{translate("t.informationsDeLaVariante")}</p>
        <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label={translate("field.codeBarres")} value={variant.barcode ?? "—"} />
          <InfoItem label={translate("field.moq")} value={variant.moq ? String(variant.moq) : "—"} />
          <InfoItem label={translate("t.margeLabel")} value={variant.margin_rate ? `${variant.margin_rate}%` : variant.margin_amount ? formatCurrency(variant.margin_amount) : "—"} />
          <InfoItem label={translate("t.poidsEstime")} value={variant.estimated_weight_kg ? `${variant.estimated_weight_kg} kg` : "—"} />
          <InfoItem label={translate("t.volumeEstime")} value={variant.estimated_volume_cbm ? `${variant.estimated_volume_cbm} m³` : "—"} />
          {variant.description ? <InfoItem label={translate("field.description")} value={variant.description} className="sm:col-span-2 lg:col-span-3" /> : null}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
        <TabsList>
          <TabsTrigger value="attributes">
            <SlidersHorizontal className="h-[18px] w-[18px]" />
            {translate("t.attributsPersonnalises")}
            <TabsCount>{variant.attribute_values.length}</TabsCount>
          </TabsTrigger>
          <TabsTrigger value="suppliers">
            <Truck className="h-[18px] w-[18px]" />
            {translate("t.fournisseursLies")}
            <TabsCount>{variant.supplier_links.length}</TabsCount>
          </TabsTrigger>
          <TabsTrigger value="price-history">
            <History className="h-[18px] w-[18px]" />
            {translate("t.historiqueDesPrix")}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="attributes">
          <VariantAttributesTab productId={productId} variantId={variantIdNum} attributeValues={variant.attribute_values} />
        </TabsContent>
        <TabsContent value="suppliers">
          <VariantSuppliersTab productId={productId} variantId={variantIdNum} links={variant.supplier_links} />
        </TabsContent>
        <TabsContent value="price-history">
          <VariantPriceHistoryTab productId={productId} variantId={variantIdNum} />
        </TabsContent>
      </Tabs>
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
