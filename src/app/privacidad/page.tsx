export const metadata = {
  title: "Política de Privacidad — ROCKST4R STUDIO",
};

export default function PrivacidadPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 bg-zinc-50 px-6 py-16 dark:bg-black">
      <header>
        <p className="text-sm font-medium text-zinc-400">ROCKST4R STUDIO</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Política de Privacidad
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Última actualización: 8 de septiembre de 2026
        </p>
      </header>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <Section title="1. Quiénes somos">
          <p>
            ROCKST4R STUDIO (&quot;nosotros&quot;) es un estudio de fotografía. Esta
            política explica qué información personal recopilamos cuando
            reservás o contratás uno de nuestros servicios, cómo la usamos y
            qué derechos tenés sobre ella.
          </p>
          <p>
            Datos de contacto para temas de privacidad:{" "}
            <a href="mailto:info@rockst4rstudio.com" className="underline">
              info@rockst4rstudio.com
            </a>
            .
          </p>
        </Section>

        <Section title="2. Qué información recopilamos">
          <List
            items={[
              "Datos de contacto: nombre, teléfono, WhatsApp y email.",
              "Datos de la reserva: servicio de interés, fecha y horario de la sesión, notas asociadas.",
              "Datos de pago: los procesa directamente nuestra pasarela de pagos (BOLD) — nosotros no almacenamos números de tarjeta ni datos financieros completos, solo el estado y la referencia del pago.",
              "Fotografías tomadas durante la sesión contratada.",
              "Mensajes que nos escribís por WhatsApp para coordinar tu reserva.",
            ]}
          />
        </Section>

        <Section title="3. Para qué usamos tu información">
          <List
            items={[
              "Gestionar tu reserva, confirmarla y recordártela.",
              "Comunicarnos con vos por WhatsApp sobre tu sesión.",
              "Procesar el pago de tu servicio.",
              "Entregarte las fotografías editadas que incluye tu paquete.",
              "Mejorar nuestros servicios y nuestra atención al cliente.",
            ]}
          />
        </Section>

        <Section title="4. Con quién compartimos tu información">
          <p>
            No vendemos tu información a terceros. La compartimos únicamente
            con los proveedores que necesitamos para operar el servicio:
          </p>
          <List
            items={[
              "BOLD — procesamiento de pagos.",
              "Manychat / Meta (WhatsApp Business) — comunicación por WhatsApp.",
              "Google Calendar — coordinación de horarios y disponibilidad.",
              "Supabase — almacenamiento seguro de la base de datos de nuestro sistema interno (infraestructura en la nube).",
            ]}
          />
          <p>
            Cada uno de estos proveedores procesa tu información bajo sus
            propias políticas de privacidad y únicamente para los fines
            descritos acá.
          </p>
        </Section>

        <Section title="5. Uso de fotografías">
          <p>
            Las fotografías editadas que te entregamos son tuyas para tu uso
            personal. Solo publicamos o usamos tus fotos en nuestro
            portafolio, redes sociales o material promocional si nos diste tu
            autorización expresa para hacerlo — nunca por defecto.
          </p>
        </Section>

        <Section title="6. Cuánto tiempo conservamos tu información">
          <p>
            Conservamos tus datos de contacto y el historial de tus reservas
            mientras mantengas una relación comercial con nosotros, y por el
            tiempo adicional que exija la ley aplicable (por ejemplo, en
            temas contables o fiscales). Podés pedirnos la eliminación de tus
            datos en cualquier momento, según se explica en la sección 7.
          </p>
        </Section>

        <Section title="7. Tus derechos">
          <p>
            De acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de
            Colombia (habeas data), tenés derecho a:
          </p>
          <List
            items={[
              "Conocer, actualizar y rectificar tus datos personales.",
              "Solicitar prueba de la autorización que nos diste para tratarlos.",
              "Ser informado sobre el uso que le dimos a tus datos.",
              "Presentar quejas ante la autoridad competente por infracciones a la ley.",
              "Revocar la autorización y/o solicitar la eliminación de tus datos, cuando no exista un deber legal o contractual que nos obligue a conservarlos.",
            ]}
          />
          <p>
            Para ejercer cualquiera de estos derechos, escribinos a{" "}
            <a href="mailto:info@rockst4rstudio.com" className="underline">
              info@rockst4rstudio.com
            </a>
            .
          </p>
        </Section>

        <Section title="8. Seguridad">
          <p>
            Tomamos medidas técnicas y organizativas razonables para proteger
            tu información contra acceso no autorizado, pérdida o alteración.
            Ningún sistema es 100% infalible, pero trabajamos con proveedores
            reconocidos (Supabase, Google, BOLD) que cumplen estándares de
            seguridad de la industria.
          </p>
        </Section>

        <Section title="9. Cambios a esta política">
          <p>
            Podemos actualizar esta política ocasionalmente. Si hacemos
            cambios importantes, te lo vamos a comunicar por los mismos
            canales que usamos habitualmente (WhatsApp o email).
          </p>
        </Section>
      </div>

      <footer className="mt-4 border-t border-zinc-200 pt-6 text-xs text-zinc-400 dark:border-zinc-800">
        Este documento es un borrador inicial redactado para ROCKST4R STUDIO.
        No sustituye asesoría legal profesional — se recomienda revisión por
        un abogado antes de considerarlo definitivo.
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
      {children}
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
