"use client";

import Link from "next/link";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DialogFormHeader } from "@/components/forms/dialog-form-chrome";
import { AuditDiffView } from "./audit-diff-view";
import { ENTITY_TYPE_LABELS, MODULE_LABELS, MODULE_TONES, entityTypeToModule, resolveActionLabel } from "../badges";
import { resolveEntityHref } from "../entity-links";
import { formatDateTime } from "@/lib/format";
import type { AuditLog } from "../types";
import { translate } from "@/i18n/translate";

export function AuditLogDetailDialog({ open, onOpenChange, log }: { open: boolean; onOpenChange: (open: boolean) => void; log: AuditLog | null }) {
  if (!log) return null;
  const auditModule = entityTypeToModule(log.entity_type);
  const href = resolveEntityHref(log.entity_type, log.entity_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px]">
        <div className="flex max-h-[85vh] flex-col">
          <DialogFormHeader title={resolveActionLabel(log.entity_type, log.action)} />
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-6 pb-3 pt-3 text-sm text-muted-foreground">
            <Badge tone={MODULE_TONES[auditModule]}>{MODULE_LABELS[auditModule]}</Badge>
            {href ? (
              <Link href={href} className="text-accent-hover hover:underline">
                {ENTITY_TYPE_LABELS[log.entity_type]}
              </Link>
            ) : (
              <span>{ENTITY_TYPE_LABELS[log.entity_type]}</span>
            )}
            <span>·</span>
            <span>{log.actor ? `${log.actor.full_name} (${log.actor.email})` : translate("t.utilisateurSupprime")}</span>
            <span>·</span>
            <span>{formatDateTime(log.created_at)}</span>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            <AuditDiffView oldValue={log.old_value} newValue={log.new_value} />
          </div>
          {log.ip_address || log.user_agent ? (
            <div className="border-t border-border px-6 py-3 text-xs text-text-tertiary">
              {log.ip_address ? <span>IP : {log.ip_address}</span> : null}
              {log.ip_address && log.user_agent ? <span> · </span> : null}
              {log.user_agent}
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
