import { z } from "zod";
import { normalizeUrl } from "./normalize";
import type { ProblemLinkCorrection } from "./links";

export const linkRepairSchema = z.array(
  z.object({
    id: z.string().uuid(),
    slug: z.string(),
    old_url: z.string().url().nullable(),
    old_source: z.string(),
    old_leetcode_slug: z.string().nullable(),
    url: z.string().url().nullable(),
    source: z.string(),
    leetcode_slug: z.string().nullable(),
    status: z.enum(["original_sheet_hyperlink", "pending_verification"]),
  })
);
export type LinkRepair = z.infer<typeof linkRepairSchema>;
const literal = (value: unknown) => `'${String(value).replaceAll("'", "''")}'`;

/** Metadata-only repair: no deletes, primary-key changes, or personal-table writes. */
export function linkRepairSql(input: unknown, corrections: ProblemLinkCorrection[]) {
  const rows = linkRepairSchema.parse(input);
  if (new Set(rows.map((r) => r.id)).size !== rows.length)
    throw new Error("Duplicate repair IDs");
  const mapped = rows.map((row) => ({
    ...row,
    identity: row.url ? normalizeUrl(row.url).identity : null,
  }));
  const evidence = corrections.map((c) => ({
    record: c.record,
    evidence: c.evidenceUrl,
    cell: c.cell,
  }));
  return `begin;set local statement_timeout='60s';set local lock_timeout='5s';set local standard_conforming_strings=on;
select pg_advisory_xact_lock(170731,1);
create temporary table prime_link_repair on commit drop as select * from jsonb_to_recordset(${literal(JSON.stringify(mapped))}::jsonb) as r(id uuid,slug text,old_url text,old_source text,old_leetcode_slug text,url text,source text,leetcode_slug text,status text,identity text);
do $$begin
 if exists(select 1 from prime_link_repair r left join public.problems p on p.id=r.id where p.id is null or p.slug<>r.slug or p.external_url is distinct from r.old_url or p.source<>r.old_source or p.leetcode_slug is distinct from r.old_leetcode_slug) then raise exception 'Problem links changed since audit; no repair applied';end if;
 if exists(select 1 from prime_link_repair r join public.problems p on r.url=rtrim(p.external_url,'/') and p.id<>r.id) then raise exception 'Provider URL collision requires review';end if;
 if exists(select 1 from prime_link_repair r join public.dsa_problem_identities i on i.identity_key=r.identity and i.problem_id<>r.id) then raise exception 'Provider identity collision requires review';end if;
end$$;
update public.problems p set external_url=r.url,source=r.source,leetcode_slug=r.leetcode_slug from prime_link_repair r where p.id=r.id;
update public.dsa_problem_sources s set source_metadata=s.source_metadata||jsonb_build_object('original_url',s.source_url,'link_origin',case when r.url is null then 'generated_placeholder' else 'original_sheet_hyperlink' end,'link_status',r.status) from prime_link_repair r where s.problem_id=r.id;
update public.dsa_problem_sources s set source_metadata=s.source_metadata||jsonb_build_object('link_evidence',e.evidence,'link_cell',e.cell) from jsonb_to_recordset(${literal(JSON.stringify(evidence))}::jsonb) as e(record text,evidence text,cell text) where s.source_problem_id=e.record and s.source_id=(select id from public.content_sources where slug='booleanstack');
insert into public.dsa_problem_identities(identity_key,problem_id) select identity,id from prime_link_repair where identity is not null on conflict(identity_key) do nothing;
do $$begin if exists(select 1 from prime_link_repair r join public.problems p on p.id=r.id where p.external_url is distinct from r.url or p.source<>r.source or p.leetcode_slug is distinct from r.leetcode_slug) then raise exception 'Link repair verification failed';end if;end$$;
select jsonb_build_object('updated',(select count(*) from prime_link_repair),'problems',(select count(*) from public.problems),'platforms',(select jsonb_object_agg(source,n) from (select source,count(*) n from public.problems group by source) x),'pending_links',(select count(*) from public.problems where external_url is null),'attempts',(select count(*) from public.problem_attempts),'progress',(select count(*) from public.user_problem_progress),'example',(select jsonb_build_object('slug',slug,'source',source,'external_url',external_url) from public.problems where slug='k-largest-element-in-an-array')) as result;
commit;`;
}
