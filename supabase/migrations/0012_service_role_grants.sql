-- Las rutas de Manychat (/api/manychat/*) llaman sin sesión de usuario, así
-- que usan un cliente `service_role` (src/lib/supabase/service-role.ts) en
-- vez del cliente con cookies. Se asumió que service_role tiene acceso total
-- por defecto en Supabase — falso en este proyecto (misma causa que la
-- trampa de "Automatically expose new tables" desactivado documentada para
-- authenticated/anon): hace falta GRANT explícito acá también.

grant select on public.services to service_role;
grant select on public.service_availability_windows to service_role;
grant select on public.reservations to service_role;
grant select, insert on public.leads to service_role;
grant select, insert on public.payments to service_role;

grant execute on function public.create_pre_reservation(uuid, timestamptz, uuid, uuid, text) to service_role;
