"use client";

import { useState } from "react";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, type DataTableColumn } from "@/components/data-display/data-table";
import { TableSection } from "@/components/data-display/table-section";
import { ConfirmDialog } from "@/components/forms/confirm-dialog";
import { BankAccountFormDialog } from "./bank-account-form-dialog";
import { useDeleteSupplierBankAccount, useSupplierBankAccounts } from "../hooks/use-supplier-bank-accounts";
import { PAYMENT_METHOD_LABELS } from "../badges";
import type { SupplierBankAccount } from "../types";
import { translate } from "@/i18n/translate";

function maskAccountNumber(value: string): string {
  if (value.length <= 4) return value;
  return `${"•".repeat(Math.max(value.length - 4, 4))}${value.slice(-4)}`;
}

export function BankAccountsTab({ supplierId }: { supplierId: number }) {
  const query = useSupplierBankAccounts(supplierId);
  const deleteMutation = useDeleteSupplierBankAccount(supplierId);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierBankAccount | null>(null);
  const [toDelete, setToDelete] = useState<SupplierBankAccount | null>(null);

  const columns: DataTableColumn<SupplierBankAccount>[] = [
    { key: "method", header: translate("col.method"), render: (row) => PAYMENT_METHOD_LABELS[row.method] },
    { key: "account_name", header: "Titulaire", render: (row) => row.account_name },
    { key: "account_number", header: translate("col.number"), render: (row) => <span className="font-mono text-xs">{maskAccountNumber(row.account_number)}</span> },
    { key: "currency", header: "Devise", render: (row) => row.currency.code },
    { key: "default", header: "", render: (row) => (row.is_default ? <Badge tone="accent"><Star className="mr-1 h-3 w-3" />{translate("t.defaut")}</Badge> : null) },
    { key: "status", header: "Statut", render: (row) => <Badge tone={row.is_active ? "success" : "neutral"}>{row.is_active ? "Actif" : "Inactif"}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => { setEditing(row); setFormOpen(true); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setToDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <TableSection
        title="COMPTES BANCAIRES ET MOYENS DE PAIEMENT"
        hint={translate("t.lesNumerosDeCompteSontPartiellementMasques")}
        action={
          <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            Ajouter un moyen de paiement
          </Button>
        }
      >
        <DataTable
          columns={columns}
          data={query.data}
          isLoading={query.isLoading}
          isError={query.isError}
          error={query.error}
          onRetry={() => query.refetch()}
          rowKey={(row) => row.id}
          emptyTitle="Aucun moyen de paiement"
          emptyDescription={translate("t.enregistrezAuMoinsUnComptePourReglerCeFournisseur")}
          className="rounded-t-none border-0"
        />
      </TableSection>
      <BankAccountFormDialog open={formOpen} onOpenChange={setFormOpen} supplierId={supplierId} account={editing} />
      <ConfirmDialog
        open={Boolean(toDelete)}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Supprimer ce compte ?"
        description={translate("t.cetteActionEstIrreversible")}
        confirmLabel="Supprimer"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (toDelete) deleteMutation.mutate(toDelete.id, { onSuccess: () => setToDelete(null) }); }}
      />
    </div>
  );
}
