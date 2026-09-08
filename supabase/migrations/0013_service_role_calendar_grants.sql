-- Faltó en 0012: las rutas de Manychat consultan disponibilidad, que
-- internamente lee/actualiza google_calendar_connection (free/busy +
-- refresco de token) con el cliente service_role.
grant select, update on public.google_calendar_connection to service_role;
