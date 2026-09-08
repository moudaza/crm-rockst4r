-- Etapa 3: ventanas de disponibilidad por servicio (días/horarios en que se
-- puede reservar), para generar los horarios ofrecibles y cruzarlos contra
-- el free/busy real de Google Calendar.
--
-- end_time es la ÚLTIMA hora de inicio válida (inclusive), no el cierre real
-- del estudio — así "8:00–10:30" con duración 20min + buffer 5min genera
-- exactamente 8:00, 8:25, 8:50, 9:15, 9:40, 10:05, 10:30 (7 turnos), que es
-- lo que ya está publicado en el Appointment Schedule de Maratón.

create table public.service_availability_windows (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete cascade,
  -- 0=domingo … 6=sábado (mismo criterio que JS Date.getDay())
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  buffer_minutes integer not null default 5 check (buffer_minutes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_window_end_after_start check (end_time >= start_time)
);

alter table public.service_availability_windows enable row level security;

create policy "Usuarios autenticados pueden ver ventanas de disponibilidad"
  on public.service_availability_windows for select to authenticated using (true);
create policy "Usuarios autenticados pueden crear ventanas de disponibilidad"
  on public.service_availability_windows for insert to authenticated with check (true);
create policy "Usuarios autenticados pueden editar ventanas de disponibilidad"
  on public.service_availability_windows for update to authenticated using (true);
create policy "Usuarios autenticados pueden eliminar ventanas de disponibilidad"
  on public.service_availability_windows for delete to authenticated using (true);

grant select, insert, update, delete on public.service_availability_windows to authenticated;

create trigger service_availability_windows_set_updated_at
  before update on public.service_availability_windows
  for each row execute procedure public.set_updated_at();

create index service_availability_windows_service_id_idx
  on public.service_availability_windows (service_id);

-- Datos reales: Maratón General ya está publicado en Google Calendar
-- (Appointment Schedule) solo los sábados, con este horario exacto
-- (confirmado por el usuario 2026-09-08: 8:00–10:30am y 1:25–6:50pm).
insert into public.service_availability_windows
  (service_id, day_of_week, start_time, end_time, buffer_minutes)
select id, 6, '08:00'::time, '10:30'::time, 5 from public.services where name = 'Maratón'
union all
select id, 6, '13:25'::time, '18:50'::time, 5 from public.services where name = 'Maratón';
