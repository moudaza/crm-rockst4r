export type NavItem = {
  href: string;
  label: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/prospectos", label: "Prospectos" },
  { href: "/clientes", label: "Clientes" },
  { href: "/servicios", label: "Servicios" },
  { href: "/cotizaciones", label: "Cotizaciones" },
  { href: "/calendario", label: "Calendario" },
  { href: "/tareas", label: "Tareas" },
  { href: "/configuracion", label: "Configuración" },
];
