// @vitest-environment node
import { describe, it, expect, vi } from "vitest";
import {
  normalizeUrl,
  normalizeTitle,
  normalizeDifficulty,
  mapTopics,
  normalizeCompany,
  normalizeWindow,
  stableId,
} from "../../scripts/dsa/normalize";
import { buildCatalog, fatalIssues } from "../../scripts/dsa/catalog";
import { fixtureRows, fixtureSource, fixtureOverrides } from "../../scripts/dsa/fixtures";
import { parseSource } from "../../scripts/dsa/parsers";
import { checkThreshold, snapshotHash } from "../../scripts/dsa/database";
import {
  cachePath,
  verifyBlob,
  fetchSources,
  normalizeSources,
} from "../../scripts/dsa/pipeline";
import { createHash } from "node:crypto";
const empty = { aliases: [], merges: [], canonical: {} };
describe("DSA normalization and identity", () => {
  it("never fetches blocked sources and discovers approved company files from a pinned tree", async () => {
    const csv =
      "\uFEFFDifficulty,Title,Frequency,Acceptance Rate,Link,Topics\nEASY,Two Sum,55,0.005,https://leetcode.com/problems/two-sum,Array\n";
    const bytes = Buffer.from(csv),
      sha = createHash("sha1")
        .update(`blob ${bytes.length}\0`)
        .update(bytes)
        .digest("hex");
    const fetcher = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) =>
      String(input).includes("/git/trees/")
        ? Response.json({
            truncated: false,
            tree: [{ path: "Example Inc/1. Thirty Days.csv", type: "blob", sha }],
          })
        : new Response(bytes)
    );
    try {
      await fetchSources([{ ...fixtureSource, redistributionStatus: "blocked" }]);
      expect(fetcher).not.toHaveBeenCalled();
      const source = {
        ...fixtureSource,
        slug: "prime-discovery-test",
        revision: "a".repeat(40),
        repositoryUrl: "https://github.com/prime-test/fixtures",
        discovery: "company-csv-tree" as const,
      };
      expect((await fetchSources([source]))[0]).toMatchObject({
        status: "cached",
        files: 1,
      });
      const c = await normalizeSources([source], empty);
      expect(c.report.canonicalProblems).toBe(1);
      expect(c.report.companyRelationships).toBe(1);
      expect(c.report.issues).toEqual([]);
    } finally {
      fetcher.mockRestore();
    }
  });
  it.each([
    "leetcode.com/problems/two-sum",
    "https://www.leetcode.com/problems/two-sum/",
    "https://leetcode.com/problems/two-sum/description/?envType=foo#x",
    "http://leetcode.cn/problems/two-sum/",
  ])("normalizes provider identity %s", (value) =>
    expect(normalizeUrl(value)).toMatchObject({
      identity: "leetcode:two-sum",
      url: "https://leetcode.com/problems/two-sum",
    })
  );
  it.each([
    "javascript:alert(1)",
    "file:///tmp/x",
    "https://user:pass@leetcode.com/problems/two-sum",
    "https://leetcode.com/discuss/x",
    "../file",
    "https://localhost/a",
  ])("rejects unsafe/non-problem reference %s", (value) =>
    expect(() => normalizeUrl(value)).toThrow()
  );
  it("preserves meaningful provider parameters and host boundaries", () => {
    expect(normalizeUrl("https://EXAMPLE.org/a/?id=2&utm_source=test#x").url).toBe(
      "https://example.org/a?id=2"
    );
    expect(
      normalizeUrl("https://leetcode.com.evil.example/problems/two-sum").provider
    ).toBe("other");
  });
  it("normalizes titles only for review and leaves missing difficulty unknown", () => {
    expect(normalizeTitle("Two Sum (LeetCode)")).toBe(normalizeTitle("Two-Sum"));
    expect(normalizeDifficulty("EASY")).toBe("easy");
    expect(normalizeDifficulty("very important")).toBe("unknown");
    expect(stableId("same")).toBe(stableId("same"));
  });
  it("maps the existing taxonomy without difficulty-label topic explosion", () => {
    expect(mapTopics(["Hash Table", "HashMap", "Hashing"]).mapped).toEqual(["hashing"]);
    expect(mapTopics(["Binary Search Trees", "Priority Queue"]).mapped).toEqual([
      "bst",
      "heap",
    ]);
    expect(mapTopics(["Medium / Hard"]).unknown).toEqual(["Medium / Hard"]);
  });
  it("normalizes explicit company and time aliases without fuzzy company mergers", () => {
    expect(normalizeCompany("Facebook")).toEqual(normalizeCompany("Meta"));
    expect(normalizeCompany("Meta / Facebook")).toEqual(normalizeCompany("Meta"));
    expect(normalizeCompany("Amazon+")).toBeNull();
    expect(normalizeCompany("Interview")).toBeNull();
    expect(normalizeCompany("Acme Labs")?.slug).not.toBe(
      normalizeCompany("Acme Laboratory")?.slug
    );
    expect(normalizeWindow("4. More Than Six Months.csv".replace(/\.csv$/, ""))).toBe(
      "6m_plus"
    );
    expect(normalizeWindow("60 days")).toBeNull();
  });
  it("deduplicates strong identities, applies reviewed aliases, and preserves title-only candidates", () => {
    const c = buildCatalog(fixtureRows, [fixtureSource], fixtureOverrides, "fixture");
    expect(c.report).toMatchObject({
      rawRows: 7,
      validRows: 7,
      canonicalProblems: 3,
      exactDuplicates: 3,
      aliasMerges: 1,
      companies: 1,
      companyRelationships: 2,
      collections: 2,
      invalidRows: 0,
    });
    expect(c.tables.problems.filter((p) => p.leetcode_slug === "two-sum")).toHaveLength(
      1
    );
    expect(c.report.review.some((r) => r.category === "normalized_title_match")).toBe(
      true
    );
    expect(c.tables.company_problem_stats.every((s) => s.acceptance_rate === null)).toBe(
      true
    );
    expect(
      c.tables.company_problem_stats.find((s) => s.raw_acceptance_rate)
        ?.raw_acceptance_rate
    ).toBe("0.005");
    expect(snapshotHash(c)).toBe(
      snapshotHash(
        buildCatalog(
          [...fixtureRows].reverse(),
          [fixtureSource],
          fixtureOverrides,
          "fixture"
        )
      )
    );
  });
  it("does not infer a Kadane merge without an explicit override", () => {
    expect(
      buildCatalog(fixtureRows, [fixtureSource], empty).report.canonicalProblems
    ).toBe(4);
  });
  it("blocks conflicting provider identities and unapproved sources", () => {
    const c = buildCatalog([fixtureRows[0], fixtureRows[3]], [fixtureSource], {
      ...empty,
      merges: [
        {
          fromIdentity: "leetcode:two-sum",
          toIdentity: "leetcode:maximum-subarray",
          reason: "Intentionally invalid review",
        },
      ],
    });
    expect(
      fatalIssues(c.report.issues).some((i) => i.category === "identity_conflict")
    ).toBe(true);
    const blocked = buildCatalog(
      fixtureRows,
      [{ ...fixtureSource, redistributionStatus: "blocked" }],
      empty
    );
    expect(blocked.report.blockedSources).toHaveLength(1);
    expect(blocked.tables.problems).toHaveLength(0);
  });
  it("rejects malformed rows with actionable diagnostics", () => {
    const c = buildCatalog(
      [
        { ...fixtureRows[0], url: "" },
        { ...fixtureRows[0], url: "javascript:alert(1)" },
      ],
      [fixtureSource],
      empty
    );
    expect(c.report).toMatchObject({ invalidRows: 2, missingUrls: 1, invalidUrls: 1 });
  });
  it("parses quoted CSV without inventing acceptance-rate scale", () => {
    const parsed = parseSource(
      'Difficulty,Title,Frequency,Acceptance Rate,Link,Topics\nEASY,"Two, Sum",88.5,0.005,https://leetcode.com/problems/two-sum,"Array, Hash Table"\n',
      fixtureSource,
      {
        path: "Amazon/1. Thirty Days.csv",
        format: "company-csv",
        sha: "test",
        company: "Amazon",
        timeWindow: "30 days",
      }
    );
    expect(parsed.issues).toEqual([]);
    expect(parsed.rows[0]).toMatchObject({
      title: "Two, Sum",
      frequency: 88.5,
      rawAcceptanceRate: "0.005",
      topics: ["Array", "Hash Table"],
    });
    expect(
      parseSource("Title,Link\nBad,\n", fixtureSource, {
        path: "x.csv",
        format: "company-csv",
        sha: "test",
      }).issues
    ).toHaveLength(1);
  });
  it("does not convert ambiguous company prose into fabricated time-window stats", () => {
    const parsed = parseSource(
      '[{"problem_id":"example","question":"Two Sum","leetcode_link":"https://leetcode.com/problems/two-sum","topics":"Array","timeframe_breakdown":"Amazon recent"}]',
      fixtureSource,
      { path: "companies.json", format: "booleanstack-company", sha: "test" }
    );
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0].company).toBeUndefined();
    expect(parsed.rows[0].metadata.company_stats_status).toBe(
      "reference_only_requires_company_csv"
    );
  });
  it("flags inconsistent consolidated sheet assertions instead of trusting them", () => {
    const parsed = parseSource(
      JSON.stringify([
        {
          problem_id: "example",
          title: "Example",
          problem_url: "https://example.org/problem",
          sheet_tags: "[AlgoPrep 151]",
          sheet_count: 2,
          in_algoprep: "No",
        },
      ]),
      fixtureSource,
      { path: "example.json", format: "booleanstack-dsa", sha: "test" }
    );
    expect(parsed.issues.some((i) => i.category === "source_conflict")).toBe(true);
  });
  it("checks cached blob identity and rejects source path traversal", () => {
    const text = "example\n",
      sha = createHash("sha1")
        .update(`blob ${Buffer.byteLength(text)}\0${text}`)
        .digest("hex");
    expect(verifyBlob(text, sha)).toBe(true);
    expect(verifyBlob(text + "tamper", sha)).toBe(false);
    expect(() =>
      cachePath(fixtureSource, { path: "../../escape", format: "fixture", sha: "test" })
    ).toThrow();
  });
  it("stops large changes, including small existing catalogs", () => {
    expect(() =>
      checkThreshold({
        inserted: 0,
        updated: 1,
        unchanged: 0,
        existingProblems: 1,
        missingProblems: 0,
        changedProblems: 1,
      })
    ).toThrow();
  });
});
