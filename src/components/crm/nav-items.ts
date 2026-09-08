import {
  LayoutDashboard,
  UserPlus,
  Users,
  Tag,
  FileText,
  Calendar,
  CheckSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  color: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, color: "#0071e3" },
  { href: "/prospectos", label: "Prospectos", icon: UserPlus, color: "#ff9500" },
  { href: "/clientes", label: "Clientes", icon: Users, color: "#34c759" },
  { href: "/servicios", label: "Servicios", icon: Tag, color: "#af52de" },
  { href: "/cotizaciones", label: "Cotizaciones", icon: FileText, color: "#ff2d55" },
  { href: "/calendario", label: "Calendario", icon: Calendar, color: "#ff3b30" },
  { href: "/tareas", label: "Tareas", icon: CheckSquare, color: "#ffcc00" },
  { href: "/configuracion", label: "Configuración", icon: Settings, color: "#8e8e93" },
];
