-- Etapa 3: conexión OAuth con Google Calendar
--
-- Conexión única compartida por todo el equipo (no es "una cuenta de Google
-- por usuario del CRM"): se guarda en una sola fila que actúa de singleton.
-- Los tokens NUNCA se exponen al navegador — solo se leen desde código de
-- servidor (src/lib/integrations/google-calendar.ts).

create table public.google_calendar_connection (
  id uuid primary key default '00000000-0000-0000-0000-000000000001',
  access_token text not null,
  refresh_token text not null,
  token_expires_at timestamptz not null,
  scope text,
  calendar_id text not null default 'primary',
  calendar_email text,
  connected_by uuid references public.profiles (id) on delete set null,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint google_calendar_connection_singleton check (
    id = '00000000-0000-0000-0000-000000000001'
  )
);

alter table public.google_calendar_connection enable row level security;

create policy "Usuarios autenticados pueden ver el estado de conexión"
  on public.google_calendar_connection for select to authenticated using (true);
create policy "Usuarios autenticados pueden conectar Google Calendar"
  on public.google_calendar_connection for insert to authenticated with check (true);
create policy "Usuarios autenticados pueden actualizar la conexión"
  on public.google_calendar_connection for update to authenticated using (true);
create policy "Usuarios autenticados pueden desconectar Google Calendar"
  on public.google_calendar_connection for delete to authenticated using (true);

grant select, insert, update, delete on public.google_calendar_connection to authenticated;

create trigger google_calendar_connection_set_updated_at
  before update on public.google_calendar_connection
  for each row execute procedure public.set_updated_at();
