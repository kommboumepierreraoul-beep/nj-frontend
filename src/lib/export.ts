/**
 * Export client-side de listes/documents (Doc/design_system_maquette_complete.md
 * § 4.7 « Export ») : « disponible sur les listes qui l'exposent côté API [...]
 * reprend exactement les filtres actifs, formats PDF/Excel/CSV ». Génère le
 * fichier entièrement côté navigateur à partir de lignes déjà chargées (filtrées
 * côté serveur) — aucun endpoint d'export dédié n'existe ni n'est nécessaire :
 * les données transitent déjà par l'API paginée/filtrée existante de chaque
 * module (Commandes, Paiements).
 *
 * Format « Excel » : un tableau HTML habillé en `.xls` (balises Office), pas un
 * vrai classeur OOXML binaire — même technique que NJ Global Trade Template/
 * nj-export.js (mockup) et NJ Global Trade Commandes.dc.html, qui ne produisent
 * pas non plus de `.xlsx` : Excel/LibreOffice/Google Sheets l'ouvrent tel quel.
 */
export type ExportFormat = "PDF" | "XLSX" | "CSV";
export type ExportCell = string | number | null | undefined;
export type ExportRow = ExportCell[];

function escapeHtml(value: ExportCell): string {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function csvEscape(value: ExportCell): string {
  const s = String(value === null || value === undefined ? "" : value);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function triggerDownload(name: string, mime: string, content: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function emitCsv(name: string, rows: ExportRow[]): void {
  const csv = "﻿" + rows.map((row) => (row ?? []).map(csvEscape).join(";")).join("\r\n");
  triggerDownload(`${name}.csv`, "text/csv;charset=utf-8", csv);
}

function emitXlsx(name: string, rows: ExportRow[]): void {
  const body = rows
    .map(
      (row) =>
        `<tr>${(row && row.length ? row : [""])
          .map((cell) => `<td${typeof cell === "number" ? " style=\"mso-number-format:'#,##0'\"" : ""}>${escapeHtml(cell)}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"><style>td{font-family:Arial,sans-serif;font-size:11pt}</style></head><body><table>${body}</table></body></html>`;
  triggerDownload(`${name}.xls`, "application/vnd.ms-excel", html);
}

function emitPdf(name: string, title: string, rows: ExportRow[]): boolean {
  const width = rows.reduce((max, row) => Math.max(max, (row ?? []).length), 1);
  const body = rows
    .map((row) => {
      if (!row || row.length === 0) return `<tr class="sp"><td colspan="${width}"></td></tr>`;
      const isHeading = row.length === 1 || (row.length <= 3 && /^[A-Z0-9ÉÈÀÇÙÊÎÔÛ' \-]+$/.test(String(row[0])));
      return `<tr${isHeading ? ' class="h"' : ""}>${row
        .map((cell) => `<td${typeof cell === "number" ? ' class="n"' : ""}>${escapeHtml(typeof cell === "number" ? cell.toLocaleString("fr-FR") : cell)}</td>`)
        .join("")}</tr>`;
    })
    .join("");
  const html =
    `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>` +
    "@page{size:A4 landscape;margin:14mm}body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:0}" +
    ".hd{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #E5A817;padding-bottom:10px;margin-bottom:18px}" +
    ".br{font-size:15px;font-weight:800;letter-spacing:-.02em}.sb{font-size:8px;font-weight:600;letter-spacing:.14em;color:#999}" +
    "h1{font-size:18px;margin:0 0 2px;letter-spacing:-.02em}.mt{font-size:10px;color:#666}" +
    "table{width:100%;border-collapse:collapse;font-size:9.5px}td{padding:5px 7px;border-bottom:1px solid #EEE;vertical-align:top}" +
    "td.n{text-align:right;font-variant-numeric:tabular-nums}tr.h td{background:#F4F4F4;font-weight:700;font-size:9px;letter-spacing:.06em;text-transform:uppercase;border-bottom:1px solid #DDD}" +
    "tr.sp td{border:0;height:10px}.ft{margin-top:18px;border-top:1px solid #E6E6E6;padding-top:8px;font-size:8.5px;color:#999}" +
    `</style></head><body><div class="hd"><div><div class="br">NJ GLOBAL TRADE</div><div class="sb">YOUR PRESENCE IN CHINA</div></div>` +
    `<div style="text-align:right"><h1>${escapeHtml(title)}</h1><div class="mt">Édité le ${new Intl.DateTimeFormat("fr-FR").format(new Date())}</div></div></div>` +
    `<table>${body}</table>` +
    `<div class="ft">NJ Global Trade Co. Ltd — document généré automatiquement depuis le back-office.</div>` +
    "<script>window.onload=function(){window.print()}<\\/script></body></html>";
  const win = window.open("", "_blank");
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  return true;
}

/**
 * Point d'entrée unique, appelé par `ExportDialog` une fois le format choisi.
 * Retourne `false` seulement pour PDF si le navigateur bloque la fenêtre
 * (pop-up) — CSV/XLSX déclenchent toujours un téléchargement direct.
 */
export function exportRows(format: ExportFormat, name: string, title: string, rows: ExportRow[]): boolean {
  if (format === "CSV") {
    emitCsv(name, rows);
    return true;
  }
  if (format === "XLSX") {
    emitXlsx(name, rows);
    return true;
  }
  return emitPdf(name, title, rows);
}

/** Horodatage court pour les noms de fichiers (`commandes-2026-08-31`). */
export function exportStamp(): string {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
