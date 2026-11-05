# DSA Content DB V1

Offline metadata importer for the existing PRIME problem catalog. No runtime GitHub requests or UI.

Start with [the import guide](../../docs/dsa-import-pipeline.md), [catalog model](../../docs/dsa-content.md), [taxonomy](../../docs/dsa-taxonomy.md), and [source review](../../docs/content-provenance.md).

```sh
pnpm dsa:sync --dry-run
pnpm dsa:validate --fixtures
pnpm test:dsa
```

The user authorized factual metadata on 2026-11-01. Both sources are `metadata_only` with an explicit user-directed basis; their upstream license fields remain null. `--fixtures` is test-only and cannot write through the CLI. Normal sync requires validation and a reviewed change plan. Use an explicit privileged database URL or the authenticated Supabase CLI transport: `pnpm dsa:sync --linked --staged` after a successful dry run. The live catalog currently contains 4,411 question records.

The source, company, topic, sheet, and alias configuration is version controlled. `.generated/dsa/` contains ignored caches/staging/reports; never commit full third-party datasets or credentials.
