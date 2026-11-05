-- Keep license NULL when no license was found. A separately recorded user directive
-- may authorize this application's factual-reference metadata import, not copied content.
begin;
alter table public.content_sources drop constraint content_sources_check;
alter table public.content_sources add constraint content_sources_reuse_basis_check check (
  redistribution_status not in ('allowed','metadata_only')
  or (license is not null and approval is not null)
  or (redistribution_status='metadata_only' and approval is not null
      and coalesce(approval->>'basis','')='user_directed_factual_metadata'
      and coalesce(approval->>'metadataOnly','')='true' and length(coalesce(approval->>'reason',''))>0)
);
commit;
