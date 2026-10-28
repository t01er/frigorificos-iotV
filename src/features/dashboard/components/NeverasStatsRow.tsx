import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { Skeleton } from "@heroui/react";
import { Fridge } from "@solar-icons/react";

import { useNeveraFilterContext } from "../contexts/NeveraFilterContext";
import {
  formatNumber,
  useResumenNeveras,
  type GrupoKey,
  type ResumenGrupo,
} from "../hooks/useResumenNeveras";

interface NeverasStatsRowProps {
  activeFilter: string;
  onFilterByEstado: (estadoLabel: string) => void;
  onClearFilters: () => void;
}

const TITLES: Record<GrupoKey, string> = {
  operativas: "Operativas",
  alertadas: "Alertadas",
  traslado: "En traslado",
};

function DonutCard({
  title,
  grupo,
  activeFilter,
  onItemClick,
}: {
  title: string;
  grupo: ResumenGrupo;
  activeFilter: string;
  onItemClick: (estadoLabel: string) => void;
}) {
  const data = grupo.items.filter((i) => i.value > 0);

  return (
    <section className="rounded-[1.75rem] bg-nx-surface p-5 flex items-center gap-5">
      <div className="size-28 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length ? data : [{ name: "-", value: 1, color: "#e3e3ef" }]}
              dataKey="value"
              nameKey="name"
              innerRadius="68%"
              outerRadius="100%"
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {(data.length
                ? data
                : [{ name: "-", color: "#e3e3ef", estadoLabel: "" }]
              ).map((item) => (
                <Cell
                  key={item.name}
                  fill={item.color}
                  opacity={
                    activeFilter && activeFilter !== item.estadoLabel ? 0.35 : 1
                  }
                  className="cursor-pointer outline-none"
                  onClick={() => item.estadoLabel && onItemClick(item.estadoLabel)}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex flex-col leading-tight">
          <span className="text-sm text-nx-text-2">{title}</span>
          <span className="text-3xl font-bold text-nx-text tabular-nums">
            {formatNumber(grupo.total)}
          </span>
        </div>
        <ul className="flex flex-col gap-0.5">
          {grupo.items.map((item) => {
            const active = activeFilter === item.estadoLabel;
            return (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => onItemClick(item.estadoLabel)}
                  title={`Filtrar por ${item.name}`}
                  className={`w-full flex items-center gap-2 rounded-md px-1 text-xs transition-colors ${
                    active ? "bg-nx-purple/10 font-semibold" : "hover:bg-nx-surface-2"
                  }`}
                >
                  <span
                    className="size-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="flex-1 text-left truncate text-nx-text-2">
                    {item.name}
                  </span>
                  <span className="font-semibold text-nx-text tabular-nums">
                    {formatNumber(item.value)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default function NeverasStatsRow({
  activeFilter,
  onFilterByEstado,
  onClearFilters,
}: NeverasStatsRowProps) {
  const { clearAllFilters } = useNeveraFilterContext();
  const { resumen, isLoading } = useResumenNeveras();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 rounded-[1.75rem]" />
        ))}
      </div>
    );
  }
  if (!resumen) return null;

  const corte = resumen.corte?.replaceAll("-", "/");

  const handleItemClick = (label: string) => {
    if (activeFilter === label) onClearFilters();
    else onFilterByEstado(label);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <button
        type="button"
        title="Limpiar filtros"
        onClick={() => {
          clearAllFilters();
          onClearFilters();
        }}
        className="text-left rounded-[1.75rem] bg-nx-gradient text-white p-6 flex flex-col justify-between gap-4"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/85">Total de neveras</span>
          <span className="size-9 rounded-full bg-white/20 flex items-center justify-center">
            <Fridge size={18} />
          </span>
        </div>
        <span className="text-5xl font-bold tracking-tight tabular-nums">
          {formatNumber(resumen.total)}
        </span>
        {corte && <span className="text-xs text-white/80">al {corte}</span>}
      </button>

      {(Object.keys(resumen.grupos) as GrupoKey[]).map((key) => (
        <DonutCard
          key={key}
          title={TITLES[key]}
          grupo={resumen.grupos[key]}
          activeFilter={activeFilter}
          onItemClick={handleItemClick}
        />
      ))}
    </div>
  );
}
