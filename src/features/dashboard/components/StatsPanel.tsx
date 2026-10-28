import { useState } from "react";
import { Chip, Skeleton } from "@heroui/react";
import {
  CheckCircle,
  DangerTriangle,
  Delivery,
  Fridge,
} from "@solar-icons/react";

import { useNeveraFilterContext } from "../contexts/NeveraFilterContext";
import {
  formatNumber,
  formatPercent,
  useResumenNeveras,
  type GrupoKey,
  type ResumenGrupo,
} from "../hooks/useResumenNeveras";

interface StatsPanelProps {
  onFilterByEstado?: (estadoLabel: string) => void;
  onClearFilters?: () => void;
}

const GRUPO_META: Record<
  GrupoKey,
  { title: string; icon: React.ReactNode; tint: string }
> = {
  operativas: {
    title: "Operativas",
    icon: <CheckCircle size={20} />,
    tint: "bg-nx-purple/10 text-nx-purple",
  },
  alertadas: {
    title: "Alertadas",
    icon: <DangerTriangle size={20} />,
    tint: "bg-nx-warn-soft text-nx-warn-ink",
  },
  traslado: {
    title: "En traslado",
    icon: <Delivery size={20} />,
    tint: "bg-nx-surface-2 text-nx-text-2",
  },
};

function SegmentedBar({
  segments,
}: {
  segments: { value: number; color: string }[];
}) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  return (
    <div className="flex gap-[3px] w-full h-2">
      {segments
        .filter((s) => s.value > 0)
        .map((s, i) => (
          <span
            key={i}
            className="h-full rounded-full min-w-[4px]"
            style={{
              width: `${total > 0 ? (s.value / total) * 100 : 0}%`,
              backgroundColor: s.color,
            }}
          />
        ))}
    </div>
  );
}

function GrupoCard({
  grupoKey,
  grupo,
  total,
  activeFilter,
  onItemClick,
}: {
  grupoKey: GrupoKey;
  grupo: ResumenGrupo;
  total: number;
  activeFilter: string;
  onItemClick: (estadoLabel: string) => void;
}) {
  const meta = GRUPO_META[grupoKey];

  return (
    <section className="rounded-[1.75rem] bg-nx-surface p-5 flex flex-col gap-4">
      <header className="flex items-center gap-3">
        <span
          className={`size-9 rounded-full flex items-center justify-center ${meta.tint}`}
        >
          {meta.icon}
        </span>
        <h3 className="flex-1 text-sm font-semibold text-nx-text">
          {meta.title}
        </h3>
        <span className="text-2xl font-bold text-nx-text tabular-nums">
          {formatNumber(grupo.total)}
        </span>
        <Chip
          size="sm"
          variant="flat"
          classNames={{
            base: "bg-nx-surface-2",
            content: "text-[11px] font-medium text-nx-text-2",
          }}
        >
          {formatPercent(grupo.total, total)}
        </Chip>
      </header>

      <SegmentedBar segments={grupo.items} />

      <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
        {grupo.items.map((item) => {
          const active = activeFilter === item.estadoLabel;
          return (
            <li key={item.name}>
              <button
                type="button"
                onClick={() => onItemClick(item.estadoLabel)}
                title={`Filtrar por ${item.name}`}
                className={`w-full flex items-center gap-2 rounded-lg -mx-1.5 px-1.5 py-0.5 text-sm transition-colors ${
                  active
                    ? "bg-nx-purple/10 font-semibold"
                    : "hover:bg-nx-surface-2"
                }`}
              >
                <span
                  className="size-2 rounded-full shrink-0"
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
    </section>
  );
}

function StatsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-52 rounded-[1.75rem]" />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="h-40 rounded-[1.75rem]" />
      ))}
    </div>
  );
}

export default function StatsPanel({
  onFilterByEstado,
  onClearFilters,
}: StatsPanelProps) {
  const { clearAllFilters } = useNeveraFilterContext();
  const { resumen, isLoading } = useResumenNeveras();
  const [activeFilter, setActiveFilter] = useState("");

  if (isLoading) return <StatsSkeleton />;
  if (!resumen) return null;

  const { total, grupos } = resumen;

  const handleItemClick = (estadoLabel: string) => {
    if (activeFilter === estadoLabel) {
      setActiveFilter("");
      onClearFilters?.();
      return;
    }
    setActiveFilter(estadoLabel);
    onFilterByEstado?.(estadoLabel);
  };

  const handleClearAll = () => {
    setActiveFilter("");
    clearAllFilters();
    onClearFilters?.();
  };

  const resumenTotal = [
    { label: "Operativas", value: grupos.operativas.total, color: "#ffffff" },
    { label: "Alertadas", value: grupos.alertadas.total, color: "#fcd179" },
    {
      label: "Traslado",
      value: grupos.traslado.total,
      color: "rgba(255,255,255,0.45)",
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={handleClearAll}
        title="Limpiar filtros"
        className="text-left rounded-[1.75rem] bg-nx-gradient text-white p-6 flex flex-col gap-5"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/85">Total de neveras</span>
          <span className="size-9 rounded-full bg-white/20 flex items-center justify-center">
            <Fridge size={18} />
          </span>
        </div>

        <span className="text-5xl font-bold tracking-tight tabular-nums">
          {formatNumber(total)}
        </span>

        <div className="flex flex-col gap-3">
          <SegmentedBar
            segments={resumenTotal.map((s) => ({
              value: s.value,
              color: s.color,
            }))}
          />
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/85">
            {resumenTotal.map((s) => (
              <span key={s.label} className="flex items-center gap-1.5">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                {s.label}
                <b className="font-semibold text-white">
                  {formatPercent(s.value, total)}
                </b>
              </span>
            ))}
          </div>
        </div>
      </button>

      {(Object.keys(grupos) as GrupoKey[]).map((key) => (
        <GrupoCard
          key={key}
          grupoKey={key}
          grupo={grupos[key]}
          total={total}
          activeFilter={activeFilter}
          onItemClick={handleItemClick}
        />
      ))}
    </div>
  );
}
