-- Etapa 3: guarda el id del evento de Google Calendar creado al confirmar
-- una reserva, para poder borrarlo/actualizarlo si la reserva se cancela.
alter table public.reservations add column google_event_id text;
