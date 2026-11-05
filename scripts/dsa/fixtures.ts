import type { Source, Overrides } from "./model";
// Small PRIME-authored fixtures, not a redistribution of either repository.
export const fixtureSource: Source = {
  slug: "prime-test-fixtures",
  name: "PRIME synthetic importer fixtures",
  sourceType: "manual",
  repositoryUrl: null,
  revision: "fixture-v1",
  license: "CC0-1.0",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
  attributionRequired: false,
  redistributionStatus: "metadata_only",
  approval: {
    reason: "PRIME-authored test inputs; never production content",
    evidenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    metadataOnly: true,
  },
  checkedAt: "2026-10-31T00:00:00Z",
  evidence: "Synthetic fixtures supplied with this pipeline",
  files: [],
};
const base = {
  source: fixtureSource.slug,
  difficulty: "easy",
  topics: ["Arrays"],
  sheets: [],
  metadata: {},
};
export const fixtureRows = [
  {
    ...base,
    sourceRecordId: "one",
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum/",
    sheets: ["AlgoPrep 151"],
  },
  {
    ...base,
    sourceRecordId: "two",
    title: "two sum",
    url: "leetcode.com/problems/two-sum/?envType=study-plan",
    topics: ["Hash Table"],
    sheets: ["Fraz LeetCode"],
  },
  {
    ...base,
    sourceRecordId: "three",
    title: "Two-Sum",
    url: "https://www.leetcode.com/problems/two-sum/description/#test",
    topics: ["HashMap"],
    company: "Facebook",
    timeWindow: "30 days",
    frequency: 88.5,
    rawFrequency: "88.5",
    rawAcceptanceRate: "0.005",
  },
  {
    ...base,
    sourceRecordId: "four",
    title: "Maximum Subarray",
    url: "https://leetcode.com/problems/maximum-subarray",
    difficulty: "medium",
    topics: ["Arrays", "DP"],
  },
  {
    ...base,
    sourceRecordId: "five",
    title: "Kadane's Algorithm",
    url: "https://www.geeksforgeeks.org/problems/kadanes-algorithm/1",
    difficulty: "medium",
    topics: ["Arrays", "Dynamic Programming"],
  },
  {
    ...base,
    sourceRecordId: "six",
    title: "Two Sum",
    url: "https://leetcode.com/problems/two-sum",
    company: "Meta",
    timeWindow: "3 months",
    frequency: 70,
    rawFrequency: "70",
  },
  {
    ...base,
    sourceRecordId: "seven",
    title: "Two Sum",
    url: "https://example.org/problems/different-two-sum",
    topics: ["Arrays"],
  },
];
export const fixtureOverrides: Overrides = {
  aliases: [
    {
      alias: "Kadane's Algorithm",
      targetIdentity: "leetcode:maximum-subarray",
      reason:
        "Explicit synthetic test review: these two fixture URLs are intended to represent the same problem.",
    },
  ],
  merges: [],
  canonical: { "leetcode:maximum-subarray": { title: "Maximum Subarray" } },
};
