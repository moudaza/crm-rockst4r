-- El payload del webhook de BOLD trae la "referencia externa" (nuestro
-- `reference`, que nosotros generamos al crear el link) pero no está
-- confirmado que traiga el id del link de pago (`bold_payment_link_id`) en
-- ningún campo documentado — así que la correlación del evento con el pago
-- debe hacerse por `reference`, no por `bold_payment_link_id`.

drop function if exists public.process_bold_webhook_event(text, text, public.payment_status, jsonb);

create or replace function public.process_bold_webhook_event(
  p_reference text,
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
    where reference = p_reference and status = 'PENDING'
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
