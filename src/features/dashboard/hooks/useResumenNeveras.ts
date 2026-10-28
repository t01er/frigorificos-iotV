import { useGetDashboardContadoresQuery } from "../services/mapApi";
import { MAX_DISPOSITIVOS } from "../../../config/types";
import { useNeveraFilterContext } from "../contexts/NeveraFilterContext";

export interface ResumenItem {
  name: string;
  value: number;
  color: string;
  estadoLabel: string;
}

export interface ResumenGrupo {
  total: number;
  items: ResumenItem[];
}

/** Grupos de estados de nevera según el código `estado_alarma` del mapa */
export const GRUPOS_ESTADO = {
  operativas: [2, 3, 4],
  alertadas: [1, 7],
  traslado: [0, 5, 6, 8, 9],
} as const;

export type GrupoKey = keyof typeof GRUPOS_ESTADO;

const sum = (items: ResumenItem[]) =>
  items.reduce((acc, item) => acc + item.value, 0);

/**
 * Si el total supera MAX_DISPOSITIVOS, reparte el tope entre los estados en
 * proporción (método del mayor resto) para que grupos y porcentajes sigan cuadrando.
 */
function limitarTotal(grupos: ResumenItem[][]): ResumenItem[][] {
  const todos = grupos.flat();
  const total = sum(todos);
  if (total <= MAX_DISPOSITIVOS) return grupos;

  const exactos = todos.map((i) => (i.value * MAX_DISPOSITIVOS) / total);
  const valores = exactos.map(Math.floor);
  let resto = MAX_DISPOSITIVOS - valores.reduce((a, v) => a + v, 0);
  exactos
    .map((x, idx) => ({ idx, frac: x - Math.floor(x) }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ idx }) => {
      if (resto-- > 0) valores[idx] += 1;
    });

  let k = 0;
  return grupos.map((g) => g.map((i) => ({ ...i, value: valores[k++] })));
}

export function useResumenNeveras() {
  const { distribuidorFilter, codNeveraFilter, imeiFilter, locacionFilter } =
    useNeveraFilterContext();

  const { data, isLoading } = useGetDashboardContadoresQuery({
    ...(distribuidorFilter && { distribuidor: distribuidorFilter }),
    ...(codNeveraFilter && { cod_nevera: codNeveraFilter }),
    ...(imeiFilter && { imei: imeiFilter }),
    ...(locacionFilter && { locacion: locacionFilter }),
  });

  const d = data?.data;
  if (!d) return { isLoading, resumen: null };

  const operativas: ResumenItem[] = [
    { name: "Cartera", value: d.operativo_CARTERA, color: "#7b2ff2", estadoLabel: "Operativo - Cartera" },
    { name: "Censo", value: d.operativo_CENSO, color: "#2f6bff", estadoLabel: "Operativo - Censo" },
    { name: "Instalación", value: d.operativo_INSTALACION, color: "#22c7ee", estadoLabel: "Operativo - Instalación" },
  ];

  const alertadas: ResumenItem[] = [
    { name: "Sin energía", value: d.desconexion_DE_ENERGIA, color: "#e8a21a", estadoLabel: "Desconexión por Energía" },
    { name: "Fuera de zona", value: d.fuera_DE_ZONA, color: "#e5484d", estadoLabel: "Fuera de Zona" },
  ];

  const traslado: ResumenItem[] = [
    { name: "Taller", value: d.taller, color: "#17123a", estadoLabel: "Taller" },
    { name: "Distribuidor", value: d.distribuidor, color: "#5f5d7a", estadoLabel: "Distribuidor" },
    { name: "Traslado", value: d.traslado, color: "#8582a0", estadoLabel: "Traslado" },
    { name: "Nestlé", value: d.nestle, color: "#aaa8c2", estadoLabel: "Nestlé" },
    { name: "Mantenimiento", value: d.mtto, color: "#c6c4d8", estadoLabel: "Mantenimiento" },
    { name: "Fuera de línea", value: d.fuera_DE_LINEA, color: "#dddce9", estadoLabel: "Fuera de Línea" },
  ];

  const [opLim, alLim, trLim] = limitarTotal([operativas, alertadas, traslado]);

  const grupos: Record<GrupoKey, ResumenGrupo> = {
    operativas: { total: sum(opLim), items: opLim },
    alertadas: { total: sum(alLim), items: alLim },
    traslado: { total: sum(trLim), items: trLim },
  };

  return {
    isLoading,
    resumen: {
      total:
        grupos.operativas.total + grupos.alertadas.total + grupos.traslado.total,
      corte: d.registro_CORTE,
      grupos,
    },
  };
}

const nf = new Intl.NumberFormat("es-ES", { useGrouping: "always" });
const pf = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const formatNumber = (n: number) => nf.format(n);
export const formatPercent = (part: number, total: number) =>
  `${pf.format(total > 0 ? (part / total) * 100 : 0)}%`;
