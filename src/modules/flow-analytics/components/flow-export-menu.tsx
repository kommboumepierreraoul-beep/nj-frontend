"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ApiError } from "@/lib/http/api-error";
import { downloadFlowExport } from "../api/flow-analytics.api";
import type { FlowAnalyticsFilters, FlowReportKey } from "../types";
import { translate } from "@/i18n/translate";

/** § Export — téléchargement direct CSV/PDF, réponse immédiate (pas de génération asynchrone), pour l'onglet actif avec le `period`/`date` en cours. */
export function FlowExportMenu({ flow, filters }: { flow: FlowReportKey; filters: FlowAnalyticsFilters }) {
  const [isPending, setPending] = useState(false);

  async function handleExport(format: "csv" | "pdf") {
    setPending(true);
    try {
      await downloadFlowExport(flow, format, filters);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : translate("toast.exportImpossible"));
    } finally {
      setPending(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" disabled={isPending}>
          <Download className="h-4 w-4" />
          Exporter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => handleExport("csv")}>Export CSV</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleExport("pdf")}>Export PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
