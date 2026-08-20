import {
  Widget5,
  SsdSquare,
  PieChart2,
  Bell,
  UserRounded,
  Buildings,
  LayersMinimalistic,
  Explicit,
  Settings,
  Chart,
  FileText,
  Checklist,
  Waterdrops,
  Letter,
  Box,
  Cpu,
} from "@solar-icons/react";

export const sidebarIcons: Record<number, any> = {
  1: Widget5,
  2: Settings,
  3: Buildings,
  4: Cpu,
  5: PieChart2,
  6: FileText,
  7: Bell,
  10: Waterdrops,
  11: UserRounded,
  12: Letter,
  13: Chart,
  14: Checklist,
  16: Box,
  17: Settings,
  18: Settings,
  19: LayersMinimalistic,
  20: Cpu,
};

export const getSidebarOptions = (opciones: any[]) => {
  return opciones.map((item) => ({
    name: item.nombre?.toLowerCase() === "sensores" ? "Dispositivos" : item.nombre,
    path: item.ruta === "escritorio" ? "/dashboard" : `/${item.ruta}`,
    icon: sidebarIcons[item.codigo] ?? Explicit,
    codigo: item.codigo,

    children:
      item.codigo === 18
        ? [
            {
              name: "Dashboard",
              path: "/dashboard",
              icon: Chart,
            },
            {
              name: "Neveras",
              path: "/dashboard/neveras",
              icon: SsdSquare,
            },
            {
              name: "Jasper",
              path: "/dashboard/jasper",
              icon: FileText,
            },
          ]
        : undefined,
  }));
};