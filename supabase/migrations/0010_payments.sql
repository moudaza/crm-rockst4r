-- Etapa 4: Pagos con BOLD
--
-- El link de pago lo genera el staff desde una reserva PRE_RESERVED
-- (autenticado, RLS normal). La confirmación del pago SOLO llega por el
-- webhook de BOLD (nunca por el redirect del navegador) — ese endpoint no
-- tiene sesión de usuario, así que la transición de estado vive en una
-- función SECURITY DEFINER otorgada al rol `anon`, acotada a lo mínimo
-- necesario (nunca se le da acceso directo de escritura a la tabla).

create type public.payment_status as enum (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'VOID_APPROVED',
  'VOID_REJECTED'
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations (id) on delete cascade,
  reference text not null unique,
  bold_payment_link_id text not null unique,
  bold_transaction_id text,
  status public.payment_status not null default 'PENDING',
  amount numeric(12, 2) not null check (amount > 0),
  currency text not null default 'COP',
  checkout_url text not null,
  raw_webhook_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.payments enable row level security;

create policy "Usuarios autenticados pueden ver pagos"
  on public.payments for select to authenticated using (true);
create policy "Usuarios autenticados pueden crear links de pago"
  on public.payments for insert to authenticated with check (true);

grant select, insert on public.payments to authenticated;

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute procedure public.set_updated_at();

create index payments_reservation_id_idx on public.payments (reservation_id);
create index payments_status_idx on public.payments (status);

-- Procesa un evento de webhook de BOLD ya verificado (firma HMAC chequeada
-- en el Route Handler, antes de llamar acá). Idempotente por diseño: solo
-- transiciona pagos que sigan en PENDING, así que un reintento del mismo
-- evento no hace nada la segunda vez.
--
-- Si el pago queda APPROVED, confirma la reserva asociada (si sigue
-- PRE_RESERVED) y devuelve los datos necesarios para crear el evento de
-- Google Calendar desde el Route Handler — la función no puede llamar a la
-- API de Google directamente, así que ese paso queda afuera.
create or replace function public.process_bold_webhook_event(
  p_bold_payment_link_id text,
  p_bold_transaction_id text,
  p_status public.payment_status,
  p_raw_payload jsonb
) returns table (
  reservation_id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  notes text,
  service_name text,
  contact_name text,
  needs_google_event boolean
)
language plpgsql
security definer set search_path = public
as $$
declare
  v_payment public.payments%rowtype;
  v_reservation public.reservations%rowtype;
begin
  select * into v_payment
    from public.payments
    where bold_payment_link_id = p_bold_payment_link_id and status = 'PENDING'
    for update;

  if not found then
    return;
  end if;

  update public.payments
    set status = p_status,
        bold_transaction_id = p_bold_transaction_id,
        raw_webhook_payload = p_raw_payload,
        paid_at = case when p_status = 'APPROVED' then now() else null end
    where id = v_payment.id;

  if p_status != 'APPROVED' then
    return;
  end if;

  update public.reservations
    set status = 'CONFIRMED', confirmed_at = now(), expires_at = null
    where id = v_payment.reservation_id and status = 'PRE_RESERVED'
    returning * into v_reservation;

  if not found then
    return;
  end if;

  return query
    select
      v_reservation.id,
      v_reservation.starts_at,
      v_reservation.ends_at,
      v_reservation.notes,
      s.name,
      coalesce(c.name, l.name),
      true
    from public.services s
    left join public.clients c on c.id = v_reservation.client_id
    left join public.leads l on l.id = v_reservation.lead_id
    where s.id = v_reservation.service_id;
end;
$$;

grant execute on function public.process_bold_webhook_event(text, text, public.payment_status, jsonb) to anon;

-- Guarda el google_event_id creado por el Route Handler tras procesar el
-- webhook — necesita SECURITY DEFINER por el mismo motivo (sin sesión).
create or replace function public.set_reservation_google_event(
  p_reservation_id uuid,
  p_google_event_id text
) returns void
language sql
security definer set search_path = public
as $$
  update public.reservations
    set google_event_id = p_google_event_id
    where id = p_reservation_id;
$$;

grant execute on function public.set_reservation_google_event(uuid, text) to anon;
