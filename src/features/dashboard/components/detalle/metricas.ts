import { Lightning, Login, Thermometer, WiFiRouterMinimalistic } from "@solar-icons/react";

import type { Metrica } from "../../mocks/neveraDetalleMock";

type Icono = typeof Thermometer;

export const METRICAS: Record<Metrica, { label: string; Icon: Icono; tono: string }> = {
  temperatura: { label: "Temperatura", Icon: Thermometer, tono: "bg-nx-purple/10 text-nx-purple" },
  puerta: { label: "Puerta", Icon: Login, tono: "bg-nx-info-soft text-nx-info" },
  energia: { label: "Energía", Icon: Lightning, tono: "bg-nx-ok-soft text-nx-ok" },
  desconexion: { label: "Desconexión", Icon: WiFiRouterMinimalistic, tono: "bg-nx-err-soft text-nx-err" },
};
