-- Etapa 2: Prospectos (pipeline) y Clientes

create type public.lead_status as enum (
  'NUEVO',
  'CONTACTADO',
  'COTIZACION_ENVIADA',
  'EN_NEGOCIACION',
  'RESERVADO',
  'CLIENTE',
  'PERDIDO'
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  whatsapp text,
  email text,
  document text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  whatsapp text,
  email text,
  service_id uuid references public.services (id) on delete set null,
  source text,
  status public.lead_status not null default 'NUEVO',
  last_contacted_at timestamptz,
  next_follow_up_at date,
  notes text,
  converted_to_client_id uuid references public.clients (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients enable row level security;
alter table public.leads enable row level security;

-- CRM interno: cualquier usuario autenticado (staff/admin) puede administrar
-- prospectos y clientes.
create policy "Usuarios autenticados pueden ver clientes"
  on public.clients for select to authenticated using (true);
create policy "Usuarios autenticados pueden crear clientes"
  on public.clients for insert to authenticated with check (true);
create policy "Usuarios autenticados pueden editar clientes"
  on public.clients for update to authenticated using (true);
create policy "Usuarios autenticados pueden eliminar clientes"
  on public.clients for delete to authenticated using (true);

create policy "Usuarios autenticados pueden ver prospectos"
  on public.leads for select to authenticated using (true);
create policy "Usuarios autenticados pueden crear prospectos"
  on public.leads for insert to authenticated with check (true);
create policy "Usuarios autenticados pueden editar prospectos"
  on public.leads for update to authenticated using (true);
create policy "Usuarios autenticados pueden eliminar prospectos"
  on public.leads for delete to authenticated using (true);

-- Recordatorio: RLS no alcanza en este proyecto (auto-expose desactivado a
-- propósito) — hace falta GRANT explícito o la API devuelve permission denied.
grant select, insert, update, delete on public.clients to authenticated;
grant select, insert, update, delete on public.leads to authenticated;

create trigger clients_set_updated_at
  before update on public.clients
  for each row execute procedure public.set_updated_at();

create trigger leads_set_updated_at
  before update on public.leads
  for each row execute procedure public.set_updated_at();

create index leads_status_idx on public.leads (status);
create index leads_service_id_idx on public.leads (service_id);
