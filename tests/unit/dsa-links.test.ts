// @vitest-environment node
import { describe, it, expect } from "vitest";
import { applyLinkCorrection } from "../../scripts/dsa/links";
import { buildCatalog } from "../../scripts/dsa/catalog";
import { fixtureRows, fixtureSource } from "../../scripts/dsa/fixtures";
import { linkRepairSql } from "../../scripts/dsa/link-repair";
import { rowSchema } from "../../scripts/dsa/model";
const empty = { aliases: [], merges: [], canonical: {} };
describe("practice link evidence", () => {
  it("withholds generated problem URLs without losing the question", () => {
    const row = { ...fixtureRows[0], metadata: { link_origin: "generated_placeholder" } };
    const catalog = buildCatalog([row], [fixtureSource], empty, "fixture");
    expect(catalog.tables.problems).toHaveLength(1);
    expect(catalog.tables.problems[0]).toMatchObject({
      source: "unverified",
      external_url: null,
      leetcode_slug: null,
      is_active: true,
    });
  });
  it("accepts a corroborated provider link for the same question", () => {
    const row = { ...fixtureRows[0], metadata: { link_origin: "generated_placeholder" } };
    const catalog = buildCatalog(
      [
        row,
        {
          ...fixtureRows[0],
          sourceRecordId: "corroborated",
          metadata: { link_origin: "source_url" },
        },
      ],
      [fixtureSource],
      empty,
      "fixture"
    );
    expect(catalog.tables.problems[0].external_url).toBeTruthy();
  });
  it("restores the original GFG link without turning it into a LeetCode variant", () => {
    const row = rowSchema.parse({
      ...fixtureRows[0],
      sourceRecordId: "broken",
      title: "K Largest Elements",
      url: "https://leetcode.com/problems/k-largest-element-in-an-array",
      metadata: { link_origin: "generated_placeholder" },
    });
    const correction = {
      source: row.source,
      record: "broken",
      originalUrl: row.url,
      url: "https://www.geeksforgeeks.org/problems/k-largest-elements4206/1",
      evidenceUrl: "https://example.test/source.xlsx",
      cell: "B339",
    };
    const fixed = applyLinkCorrection(row, [correction]);
    const catalog = buildCatalog([fixed], [fixtureSource], empty, "fixture");
    expect(catalog.tables.problems[0]).toMatchObject({
      source: "geeksforgeeks",
      leetcode_slug: null,
      external_url: "https://geeksforgeeks.org/problems/k-largest-elements4206/1",
    });
    expect(catalog.tables.dsa_problem_sources[0].source_url).toBe(row.url);
    expect(() =>
      applyLinkCorrection({ ...row, url: "https://leetcode.com/problems/changed" }, [
        correction,
      ])
    ).toThrow("source changed");
  });
  it("guards repairs against stale snapshots and never writes personal tables", () => {
    const sql = linkRepairSql([], []);
    expect(sql).toContain("Problem links changed since audit");
    expect(sql).not.toMatch(
      /(?:update|delete from|insert into) public\.(?:problem_attempts|user_problem_progress|revision_items)/i
    );
    expect(sql).not.toMatch(/delete from public\.problems/i);
  });
});
