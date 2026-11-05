alter table public.user_settings add column planner_buffer_percent integer not null default 15
  check (planner_buffer_percent between 5 and 40);

create table public.planning_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  request jsonb not null check (jsonb_typeof(request) = 'object'),
  status text not null default 'backlog' check (status in ('backlog', 'scheduled', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);
create index planning_intents_owner_status on public.planning_intents(user_id, status, created_at);
alter table public.planning_intents enable row level security;
create policy planning_intents_read_own on public.planning_intents for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.planning_intents from anon, authenticated;
grant select on public.planning_intents to authenticated;
grant select, insert, update on public.planning_intents to service_role;

alter table public.daily_tasks add column planning_intent_id uuid;
alter table public.daily_tasks add constraint daily_tasks_intent_owner_fkey
  foreign key (planning_intent_id, user_id) references public.planning_intents(id, user_id);
create index daily_tasks_intent_owner on public.daily_tasks(planning_intent_id, user_id) where planning_intent_id is not null;

-- Existing clients may update execution state. A task or day must still belong
-- to the same account as its parent when written through the public API.
alter policy daily_tasks_insert_own on public.daily_tasks with check (
  (select auth.uid()) = user_id and exists (select 1 from public.daily_plans d where d.id = daily_plan_id and d.user_id = (select auth.uid()))
);
alter policy daily_tasks_update_own on public.daily_tasks with check (
  (select auth.uid()) = user_id and exists (select 1 from public.daily_plans d where d.id = daily_plan_id and d.user_id = (select auth.uid()))
);
alter policy daily_plans_insert_own on public.daily_plans with check (
  (select auth.uid()) = user_id and (preparation_plan_id is null or exists (
    select 1 from public.preparation_plans p where p.id = preparation_plan_id and p.user_id = (select auth.uid())))
);
alter policy daily_plans_update_own on public.daily_plans with check (
  (select auth.uid()) = user_id and (preparation_plan_id is null or exists (
    select 1 from public.preparation_plans p where p.id = preparation_plan_id and p.user_id = (select auth.uid())))
);

create table public.planner_proposals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_day date not null,
  snapshot_version text not null,
  changes jsonb not null,
  expires_at timestamptz not null default (now() + interval '10 minutes'),
  applied_at timestamptz
);
create index planner_proposals_owner_expiry on public.planner_proposals(user_id, expires_at);
alter table public.planner_proposals enable row level security;
revoke all on public.planner_proposals from anon, authenticated;
grant select, insert, update, delete on public.planner_proposals to service_role;

-- Serialize confirmed changes against existing writers of the same account's inputs.
create function public.lock_planner_owner() returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(old.user_id::text, 711));
    return old;
  end if;
  if tg_op = 'UPDATE' and new.user_id <> old.user_id then
    raise exception 'Planner row ownership is immutable';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(new.user_id::text, 711));
  return new;
end $$;
revoke all on function public.lock_planner_owner() from public, anon, authenticated;

do $$
declare relation text;
begin
  foreach relation in array array['daily_tasks','daily_plans','preparation_plans','availability_rules',
    'availability_exceptions','planning_intents','user_settings','revision_items','user_problem_progress'] loop
    execute format('create trigger planner_owner_lock before insert or update or delete on public.%I for each row execute function public.lock_planner_owner()', relation);
  end loop;
end $$;

create function public.planner_snapshot(p_user uuid, p_day date) returns jsonb
language sql stable set search_path = '' as $$
  with snapshot as (select jsonb_build_object(
    'settings', (select to_jsonb(s) from public.user_settings s where s.user_id = p_user),
    'plan', (select to_jsonb(p) from public.preparation_plans p where p.user_id = p_user and p.status = 'active' order by p.created_at desc, p.id limit 1),
    'rules', coalesce((select jsonb_agg(to_jsonb(r) order by r.day_of_week) from public.availability_rules r where r.user_id = p_user), '[]'::jsonb),
    'exceptions', coalesce((select jsonb_agg(to_jsonb(e) order by e.exception_date) from public.availability_exceptions e where e.user_id = p_user and e.exception_date between p_day and p_day + 89), '[]'::jsonb),
    'days', coalesce((select jsonb_agg(to_jsonb(d) order by d.plan_date) from public.daily_plans d where d.user_id = p_user and d.plan_date between p_day - 90 and p_day + 89), '[]'::jsonb),
    'tasks', coalesce((select jsonb_agg(to_jsonb(t) || jsonb_build_object('date', d.plan_date) order by d.plan_date, t.sort_order, t.id)
      from public.daily_plans d join public.daily_tasks t on t.daily_plan_id = d.id and t.user_id = d.user_id
      where d.user_id = p_user and d.plan_date between p_day - 90 and p_day + 89), '[]'::jsonb),
    'intents', coalesce((select jsonb_agg(to_jsonb(i) order by i.created_at, i.id) from public.planning_intents i where i.user_id = p_user and i.status = 'backlog'), '[]'::jsonb),
    'revisions', coalesce((select jsonb_agg(to_jsonb(r) order by r.next_review_at, r.id) from public.revision_items r where r.user_id = p_user and r.status = 'active' and r.entity_type = 'problem' and r.next_review_at < p_day + 91), '[]'::jsonb),
    'progress', (select md5(coalesce(string_agg(to_jsonb(p)::text, ',' order by p.problem_id), '')) from public.user_problem_progress p where p.user_id = p_user)
  ) as data)
  select data || jsonb_build_object('version', md5(data::text)) from snapshot;
$$;
revoke all on function public.planner_snapshot(uuid,date) from public, anon, authenticated;
grant execute on function public.planner_snapshot(uuid,date) to service_role;

create function public.commit_planner_proposal(p_user uuid, p_id uuid) returns void
language plpgsql set search_path = '' as $$
declare
  proposal public.planner_proposals%rowtype;
  plan public.preparation_plans%rowtype;
  prior_task public.daily_tasks%rowtype;
  changes jsonb;
  item jsonb;
  target jsonb;
  intent_id uuid;
  day_id uuid;
  date_key date;
  previous_date date;
  local_zone text;
  touched uuid[] := '{}';
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_user::text, 711));
  select * into proposal from public.planner_proposals where id = p_id and user_id = p_user for update;
  if not found then raise exception 'PLANNER_PROPOSAL_MISSING'; end if;
  if proposal.applied_at is not null then return; end if;
  if proposal.expires_at <= now() or (public.planner_snapshot(p_user, proposal.local_day)->>'version') <> proposal.snapshot_version then
    raise exception 'PLANNER_STALE';
  end if;
  select * into plan from public.preparation_plans where user_id = p_user and status = 'active' order by created_at desc, id limit 1;
  changes := proposal.changes;
  target := changes->'target';
  local_zone := coalesce((select timezone from public.user_settings where user_id = p_user), plan.timezone, 'UTC');
  if (now() at time zone local_zone)::date <> proposal.local_day then raise exception 'PLANNER_STALE'; end if;
  if target is not null then
    if plan.id is null then
      insert into public.preparation_plans(user_id,start_date,target_date,timezone,target_role,daily_capacity_minutes)
      values(p_user,proposal.local_day,(target->>'date')::date,local_zone,target->>'role',(target->>'minutes')::int) returning * into plan;
    else
      update public.preparation_plans set target_date=(target->>'date')::date where id=plan.id and user_id=p_user returning * into plan;
    end if;
    update public.user_settings set target_date=plan.target_date where user_id=p_user and target_date is distinct from plan.target_date;
  end if;
  if changes ? 'rule' then
    item := changes->'rule';
    insert into public.availability_rules(user_id,day_of_week,available_minutes,is_rest_day)
    values(p_user,(item->>'weekday')::int,(item->>'minutes')::int,(item->>'rest')::boolean)
    on conflict (user_id,day_of_week) do update set available_minutes=excluded.available_minutes,is_rest_day=excluded.is_rest_day;
  end if;
  if changes ? 'buffer' then
    insert into public.user_settings(user_id,planner_buffer_percent) values(p_user,(changes->>'buffer')::int)
    on conflict(user_id) do update set planner_buffer_percent=excluded.planner_buffer_percent;
  end if;
  if changes ? 'exception' then
    item := changes->'exception';
    if (item->>'remove')::boolean then
      delete from public.availability_exceptions where user_id=p_user and exception_date=(item->>'date')::date;
    else
      insert into public.availability_exceptions(user_id,exception_date,available_minutes,is_unavailable,reason)
      values(p_user,(item->>'date')::date,(item->>'minutes')::int,(item->>'minutes')::int=0,item->>'label')
      on conflict(user_id,exception_date) do update set available_minutes=excluded.available_minutes,is_unavailable=excluded.is_unavailable,reason=excluded.reason;
    end if;
  end if;
  if changes ? 'intent' then
    item := changes->'intent';
    insert into public.planning_intents(user_id,title,request,status)
    values(p_user,item->>'title',item->'request',item->>'status') returning id into intent_id;
  end if;
  if changes ? 'backlog' then
    item := changes->'backlog';
    update public.planning_intents set status=coalesce(item->>'status',status),
      request=case when item ? 'priority' then jsonb_set(request,'{priority}',item->'priority') else request end
    where id=(item->>'id')::uuid and user_id=p_user and status='backlog';
    if not found then raise exception 'PLANNER_STALE'; end if;
  end if;
  if changes ? 'lock' then
    item := changes->'lock';
    update public.daily_tasks set is_locked=(item->>'locked')::boolean,updated_at=now()
    where id=(item->>'id')::uuid and user_id=p_user and status='pending';
    if not found then raise exception 'PLANNER_STALE'; end if;
  end if;
  for item in select value from jsonb_array_elements(coalesce(changes->'days','[]')) loop
    date_key := (item->>'date')::date;
    if plan.id is null or date_key < proposal.local_day or date_key > proposal.local_day+89 then raise exception 'PLANNER_DATE'; end if;
    insert into public.daily_plans(user_id,preparation_plan_id,plan_date,day_number,available_minutes,is_rest_day,status)
    values(p_user,plan.id,date_key,greatest(1,date_key-plan.start_date+1),(item->>'available')::int,(item->>'rest')::boolean,
      case when (item->>'rest')::boolean then 'rest_day' else 'planned' end)
    on conflict(user_id,plan_date) do update set available_minutes=excluded.available_minutes,is_rest_day=excluded.is_rest_day
    returning id into day_id;
    touched := array_append(touched, day_id);
  end loop;
  for item in select value from jsonb_array_elements(coalesce(changes->'placements','[]')) loop
    date_key := (item->>'date')::date;
    if date_key > plan.target_date then raise exception 'PLANNER_DATE'; end if;
    select id into day_id from public.daily_plans where user_id=p_user and plan_date=date_key and id=any(touched);
    if day_id is null then raise exception 'PLANNER_DATE'; end if;
    if item ? 'moveId' then
      select * into prior_task from public.daily_tasks where id=(item->>'moveId')::uuid and user_id=p_user and status='pending' and not is_locked for update;
      if not found then raise exception 'PLANNER_STALE'; end if;
      select plan_date into previous_date from public.daily_plans where id=prior_task.daily_plan_id and user_id=p_user;
      update public.daily_tasks set daily_plan_id=day_id, original_date=coalesce(original_date,previous_date),
        carry_count=carry_count+case when item->>'reason'='CARRY_FORWARD' then 1 else 0 end,
        sort_order=coalesce((select max(sort_order)+1 from public.daily_tasks where daily_plan_id=day_id and user_id=p_user),0),
        scheduled_reason=item->>'reason', updated_at=now(),
        decision_metadata=coalesce(decision_metadata,'{}') || jsonb_build_object('previousDate',previous_date,'plannerProposal',p_id)
        where id=prior_task.id;
      touched := array_append(touched,prior_task.daily_plan_id);
    else
      insert into public.daily_tasks(user_id,daily_plan_id,task_type,title,planned_minutes,priority,is_locked,source,
        problem_id,revision_item_id,curriculum_item_id,planning_intent_id,scheduled_reason,original_date,decision_metadata,sort_order)
      values(p_user,day_id,item->>'type',item->>'title',(item->>'minutes')::int,item->>'priority',coalesce((item->>'locked')::boolean,false),item->>'source',
        (item->>'problemId')::uuid,(item->>'revisionId')::uuid,(item->>'curriculumId')::uuid,coalesce((item->>'intentId')::uuid,case when item ? 'requestIntent' then intent_id end),
        item->>'reason',date_key,jsonb_build_object('plannerProposal',p_id),
        coalesce((select max(sort_order)+1 from public.daily_tasks where daily_plan_id=day_id and user_id=p_user),0));
    end if;
  end loop;
  for item in select value from jsonb_array_elements(coalesce(changes->'fulfilled','[]')) loop
    update public.planning_intents set status=case when (item->>'remaining')::int = 0 then 'scheduled' else 'backlog' end,
      request=case when (item->>'remaining')::int = 0 then request
        else request || jsonb_build_object('count',item->'remaining')
          || case when item ? 'selection' then jsonb_build_object('selection',item->'selection') else '{}'::jsonb end end
    where id=(item->>'id')::uuid and user_id=p_user and status='backlog';
    if not found then raise exception 'PLANNER_STALE'; end if;
  end loop;
  update public.daily_plans d set planned_minutes=totals.minutes,
    utilization_rate=case when d.available_minutes>0 then least(9.999,totals.minutes::numeric/d.available_minutes) else 0 end,
    status=case when d.status in ('completed','in_progress','skipped') then d.status
      when d.is_rest_day and totals.minutes=0 then 'rest_day' else 'planned' end
  from (select a.id,coalesce(sum(t.planned_minutes) filter (where t.status not in ('cancelled','skipped','rescheduled','carried_forward')),0)::int as minutes
    from public.daily_plans a left join public.daily_tasks t on t.daily_plan_id=a.id and t.user_id=a.user_id
    where a.user_id=p_user and a.id=any(touched) group by a.id) totals
  where d.id=totals.id and d.user_id=p_user;
  if plan.id is not null then
    update public.preparation_plans set plan_revision=plan_revision+1,
      last_rebalanced_at=case when changes ? 'rebalance' then now() else last_rebalanced_at end
    where id=plan.id and user_id=p_user;
  end if;
  update public.planner_proposals set applied_at=now() where id=p_id;
end $$;
revoke all on function public.commit_planner_proposal(uuid,uuid) from public, anon, authenticated;
grant execute on function public.commit_planner_proposal(uuid,uuid) to service_role;
