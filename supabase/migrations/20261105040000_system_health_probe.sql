-- PRIME System Health Probe Table
-- Dedicated minimal resource for external health monitors & keep-alive pings

create table if not exists public.system_health_probe (
  id smallint primary key check (id = 1),
  marker text not null default 'prime-ok',
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- Enable Row Level Security
alter table public.system_health_probe enable row level security;

-- Singleton initial row
insert into public.system_health_probe (id, marker)
values (1, 'prime-ok')
on conflict (id) do update set marker = 'prime-ok', updated_at = timezone('utc'::text, now());

-- Grant minimal read-only access to anon and authenticated roles
create policy "Allow read access to system_health_probe"
  on public.system_health_probe
  for select
  using (true);

-- Lightweight DB health function as alternate probe
create or replace function public.probe_system_health()
returns jsonb
language sql
security definer
stable
as $$
  select jsonb_build_object(
    'status', 'ok',
    'marker', marker,
    'timestamp', timezone('utc'::text, now())
  )
  from public.system_health_probe
  where id = 1;
$$;

grant execute on function public.probe_system_health() to anon, authenticated, service_role;

