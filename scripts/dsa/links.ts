import { normalizeUrl } from "./normalize";
import type { InputRow } from "./model";

export interface ProblemLinkCorrection {
  source: string;
  record: string;
  originalUrl: string;
  url: string;
  evidenceUrl: string;
  cell: string;
}

export function applyLinkCorrection(row: InputRow, corrections: ProblemLinkCorrection[]) {
  const correction = corrections.find(
    (entry) => entry.source === row.source && entry.record === row.sourceRecordId
  );
  if (!correction) return row;
  if (normalizeUrl(row.url).url !== normalizeUrl(correction.originalUrl).url) {
    throw new Error(`Reviewed link source changed: ${row.source}:${row.sourceRecordId}`);
  }
  return {
    ...row,
    url: normalizeUrl(correction.url).url,
    metadata: {
      ...row.metadata,
      original_url: row.url,
      link_origin: "original_sheet_hyperlink",
      link_evidence: correction.evidenceUrl,
      link_cell: correction.cell,
    },
  };
}

export function hasSourcedPracticeLink(rows: InputRow[]) {
  return rows.some((row) => row.metadata.link_origin !== "generated_placeholder");
}
