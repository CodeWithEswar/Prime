-- PRIME AI: private-by-owner reads; trusted server lifecycle and proposals only.
begin;
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100), context jsonb not null default '{"type":"general"}',
  archived boolean not null default false, hint_depth integer not null default 0 check (hint_depth between 0 and 5),
  mode text not null default 'ask', active_request uuid, active_until timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create index ai_conversations_owner_recent on public.ai_conversations(user_id,updated_at desc,id desc);
create table public.ai_messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null, user_id uuid not null,
  role text not null check(role in ('user','assistant')), content text not null default '' check(char_length(content)<=30000),
  status text not null check(status in ('pending','streaming','completed','interrupted','failed')),
  intent text not null default 'ask', ordinal integer not null, parts jsonb not null default '[]',
  model text, prompt_version text, input_tokens integer, output_tokens integer, latency_ms integer,
  request_id uuid unique, created_at timestamptz not null default now(), completed_at timestamptz,
  foreign key (conversation_id,user_id) references public.ai_conversations(id,user_id) on delete cascade,
  unique(conversation_id,ordinal), unique(id,user_id)
);
create index ai_messages_owner on public.ai_messages(user_id);
create table public.ai_tool_calls (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null, message_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_name text not null check(tool_name='create_note'), input jsonb not null,
  status text not null default 'pending' check(status in ('pending','completed','cancelled','expired')),
  result jsonb, expires_at timestamptz not null default now()+interval '10 minutes',
  created_at timestamptz not null default now(), completed_at timestamptz,
  foreign key (conversation_id,user_id) references public.ai_conversations(id,user_id) on delete cascade,
  foreign key (message_id,user_id) references public.ai_messages(id,user_id) on delete cascade
);
create index ai_tool_calls_conversation on public.ai_tool_calls(conversation_id);
create unique index ai_tool_calls_one_proposal on public.ai_tool_calls(message_id);
create index ai_tool_calls_owner on public.ai_tool_calls(user_id);
create table public.ai_feedback (
  message_id uuid not null, user_id uuid not null references auth.users(id) on delete cascade,
  rating text not null check(rating in ('helpful','not_helpful')), created_at timestamptz not null default now(),
  primary key(message_id,user_id), foreign key(message_id,user_id) references public.ai_messages(id,user_id) on delete cascade
);
create index ai_feedback_owner on public.ai_feedback(user_id);
create table public.ai_usage_buckets (
  user_id uuid not null references auth.users(id) on delete cascade, bucket text not null,
  used integer not null default 1, primary key(user_id,bucket)
);
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.ai_tool_calls enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.ai_usage_buckets enable row level security;
revoke all on public.ai_conversations,public.ai_messages,public.ai_tool_calls,public.ai_feedback,public.ai_usage_buckets from anon,authenticated;
grant select on public.ai_conversations,public.ai_messages,public.ai_tool_calls,public.ai_feedback to authenticated;
grant all on public.ai_conversations,public.ai_messages,public.ai_tool_calls,public.ai_feedback,public.ai_usage_buckets to service_role;
create policy ai_conversations_read on public.ai_conversations for select to authenticated using ((select auth.uid())=user_id);
create policy ai_messages_read on public.ai_messages for select to authenticated using ((select auth.uid())=user_id);
create policy ai_tool_calls_read on public.ai_tool_calls for select to authenticated using ((select auth.uid())=user_id);
create policy ai_feedback_read on public.ai_feedback for select to authenticated using ((select auth.uid())=user_id);

-- Service-only invoker RPC: atomic quota, conversation lease, retry/edit and message lifecycle.
create function public.begin_ai_turn(p_user_id uuid,p_conversation_id uuid,p_request_id uuid,p_message text,p_intent text,p_context jsonb,p_mode text)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare c public.ai_conversations; u public.ai_messages; a public.ai_messages; n integer; quota integer; b text;
begin
  if char_length(p_message)>6000 or p_mode not in ('send','retry','edit') or p_intent not in ('ask','explain','hint','summarize','correct','improve','quiz','interview','revision_notes') then raise exception 'AI_INVALID'; end if;
  if exists(select 1 from public.ai_messages where request_id=p_request_id) then raise exception 'AI_DUPLICATE'; end if;
  -- Stable bucket names keep storage bounded to two rows per account.
  foreach b in array array['minute','day'] loop
    insert into public.ai_usage_buckets(user_id,bucket,used) values(p_user_id,b||':'||case when b='minute' then to_char(now() at time zone 'UTC','YYYYMMDDHH24MI') else to_char(now() at time zone 'UTC','YYYYMMDD') end,1)
    on conflict(user_id,bucket) do update set used=public.ai_usage_buckets.used+1 returning used into quota;
    if quota > (case when b='minute' then 8 else 80 end) then raise exception 'AI_LIMIT'; end if;
  end loop;
  delete from public.ai_usage_buckets where user_id=p_user_id and bucket not in ('minute:'||to_char(now() at time zone 'UTC','YYYYMMDDHH24MI'),'day:'||to_char(now() at time zone 'UTC','YYYYMMDD'));
  if p_conversation_id is null then
    if p_mode<>'send' then raise exception 'AI_NOT_FOUND'; end if;
    insert into public.ai_conversations(user_id,title,context) values(p_user_id,left(p_message,80),p_context) returning * into c;
  else
    select * into c from public.ai_conversations where id=p_conversation_id and user_id=p_user_id and not archived for update;
    if not found then raise exception 'AI_NOT_FOUND'; end if;
    if c.active_until>now() then raise exception 'AI_BUSY'; end if;
  end if;
  update public.ai_tool_calls set status='cancelled' where conversation_id=c.id and user_id=p_user_id and status='pending';
  update public.ai_messages set status='interrupted',completed_at=now() where conversation_id=c.id and role='assistant' and status in ('pending','streaming');
  select coalesce(max(ordinal),0) into n from public.ai_messages where conversation_id=c.id;
  if p_mode in ('retry','edit') then
    select * into u from public.ai_messages where conversation_id=c.id and role='user' order by ordinal desc limit 1;
    if not found then raise exception 'AI_NOT_FOUND'; end if;
    delete from public.ai_messages where conversation_id=c.id and ordinal>u.ordinal;
    if p_mode='edit' then update public.ai_messages set content=p_message,intent=p_intent where id=u.id; end if;
    n:=u.ordinal;
  else
    insert into public.ai_messages(conversation_id,user_id,role,content,status,intent,ordinal)
    values(c.id,p_user_id,'user',p_message,'completed',p_intent,n+1) returning * into u;
    n:=n+1;
  end if;
  insert into public.ai_messages(conversation_id,user_id,role,status,intent,ordinal,request_id)
  values(c.id,p_user_id,'assistant','streaming',p_intent,n+1,p_request_id) returning * into a;
  update public.ai_conversations set active_request=p_request_id,active_until=now()+interval '100 seconds',updated_at=now(),
    hint_depth=case when p_intent='hint' and p_mode='send' then least(5,hint_depth+1) else hint_depth end,
    mode=case when p_intent='ask' and mode in ('quiz','interview') then mode else p_intent end
    where id=c.id returning * into c;
  return jsonb_build_object('conversationId',c.id,'messageId',a.id,'hintDepth',c.hint_depth,'intent',c.mode,'context',c.context);
end $$;
revoke all on function public.begin_ai_turn(uuid,uuid,uuid,text,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.begin_ai_turn(uuid,uuid,uuid,text,text,jsonb,text) to service_role;

-- Confirmation and note insertion share one transaction and row lock. Replays return the same result.
create function public.decide_ai_note(p_user_id uuid,p_action_id uuid,p_confirm boolean)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare a public.ai_tool_calls; note_id uuid;
begin
  select * into a from public.ai_tool_calls where id=p_action_id and user_id=p_user_id for update;
  if not found then raise exception 'AI_NOT_FOUND'; end if;
  if a.status='completed' then return a.result; end if;
  if a.status<>'pending' then raise exception 'AI_ACTION_CLOSED'; end if;
  if a.expires_at<now() then
    update public.ai_tool_calls set status='expired' where id=a.id;
    return jsonb_build_object('status','expired');
  end if;
  if not p_confirm then
    update public.ai_tool_calls set status='cancelled',completed_at=now() where id=a.id;
    return jsonb_build_object('status','cancelled');
  end if;
  if a.tool_name<>'create_note' or char_length(a.input->>'title') not between 1 and 100 or char_length(a.input->>'body') not between 1 and 12000 then raise exception 'AI_INVALID'; end if;
  if a.input->>'problemId' is not null and not exists(select 1 from public.problems where id=(a.input->>'problemId')::uuid and is_active) then raise exception 'AI_INVALID'; end if;
  insert into public.notes(id,user_id,entity_type,entity_id,body)
  values(a.id,p_user_id,case when a.input->>'problemId' is null then 'general' else 'problem' end,(a.input->>'problemId')::uuid,'# '||(a.input->>'title')||E'\n\n'||(a.input->>'body')) returning id into note_id;
  update public.ai_tool_calls set status='completed',result=jsonb_build_object('noteId',note_id,'status','completed'),completed_at=now() where id=a.id;
  return jsonb_build_object('noteId',note_id,'status','completed');
end $$;
revoke all on function public.decide_ai_note(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.decide_ai_note(uuid,uuid,boolean) to service_role;
commit;
