import { useMemo } from "react";
import { Skeleton } from "@heroui/react";
import { Bell, Bolt, Radar, Target } from "@solar-icons/react";

import { useGetDashboardContadoresQuery } from "../../dashboard/services/mapApi";
import { useGetEventosDashboardPorDistribuidorQuery } from "../../dashboard/services/mapApi";
import { formatNumber } from "../../dashboard/hooks/useResumenNeveras";

const base = "rounded-[1.75rem] p-5 flex items-center gap-4";

export default function AlertsStatsRow() {
    const { data: contadores, isLoading } = useGetDashboardContadoresQuery({});
    const { data: eventos } = useGetEventosDashboardPorDistribuidorQuery({});

    const mayorFoco = useMemo(() => {
        const regiones = eventos?.data?.[0]?.regiones;
        if (!regiones) return null;
        let top: { nombre: string; total: number } | null = null;
        for (const region of Object.values(regiones)) {
            for (const [nombre, e] of Object.entries(region)) {
                const total =
                    (Number(e.fuera_de_zona) || 0) +
                    (Number(e.desconexion_de_energia) || 0);
                if (!top || total > top.total) top = { nombre, total };
            }
        }
        return top;
    }, [eventos]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-[1.75rem]" />
                ))}
            </div>
        );
    }

    const energia = contadores?.data?.desconexion_DE_ENERGIA ?? 0;
    const zona = contadores?.data?.fuera_DE_ZONA ?? 0;
    const total = energia + zona;
    const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

    const Bar = ({ value, color }: { value: number; color: string }) => (
        <span className="block h-1.5 w-full rounded-full bg-nx-surface-2 overflow-hidden">
            <span
                className={`block h-full rounded-full ${color}`}
                style={{ width: `${pct(value)}%` }}
            />
        </span>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className={`${base} bg-nx-ink-card text-white`}>
                <span className="size-12 shrink-0 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Bell size={22} />
                </span>
                <div className="flex flex-col leading-tight">
                    <span className="text-sm text-white/70">Total alertas</span>
                    <span className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tabular-nums">
                            {formatNumber(total)}
                        </span>
                        <span className="text-xs text-white/60">registros</span>
                    </span>
                </div>
            </div>

            <div className={`${base} bg-nx-surface`}>
                <span className="size-12 shrink-0 rounded-2xl bg-nx-warn-soft text-nx-warn-ink flex items-center justify-center">
                    <Bolt size={22} />
                </span>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <span className="text-sm text-nx-text-2">Desconexión por energía</span>
                    <span className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-nx-text tabular-nums">
                            {formatNumber(energia)}
                        </span>
                        <span className="text-xs text-nx-text-3">{pct(energia)}%</span>
                    </span>
                    <Bar value={energia} color="bg-nx-warn" />
                </div>
            </div>

            <div className={`${base} bg-nx-surface`}>
                <span className="size-12 shrink-0 rounded-2xl bg-nx-err-soft text-nx-err-ink flex items-center justify-center">
                    <Radar size={22} />
                </span>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <span className="text-sm text-nx-text-2">Fuera de zona</span>
                    <span className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-nx-text tabular-nums">
                            {formatNumber(zona)}
                        </span>
                        <span className="text-xs text-nx-text-3">{pct(zona)}%</span>
                    </span>
                    <Bar value={zona} color="bg-nx-err" />
                </div>
            </div>

            <div className={`${base} bg-nx-surface`}>
                <span className="size-12 shrink-0 rounded-2xl bg-nx-purple/10 text-nx-purple flex items-center justify-center">
                    <Target size={22} />
                </span>
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <span className="text-sm text-nx-text-2">Mayor foco</span>
                    {mayorFoco ? (
                        <>
                            <span className="flex items-baseline gap-2 min-w-0">
                                <span className="text-2xl font-bold text-nx-text truncate uppercase">
                                    {mayorFoco.nombre}
                                </span>
                                <span className="text-xs text-nx-text-3 shrink-0">
                                    {formatNumber(mayorFoco.total)} alertas
                                </span>
                            </span>
                            <span className="block h-1.5 w-full rounded-full bg-nx-surface-2 overflow-hidden">
                                <span
                                    className="block h-full rounded-full bg-nx-purple"
                                    style={{
                                        width: `${total ? Math.min(100, (mayorFoco.total / total) * 100) : 0}%`,
                                    }}
                                />
                            </span>
                        </>
                    ) : (
                        <span className="text-nx-text-3">—</span>
                    )}
                </div>
            </div>
        </div>
    );
}
