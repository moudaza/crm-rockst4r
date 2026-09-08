-- Etapa 2: Servicios (catálogo configurable, no hardcodeado)

create type public.service_payment_type as enum ('FULL', 'DEPOSIT');

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  price numeric(12, 2) not null check (price >= 0),
  payment_type public.service_payment_type not null default 'FULL',
  deposit_percentage numeric(5, 2) check (
    deposit_percentage is null
    or (deposit_percentage > 0 and deposit_percentage <= 100)
  ),
  pre_reservation_minutes integer not null default 10 check (pre_reservation_minutes > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deposit_percentage_required_for_deposit check (
    payment_type = 'FULL' or deposit_percentage is not null
  )
);

alter table public.services enable row level security;

-- CRM interno: cualquier usuario autenticado (staff/admin) puede administrar servicios.
create policy "Usuarios autenticados pueden ver servicios"
  on public.services for select
  to authenticated
  using (true);

create policy "Usuarios autenticados pueden crear servicios"
  on public.services for insert
  to authenticated
  with check (true);

create policy "Usuarios autenticados pueden editar servicios"
  on public.services for update
  to authenticated
  using (true);

create policy "Usuarios autenticados pueden eliminar servicios"
  on public.services for delete
  to authenticated
  using (true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger services_set_updated_at
  before update on public.services
  for each row execute procedure public.set_updated_at();

-- Datos de ejemplo (ficticios) según la spec
insert into public.services
  (name, description, duration_minutes, price, payment_type, deposit_percentage, pre_reservation_minutes)
values
  ('Maratón', 'Sesión rápida', 20, 120000, 'FULL', null, 10),
  ('Sesión 1 hora', 'Sesión estándar de 1 hora', 60, 300000, 'DEPOSIT', 50, 10);
