export const metadata = {
  title: "Términos y Condiciones — ROCKST4R STUDIO",
};

export default function TerminosPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 bg-zinc-50 px-6 py-16 dark:bg-black">
      <header>
        <p className="text-sm font-medium text-zinc-400">ROCKST4R STUDIO</p>
        <h1 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Términos y Condiciones del Servicio
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Última actualización: 8 de septiembre de 2026
        </p>
      </header>

      <div className="flex flex-col gap-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <Section title="1. Aceptación">
          <p>
            Al reservar o contratar un servicio con ROCKST4R STUDIO
            (&quot;nosotros&quot;), ya sea por WhatsApp, nuestro sitio web o
            directamente con el equipo, aceptás estos términos y condiciones.
          </p>
        </Section>

        <Section title="2. Servicios">
          <p>
            Ofrecemos sesiones fotográficas de distintos tipos (por ejemplo,
            Maratón, sesiones individuales por hora, y otros paquetes). Cada
            servicio tiene su propia duración, precio y condiciones de pago,
            que te informamos antes de confirmar tu reserva.
          </p>
        </Section>

        <Section title="3. Reservas y pre-reserva">
          <p>
            Al elegir un horario, tu cupo queda pre-reservado durante un
            tiempo limitado (normalmente 10 minutos) mientras completás el
            pago. Si el pago no se confirma dentro de ese tiempo, el horario
            se libera automáticamente y puede ser tomado por otra persona.
          </p>
          <p>
            Un horario queda confirmado únicamente cuando el pago fue
            aprobado por nuestra pasarela de pagos (BOLD). La sola
            redirección después de pagar no garantiza la reserva — la
            confirmación llega por WhatsApp una vez que el pago fue
            verificado.
          </p>
        </Section>

        <Section title="4. Pagos">
          <p>
            Según el servicio, el pago requerido puede ser del 100% del valor
            o un depósito parcial (por ejemplo, 50%), como se indique al
            momento de reservar. Los pagos se procesan a través de BOLD.
          </p>
        </Section>

        <Section title="5. Puntualidad">
          <p>
            El tiempo de tu sesión es estricto y comienza a la hora
            reservada, así llegues tarde. Por ejemplo, si tu sesión empieza a
            las 3:00 p.m. y dura 20 minutos, termina a las 3:20 p.m.:
          </p>
          <List
            items={[
              "Llegás 5 minutos tarde → te quedan 15 minutos de sesión.",
              "Llegás 10 minutos tarde → te quedan 10 minutos de sesión.",
              "El tiempo perdido por llegar tarde no se recupera ni se repone.",
            ]}
          />
        </Section>

        <Section title="6. Cancelaciones y reprogramaciones">
          <p>
            Si necesitás cancelar o reprogramar tu sesión, escribinos por
            WhatsApp con la mayor anticipación posible. Las condiciones de
            reembolso o reprogramación dependen del servicio contratado y te
            las confirmamos al momento de coordinar el cambio.
          </p>
        </Section>

        <Section title="7. Entrega de fotografías">
          <p>
            Cada servicio incluye una cantidad determinada de fotografías
            editadas (por ejemplo, el Maratón incluye 5 fotos editadas, con
            la opción de agregar fotos y personas adicionales por un costo
            extra). Te entregamos las fotos editadas dentro del plazo que te
            informamos al contratar el servicio.
          </p>
        </Section>

        <Section title="8. Uso de las fotografías">
          <p>
            Las fotos editadas que te entregamos son para tu uso personal.
            Nosotros solo usamos tus fotos en nuestro portafolio o redes
            sociales si nos autorizás expresamente a hacerlo.
          </p>
        </Section>

        <Section title="9. Responsabilidad">
          <p>
            Nos comprometemos a prestar el servicio con profesionalismo. No
            somos responsables por circunstancias fuera de nuestro control
            razonable (por ejemplo, fallas técnicas de terceros como la
            pasarela de pagos o problemas de conectividad) que puedan afectar
            la prestación del servicio — en esos casos, te ofrecemos
            reprogramar sin costo adicional.
          </p>
        </Section>

        <Section title="10. Modificaciones">
          <p>
            Podemos actualizar estos términos ocasionalmente. La versión
            vigente es siempre la publicada en esta página.
          </p>
        </Section>

        <Section title="11. Ley aplicable">
          <p>
            Estos términos se rigen por las leyes de la República de
            Colombia.
          </p>
        </Section>

        <Section title="12. Contacto">
          <p>
            Para consultas sobre estos términos, escribinos a{" "}
            <a href="mailto:info@rockst4rstudio.com" className="underline">
              info@rockst4rstudio.com
            </a>
            .
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
