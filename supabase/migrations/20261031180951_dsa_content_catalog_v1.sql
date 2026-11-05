-- DSA Content V1 extends the foundation's canonical problems and roadmap_topics.
-- Existing problem IDs, attempts, progress, and planner references remain intact.
begin;

create table public.content_sources (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  source_type text not null check(source_type in ('sheet','repository','problem_provider','company_dataset','manual')),
  repository_url text, license text, license_url text, attribution_required boolean not null default true,
  redistribution_status text not null check(redistribution_status in ('allowed','metadata_only','review_required','blocked')),
  revision text not null, approval jsonb, last_checked_at timestamptz not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check(redistribution_status not in ('allowed','metadata_only') or (license is not null and approval is not null))
);

alter table public.problems drop constraint problems_difficulty_check;
alter table public.problems add constraint problems_difficulty_check check(difficulty in ('easy','medium','hard','unknown'));
alter table public.problems add column primary_topic_id uuid references public.roadmap_topics(id) on delete restrict;
alter table public.problems add column leetcode_slug text check(leetcode_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
alter table public.problems add column estimated_minutes integer check(estimated_minutes > 0);
alter table public.problems add column prime_priority text not null default 'standard' check(prime_priority in ('core','high','standard','advanced'));
-- A failed unique index is an explicit pre-existing duplicate review, never an automatic merge.
update public.problems set leetcode_slug = substring(external_url from '^https?://(?:www\.)?leetcode\.com/problems/([a-z0-9-]+)(?:/|$)')
where external_url ~ '^https?://(?:www\.)?leetcode\.com/problems/[a-z0-9-]+(?:/|$)';
create unique index problems_leetcode_identity_idx on public.problems(leetcode_slug) where leetcode_slug is not null;
create unique index problems_external_identity_idx on public.problems(rtrim(external_url,'/')) where external_url is not null;
create index problems_primary_topic_idx on public.problems(primary_topic_id,id);
create index problems_title_search_idx on public.problems using gin(to_tsvector('simple',title));
create index problem_topics_topic_problem_idx on public.problem_topics(topic_id,problem_id);
alter table public.problems add constraint problem_primary_topic_membership_fk
  foreign key(id,primary_topic_id) references public.problem_topics(problem_id,topic_id) deferrable initially deferred;

create table public.dsa_problem_identities (
  identity_key text primary key, problem_id uuid not null references public.problems(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index dsa_problem_identities_problem_idx on public.dsa_problem_identities(problem_id);
insert into public.dsa_problem_identities(identity_key,problem_id)
select 'leetcode:' || leetcode_slug,id from public.problems where leetcode_slug is not null;
create table public.dsa_problem_sources (
  id uuid primary key default gen_random_uuid(), problem_id uuid not null references public.problems(id) on delete restrict,
  source_id uuid not null references public.content_sources(id) on delete restrict, source_problem_id text not null,
  source_title text not null, source_url text not null, source_revision text not null,
  source_metadata jsonb not null default '{}'::jsonb, is_active boolean not null default true,
  imported_at timestamptz not null default now(), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(source_id,source_problem_id)
);
create index dsa_problem_sources_problem_idx on public.dsa_problem_sources(problem_id);
create table public.dsa_problem_aliases (
  problem_id uuid not null references public.problems(id) on delete restrict, alias text not null,
  normalized_alias text not null, reason text not null check(length(trim(reason)) > 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key(problem_id,alias)
);
create index dsa_problem_aliases_search_idx on public.dsa_problem_aliases using gin(to_tsvector('simple',alias));
create index dsa_problem_aliases_normalized_idx on public.dsa_problem_aliases(normalized_alias,problem_id);
create table public.problem_collections (
  id uuid primary key default gen_random_uuid(), slug text not null unique, name text not null,
  collection_type text not null check(collection_type in ('sheet','curriculum','company_set','manual')),
  source_id uuid references public.content_sources(id) on delete restrict, description text, is_active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index problem_collections_source_idx on public.problem_collections(source_id);
create table public.problem_collection_items (
  collection_id uuid not null references public.problem_collections(id) on delete restrict,
  problem_id uuid not null references public.problems(id) on delete restrict,
  position integer check(position >= 0), section text, subsection text, source_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key(collection_id,problem_id)
);
create index problem_collection_items_position_idx on public.problem_collection_items(collection_id,position,problem_id);
create index problem_collection_items_problem_idx on public.problem_collection_items(problem_id);

alter table public.companies add column is_active boolean not null default true;
-- Preserve legacy rows with an unknown source rather than attributing them to a newly inspected repository.
alter table public.company_problem_stats add column id uuid not null default gen_random_uuid();
alter table public.company_problem_stats add column source_id uuid references public.content_sources(id) on delete restrict;
alter table public.company_problem_stats add column source_revision text;
alter table public.company_problem_stats add column raw_frequency text;
alter table public.company_problem_stats add column raw_acceptance_rate text;
alter table public.company_problem_stats add column source_metadata jsonb not null default '{}'::jsonb;
alter table public.company_problem_stats add column is_active boolean not null default true;
alter table public.company_problem_stats alter column frequency type numeric;
alter table public.company_problem_stats alter column frequency drop not null;
alter table public.company_problem_stats alter column frequency drop default;
alter table public.company_problem_stats drop constraint company_problem_stats_pkey;
alter table public.company_problem_stats add primary key(id);
alter table public.company_problem_stats add constraint company_problem_stats_source_identity_key
  unique nulls not distinct(company_id,problem_id,time_window,source_id);
create index company_problem_stats_frequency_idx on public.company_problem_stats(company_id,time_window,frequency desc nulls last);
create index company_problem_stats_problem_idx on public.company_problem_stats(problem_id);
create index company_problem_stats_source_idx on public.company_problem_stats(source_id);
comment on column public.company_problem_stats.acceptance_rate is 'Existing foundation uses percentages (0..100). Importer leaves this NULL until source scale is verified; raw source value is separate.';

create table public.dsa_import_runs (
  id uuid primary key default gen_random_uuid(), snapshot_hash text not null, source_revisions jsonb not null,
  report jsonb not null, imported_at timestamptz not null default now()
);
create function public.dsa_touch_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at=now(); return new; end;
$$;
revoke all on function public.dsa_touch_updated_at() from public,anon,authenticated;
grant execute on function public.dsa_touch_updated_at() to service_role;
do $$
declare name text;
begin
  foreach name in array array['content_sources','dsa_problem_identities','dsa_problem_sources','dsa_problem_aliases','problem_collections','problem_collection_items'] loop
    execute format('alter table public.%I enable row level security',name);
    execute format('revoke all on public.%I from anon,authenticated',name);
    execute format('grant select on public.%I to authenticated',name);
    execute format('grant all on public.%I to service_role',name);
    execute format('create policy catalog_read on public.%I for select to authenticated using (true)',name);
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.dsa_touch_updated_at()',name);
  end loop;
  foreach name in array array['roadmap_topics','problems','problem_topics','companies','company_problem_stats'] loop
    execute format('revoke insert,update,delete,truncate,references,trigger on public.%I from anon,authenticated',name);
    execute format('grant select on public.%I to anon,authenticated',name);
    execute format('grant all on public.%I to service_role',name);
  end loop;
end $$;
alter table public.dsa_import_runs enable row level security;
revoke all on public.dsa_import_runs from anon,authenticated;
grant all on public.dsa_import_runs to service_role;

-- Add missing DSA taxonomy entries without changing existing topic IDs or dependency edges.
insert into public.roadmap_topics(slug,name,domain,sort_order) values
 ('fundamentals','Fundamentals','dsa',0),('sorting','Sorting','dsa',27),
 ('bit-manipulation','Bit Manipulation','dsa',28),('tries','Tries','dsa',29),
 ('intervals','Intervals','dsa',30),('math','Math','dsa',31),('matrix','Matrix','dsa',32)
on conflict(slug) do nothing;
comment on table public.dsa_problem_sources is 'Canonical provider metadata provenance only; never full problem statements or personal progress.';
commit;
