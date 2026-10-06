"use client";

import { formatCurrency, formatDate, toNumber } from "@/lib/format";
import type { SalesOrder } from "@/modules/sales-orders/types";
import { translate } from "@/i18n/translate";

/**
 * Aperçu du document avant émission (§ demande : « aperçu avant émission » du
 * flux proforma). Reprend la direction graphique du gabarit PDF réel
 * (resources/views/pdf/invoice_proforma.blade.php côté nj-backend et
 * NJ Global Trade Template — `nj-export.js` `emitDoc`) : bandeau de marque
 * souligné d'ambre, bloc « PROFORMA », méta client/date/validité, tableau des
 * lignes retenues, cartouche de totaux, pied de page. Rendu à partir des
 * données déjà chargées de la commande — aucun appel réseau, c'est une
 * prévisualisation, pas le PDF définitif (généré par le backend à la
 * confirmation).
 */
export function ProformaPreview({ salesOrder, versionLabel }: { salesOrder: SalesOrder; versionLabel: string }) {
  const currency = salesOrder.currency.code;
  const lines = (salesOrder.items ?? []).filter((item) => item.is_selected);

  return (
    <div className="overflow-hidden rounded-md border border-border bg-white text-[11px] leading-relaxed text-[#111]">
      {/* En-tête de marque */}
      <div className="flex items-start justify-between border-b-[3px] border-[#E5A817] px-4 pb-2.5 pt-3">
        <div>
          <div className="text-[13px] font-extrabold tracking-tight">NJ GLOBAL TRADE</div>
          <div className="text-[7px] font-semibold tracking-[0.15em] text-[#999]">YOUR PRESENCE IN CHINA</div>
        </div>
        <div className="text-right">
          <div className="text-[15px] font-extrabold leading-none tracking-tight">PROFORMA</div>
          <div className="mt-1 text-[10px] font-bold text-[#E5A817]">{salesOrder.reference}</div>
          <div className="mt-1 inline-block rounded bg-[#F4F4F4] px-2 py-0.5 text-[7px] font-bold tracking-[0.1em]">{versionLabel}</div>
        </div>
      </div>

      {/* Méta */}
      <div className="flex flex-wrap gap-x-7 gap-y-1 px-4 py-2.5">
        {[
          ["CLIENT", salesOrder.client.full_name],
          ["DATE", formatDate(salesOrder.order_date)],
          [translate("t.validite2"), salesOrder.valid_until ? `jusqu'au ${formatDate(salesOrder.valid_until)}` : `${salesOrder.validity_days ?? 7} jours`],
          ["DEVISE", currency],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col">
            <span className="text-[7px] font-bold tracking-[0.12em] text-[#999]">{label}</span>
            <span className="text-[10px] font-semibold">{value}</span>
          </div>
        ))}
      </div>

      {/* Lignes */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#111] text-white">
            <th className="px-3 py-1.5 text-left text-[7.5px] font-bold uppercase tracking-[0.1em]">{translate("t.designation")}</th>
            <th className="px-3 py-1.5 text-right text-[7.5px] font-bold uppercase tracking-[0.1em]">{translate("t.qte")}</th>
            <th className="px-3 py-1.5 text-right text-[7.5px] font-bold uppercase tracking-[0.1em]">P.U.</th>
            <th className="px-3 py-1.5 text-right text-[7.5px] font-bold uppercase tracking-[0.1em]">{translate("t.montant")}</th>
          </tr>
        </thead>
        <tbody>
          {lines.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-3 py-3 text-center text-[#999]">
                Aucune ligne sélectionnée sur cette commande.
              </td>
            </tr>
          ) : (
            lines.map((item) => (
              <tr key={item.id} className="border-b border-[#EEE]">
                <td className="px-3 py-1.5">{item.product_variant ? `${item.product_variant.sku} — ${item.product_variant.name}` : item.label}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{item.quantity}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">{formatCurrency(item.unit_price, currency)}</td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {formatCurrency(
                    (toNumber(item.quantity) ?? 0) * (toNumber(item.unit_price) ?? 0) - (toNumber(item.discount_amount) ?? 0),
                    currency,
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Totaux */}
      <div className="flex justify-end px-4 py-2.5">
        <div className="w-[220px] space-y-1">
          <div className="flex justify-between border-b border-[#EEE] px-2 py-1 text-[#555]">
            <span>Sous-total</span>
            <span className="tabular-nums">{formatCurrency(salesOrder.subtotal_amount, currency)}</span>
          </div>
          {salesOrder.discount_amount ? (
            <div className="flex justify-between border-b border-[#EEE] px-2 py-1 text-[#555]">
              <span>{translate("t.remise")}</span>
              <span className="tabular-nums">− {formatCurrency(salesOrder.discount_amount, currency)}</span>
            </div>
          ) : null}
          {salesOrder.billing_mode === "COMMISSION_VISIBLE" && salesOrder.commission_amount ? (
            <div className="flex justify-between border-b border-[#EEE] px-2 py-1 text-[#555]">
              <span>{translate("t.commission")}</span>
              <span className="tabular-nums">{formatCurrency(salesOrder.commission_amount, currency)}</span>
            </div>
          ) : null}
          <div className="mt-1 flex justify-between rounded bg-[#111] px-2.5 py-2 text-[12px] font-extrabold text-white">
            <span>TOTAL</span>
            <span className="tabular-nums">{formatCurrency(salesOrder.total_amount, currency)}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-1.5 text-[8px] text-[#999]">
        Aperçu indicatif — le PDF définitif (logo, coordonnées, moyens de paiement) est généré par le back-office à la confirmation.
      </div>
    </div>
  );
}
