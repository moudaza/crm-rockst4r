-- Al desactivar "Automatically expose new tables" en la creación del proyecto,
-- cada tabla nueva necesita un GRANT explícito además de sus políticas RLS,
-- o Postgres deniega el acceso aunque la policy lo permita.
-- Esto quedó pendiente desde 0001_init.sql y 0002_services.sql.

grant select, update on public.profiles to authenticated;
grant select on public.roles to authenticated;
grant select, insert, update, delete on public.services to authenticated;
