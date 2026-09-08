# ROCKST4R CRM

CRM interno para ROCKST4R STUDIO. Centraliza prospectos, clientes, cotizaciones,
servicios, reservas/calendario, pagos (BOLD) y automatizaciones (Manychat/WhatsApp).

Arquitectura: **el CRM decide, Manychat comunica**. La lógica de negocio y la
persistencia viven en el CRM/Supabase; Manychat es solo el canal de conversación
por WhatsApp.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres + Auth + RLS)
- Vercel (hosting)
- Google Calendar, BOLD y Manychat como integraciones desacopladas (etapas futuras)

## Estado del proyecto — Etapa 1 (en curso)

- [x] Proyecto Next.js con TypeScript y Tailwind
- [x] Clientes de Supabase (browser/server) + `proxy.ts` para refrescar sesión
- [x] Migración inicial (`profiles`, `roles`, RLS, trigger de alta de usuario)
- [x] Layout del CRM (sidebar + topbar) y página de login
- [x] Dashboard con la estructura de métricas (en cero hasta Etapa 2+)
- [x] Páginas del resto del menú como placeholder ("Próximamente")
- [ ] Repo en GitHub
- [ ] Proyecto en Supabase real + variables de entorno cargadas
- [ ] Deploy en Vercel

### Próximas etapas

2. Prospectos, Clientes, Servicios, Cotizaciones, Tareas (CRUD + Supabase).
3. Google Calendar, disponibilidad, reservas, pre-reserva de 10 minutos, anti doble-reserva.
4. BOLD: pagos, webhook, idempotencia, confirmación automática.
5. API para Manychat + eventos CRM → Manychat (flujo WhatsApp completo).
6. Auditoría, logs, seguridad, optimización, pruebas, deploy a producción.

No se construye todo de una vez — cada etapa se cierra y se prueba antes de
avanzar a la siguiente. Fuera de alcance por ahora (fases futuras, no tocar):
galería de selección de fotos, descarga desde galería, sincronización con
Dropbox.

## Setup local

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Copiar `.env.example` a `.env.local` y completar con los valores reales
   (nunca subir `.env.local` a git):

   ```bash
   cp .env.example .env.local
   ```

3. Crear un proyecto en [Supabase](https://supabase.com) y correr la migración
   inicial (`supabase/migrations/0001_init.sql`) con la CLI de Supabase o desde
   el SQL Editor del dashboard.

4. Levantar el servidor de desarrollo:

   ```bash
   npm run dev
   ```

## Reglas críticas de negocio

- **Pre-reserva = 10 minutos exactos** (configurable desde Configuración), controlados
  por timestamps en Supabase — nunca por `setTimeout` del navegador ni por Manychat.
- **Anti doble-reserva**: la creación de una pre-reserva debe ser atómica (constraints/
  transacciones en DB). Nunca dos `PRE_RESERVED` para el mismo horario.
- **Pagos BOLD**: la redirección del navegador tras pagar no es prueba de pago. Solo el
  webhook de BOLD (o una consulta backend de respaldo) confirma un pago. El webhook debe
  ser idempotente.
- **Secretos**: `SUPABASE_SERVICE_ROLE_KEY` y las API keys de BOLD/Manychat/Google nunca
  van al frontend ni al repo. Solo en variables de entorno del hosting.

## Estructura

```
src/
  app/
    (crm)/          # layout con sidebar+topbar, requiere sesión
      dashboard/
      prospectos/
      clientes/
      servicios/
      cotizaciones/
      calendario/
      tareas/
      configuracion/
    login/
  components/crm/    # Sidebar, Topbar, StatCard, etc.
  lib/supabase/       # clientes browser/server + refresco de sesión (proxy)
  proxy.ts             # protege rutas del CRM, redirige a /login sin sesión
supabase/migrations/    # migraciones SQL versionadas
```
