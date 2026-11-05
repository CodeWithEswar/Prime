import { z } from "zod";

export const sourceSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  sourceType: z.enum([
    "sheet",
    "repository",
    "problem_provider",
    "company_dataset",
    "manual",
  ]),
  repositoryUrl: z.string().url().nullable(),
  revision: z.string().min(1),
  license: z.string().nullable(),
  licenseUrl: z.string().url().nullable(),
  attributionRequired: z.boolean(),
  redistributionStatus: z.enum([
    "allowed",
    "metadata_only",
    "review_required",
    "blocked",
  ]),
  approval: z
    .object({
      reason: z.string().min(1),
      evidenceUrl: z.string().url(),
      metadataOnly: z.boolean(),
      basis: z.enum(["license", "user_directed_factual_metadata"]).optional(),
    })
    .nullable(),
  checkedAt: z.string().datetime(),
  evidence: z.string().min(1),
  discovery: z.literal("company-csv-tree").optional(),
  files: z.array(
    z.object({
      path: z.string().min(1),
      format: z.enum([
        "booleanstack-dsa",
        "booleanstack-company",
        "company-csv",
        "fixture",
      ]),
      sha: z.string().min(1),
      company: z.string().optional(),
      timeWindow: z.string().optional(),
    })
  ),
});
export type Source = z.infer<typeof sourceSchema>;
export const rowSchema = z.object({
  source: z.string().min(1),
  sourceRecordId: z.string().min(1).max(500),
  title: z.string().trim().min(1).max(300),
  url: z.string().min(1).max(2048),
  providerId: z.string().optional(),
  difficulty: z.string().default("unknown"),
  topics: z.array(z.string()).default([]),
  sheets: z.array(z.string()).default([]),
  company: z.string().optional(),
  timeWindow: z.string().optional(),
  frequency: z.number().finite().nonnegative().nullable().default(null),
  rawFrequency: z.string().nullable().default(null),
  rawAcceptanceRate: z.string().nullable().default(null),
  order: z.number().int().nonnegative().nullable().default(null),
  metadata: z.record(z.string(), z.unknown()).default({}),
});
export type InputRow = z.infer<typeof rowSchema>;
export type Issue = {
  category: string;
  source?: string;
  record?: string;
  detail: string;
};
export type Review = {
  category: string;
  identities: string[];
  confidence?: number;
  detail: string;
};
export type Overrides = {
  linkCorrections?: import("./links").ProblemLinkCorrection[];
  excludeRecords?: { source: string; record: string; reason: string }[];
  excludedTopicTags?: string[];
  aliases: { alias: string; targetIdentity: string; reason: string }[];
  merges: { fromIdentity: string; toIdentity: string; reason: string }[];
  canonical: Record<
    string,
    {
      title?: string;
      difficulty?: "easy" | "medium" | "hard" | "unknown";
      topicSlugs?: string[];
    }
  >;
};
export type EntityRow = Record<string, string | number | boolean | null | object>;
export type Catalog = {
  mode: "catalog" | "fixture";
  sources: Source[];
  tables: Record<string, EntityRow[]>;
  report: {
    sourcesScanned: number;
    blockedSources: string[];
    rawRows: number;
    validRows: number;
    invalidRows: number;
    quarantinedRows: number;
    canonicalProblems: number;
    exactDuplicates: number;
    aliasMerges: number;
    topicsMapped: number;
    collections: number;
    companies: number;
    companyRelationships: number;
    missingUrls: number;
    invalidUrls: number;
    issues: Issue[];
    review: Review[];
    duplicates: Review[];
    unknownTopics: number;
    unknownCompanies: number;
    difficultyConflicts: number;
    sourceConflicts: number;
    rowsImported: number;
    rowsUpdated: number;
    rowsUnchanged: number;
  };
};
export function canImport(source: Source) {
  return (
    ["allowed", "metadata_only"].includes(source.redistributionStatus) &&
    !!source.approval &&
    (!!source.license ||
      (source.redistributionStatus === "metadata_only" &&
        source.approval?.metadataOnly &&
        source.approval.basis === "user_directed_factual_metadata")) &&
    (source.redistributionStatus !== "metadata_only" || source.approval.metadataOnly)
  );
}
