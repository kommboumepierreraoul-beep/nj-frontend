/**
 * Lecture CSV côté navigateur pour l'import de listes (bouton « Importer » des
 * en-têtes de page, cf. NJ Global Trade Template — `nj-export.js` produit le
 * pendant « Exporter »). Volontairement minimal : pas de dépendance, un
 * séparateur auto-détecté (`;` du template FR, ou `,`), gestion des champs
 * entre guillemets avec `""` échappé, BOM et fins de ligne CRLF/LF.
 *
 * Le fichier lu ne quitte jamais le navigateur : `parseCsv` transforme le
 * texte en lignes, `toRecords` mappe chaque ligne sur un objet selon les
 * en-têtes attendus, puis l'appelant crée les enregistrements un par un via
 * l'API existante (aucun endpoint d'import en masse côté backend).
 */

export interface ParsedCsv {
  headers: string[];
  rows: string[][];
}

function detectDelimiter(firstLine: string): "," | ";" | "\t" {
  const counts: Record<string, number> = { ",": 0, ";": 0, "\t": 0 };
  let inQuotes = false;
  for (const char of firstLine) {
    if (char === '"') inQuotes = !inQuotes;
    else if (!inQuotes && char in counts) counts[char] += 1;
  }
  if (counts[";"] >= counts[","] && counts[";"] >= counts["\t"]) return ";";
  if (counts["\t"] > counts[","]) return "\t";
  return ",";
}

/** Découpe le texte CSV en `headers` (1re ligne non vide) + `rows`. */
export function parseCsv(text: string): ParsedCsv {
  const clean = text.replace(/^﻿/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (clean.trim() === "") return { headers: [], rows: [] };

  const firstNewline = clean.indexOf("\n");
  const sampleLine = firstNewline === -1 ? clean : clean.slice(0, firstNewline);
  const delimiter = detectDelimiter(sampleLine);

  const records: string[][] = [];
  let field = "";
  let record: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < clean.length; i += 1) {
    const char = clean[i];

    if (inQuotes) {
      if (char === '"') {
        if (clean[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === delimiter) {
      record.push(field);
      field = "";
    } else if (char === "\n") {
      record.push(field);
      records.push(record);
      record = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || record.length > 0) {
    record.push(field);
    records.push(record);
  }

  const nonEmpty = records.filter((r) => r.some((cell) => cell.trim() !== ""));
  if (nonEmpty.length === 0) return { headers: [], rows: [] };

  const [headerRow, ...rows] = nonEmpty;
  return { headers: headerRow.map((h) => h.trim()), rows };
}

export interface CsvColumnSpec {
  /** Clé de sortie dans le `record` mappé. */
  field: string;
  /** Libellé humain — c'est ce texte qui doit figurer en en-tête du CSV. */
  label: string;
  required?: boolean;
  /** Autres en-têtes acceptés pour cette colonne (tolérance de nommage). */
  aliases?: string[];
  /** Exemple affiché dans l'aide et le modèle téléchargeable. */
  example?: string;
}

export interface MappedRecord {
  /** Numéro de ligne dans le fichier (1 = en-tête, donc les données commencent à 2). */
  line: number;
  values: Record<string, string>;
  missing: string[];
}

const COMBINING_MARKS = /[̀-ͯ]/g;

function normalizeHeader(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Associe chaque en-tête du fichier à une colonne attendue, puis mappe les lignes. */
export function toRecords(parsed: ParsedCsv, columns: CsvColumnSpec[]): { records: MappedRecord[]; unknownHeaders: string[] } {
  const index = new Map<string, string>();
  for (const column of columns) {
    for (const candidate of [column.label, column.field, ...(column.aliases ?? [])]) {
      index.set(normalizeHeader(candidate), column.field);
    }
  }

  const headerFields = parsed.headers.map((header) => index.get(normalizeHeader(header)) ?? null);
  const unknownHeaders = parsed.headers.filter((_, i) => headerFields[i] === null);

  const records = parsed.rows.map((row, rowIndex) => {
    const values: Record<string, string> = {};
    headerFields.forEach((fieldKey, colIndex) => {
      if (fieldKey) values[fieldKey] = (row[colIndex] ?? "").trim();
    });
    const missing = columns.filter((c) => c.required && !values[c.field]).map((c) => c.label);
    return { line: rowIndex + 2, values, missing };
  });

  return { records, unknownHeaders };
}

/** Contenu d'un CSV modèle : une seule ligne d'en-tête (+ une ligne d'exemple si fournie). */
export function buildTemplateCsv(columns: CsvColumnSpec[]): string {
  const header = columns.map((c) => c.label).join(";");
  const example = columns.some((c) => c.example) ? "\n" + columns.map((c) => c.example ?? "").join(";") : "";
  return "﻿" + header + example + "\n";
}

export function downloadTextFile(name: string, mime: string, content: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
