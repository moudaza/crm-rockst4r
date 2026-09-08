-- Etapa 3: Reservas, pre-reserva de 10 minutos, anti doble-reserva
--
-- El estudio se modela como UN solo recurso compartido (no hay dos sesiones
-- en simultáneo sin importar el servicio) — por eso el anti-solapamiento es
-- sobre starts_at/ends_at directamente, sin resource_id.
--
-- Google Calendar todavía no está conectado (falta crear el proyecto OAuth
-- en Google Cloud) — esta tabla es la fuente de verdad por ahora; cuando
-- exista la integración, se sincroniza hacia/desde Google Calendar sin
-- cambiar este modelo.

create type public.reservation_status as enum (
  'PRE_RESERVED',
  'CONFIRMED',
  'EXPIRED',
  'CANCELLED'
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id),
  lead_id uuid references public.leads (id) on delete set null,
  client_id uuid references public.clients (id) on delete set null,
  status public.reservation_status not null default 'PRE_RESERVED',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reserved_at timestamptz not null default now(),
  expires_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reservation_needs_a_contact check (lead_id is not null or client_id is not null),
  constraint reservation_ends_after_starts check (ends_at > starts_at)
);

-- Anti doble-reserva: Postgres rechaza atómicamente cualquier INSERT/UPDATE
-- que solape con una reserva PRE_RESERVED o CONFIRMED existente. Esto es una
-- garantía de la base de datos, no de la aplicación — funciona incluso con
-- requests concurrentes.
alter table public.reservations
  add constraint reservations_no_overlap
  exclude using gist (
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status in ('PRE_RESERVED', 'CONFIRMED'));

alter table public.reservations enable row level security;

create policy "Usuarios autenticados pueden ver reservas"
  on public.reservations for select to authenticated using (true);
create policy "Usuarios autenticados pueden crear reservas"
  on public.reservations for insert to authenticated with check (true);
create policy "Usuarios autenticados pueden editar reservas"
  on public.reservations for update to authenticated using (true);
create policy "Usuarios autenticados pueden eliminar reservas"
  on public.reservations for delete to authenticated using (true);

grant select, insert, update, delete on public.reservations to authenticated;

create trigger reservations_set_updated_at
  before update on public.reservations
  for each row execute procedure public.set_updated_at();

create index reservations_starts_at_idx on public.reservations (starts_at);
create index reservations_status_idx on public.reservations (status);

-- Crea una pre-reserva de forma atómica: primero barre pre-reservas vencidas
-- (para liberar el horario) y recién ahí intenta insertar la nueva, dentro
-- de la misma transacción. El tiempo de expiración lo define el backend
-- (expires_at = now() + pre_reservation_minutes del servicio), nunca el
-- navegador.
create or replace function public.create_pre_reservation(
  p_service_id uuid,
  p_starts_at timestamptz,
  p_lead_id uuid default null,
  p_client_id uuid default null,
  p_notes text default null
) returns public.reservations
language plpgsql
security definer set search_path = public
as $$
declare
  v_service public.services%rowtype;
  v_ends_at timestamptz;
  v_reservation public.reservations%rowtype;
begin
  select * into v_service from public.services where id = p_service_id and active = true;
  if not found then
    raise exception 'Servicio no encontrado o inactivo';
  end if;

  if p_lead_id is null and p_client_id is null then
    raise exception 'Se requiere un prospecto o cliente';
  end if;

  v_ends_at := p_starts_at + (v_service.duration_minutes || ' minutes')::interval;

  update public.reservations
    set status = 'EXPIRED'
    where status = 'PRE_RESERVED' and expires_at < now();

  insert into public.reservations (
    service_id, lead_id, client_id, status, starts_at, ends_at, reserved_at, expires_at, notes
  ) values (
    p_service_id, p_lead_id, p_client_id, 'PRE_RESERVED', p_starts_at, v_ends_at, now(),
    now() + (v_service.pre_reservation_minutes || ' minutes')::interval, p_notes
  )
  returning * into v_reservation;

  return v_reservation;
end;
$$;

grant execute on function public.create_pre_reservation(uuid, timestamptz, uuid, uuid, text) to authenticated;
