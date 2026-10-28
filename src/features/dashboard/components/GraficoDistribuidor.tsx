import React, { useCallback, useRef, useState } from "react";
import { Skeleton } from "@heroui/react";
import { ArrowRightUp } from "@solar-icons/react";

import { useGetEventosDashboardPorDistribuidorQuery } from "../services/mapApi";
import { useNeveraFilterContext } from "../contexts/NeveraFilterContext";
import { formatNumber } from "../hooks/useResumenNeveras";

interface GraficoDistribuidorProps {
    onDistribuidorClick?: (distribuidor: string) => void;
    onEstadoClick?: (estado: string) => void;
    onClearFilters?: () => void;
}

type EstadoKey = "fuera_de_zona" | "desconexion_de_energia";

interface Fila {
    nombre: string;
    zona: number;
    energia: number;
    total: number;
}

const ESTADOS: {
    key: EstadoKey;
    label: string;
    tabla: string;
    bar: string;
    text: string;
}[] = [
    {
        key: "fuera_de_zona",
        label: "Fuera de zona",
        tabla: "Fuera de Zona",
        bar: "bg-nx-err",
        text: "text-nx-err-ink",
    },
    {
        key: "desconexion_de_energia",
        label: "Desconexión de energía",
        tabla: "Desconexión por Energía",
        bar: "bg-nx-warn",
        text: "text-nx-warn-ink",
    },
];

const card =
    "rounded-[1.75rem] bg-nx-surface p-5";

/** Leyenda de colores; se muestra en el encabezado de la página */
export function AlertasLegend() {
    return (
        <div className="flex items-center gap-4 h-11 px-4 rounded-full bg-nx-surface text-sm text-nx-text-2">
            {ESTADOS.map((e) => (
                <span key={e.key} className="flex items-center gap-2">
                    <span className={`size-2.5 rounded-sm ${e.bar}`} />
                    {e.label}
                </span>
            ))}
        </div>
    );
}

const limpiarNombre = (nombre: string) => {
    if (nombre.trim().toLowerCase() === "friohielos") return "Friohielos";
    return nombre.replace(/^friohielos\s*/gi, "").trim();
};

const toFilas = (regionData: Record<string, any>): Fila[] =>
    Object.keys(regionData)
        .map((nombre) => {
            const zona = Number(regionData[nombre].fuera_de_zona) || 0;
            const energia = Number(regionData[nombre].desconexion_de_energia) || 0;
            return { nombre, zona, energia, total: zona + energia };
        })
        .sort((a, b) => b.total - a.total);

const sumar = (filas: Fila[]) => ({
    zona: filas.reduce((a, f) => a + f.zona, 0),
    energia: filas.reduce((a, f) => a + f.energia, 0),
});

function Num({ value, className }: { value: number; className: string }) {
    return (
        <span className={value === 0 ? "text-nx-text-3" : className}>
            {formatNumber(value)}
        </span>
    );
}

function Skeletons() {
    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-[1.75rem]" />
                ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-[1.75rem]" />
                ))}
            </div>
        </div>
    );
}

const GraficoDistribuidor: React.FC<GraficoDistribuidorProps> = ({
    onDistribuidorClick,
    onEstadoClick,
    onClearFilters,
}) => {
    const {
        setDistribuidorFilter,
        setEstadoFilter,
        distribuidorFilter,
        codNeveraFilter,
        imeiFilter,
        locacionFilter,
    } = useNeveraFilterContext();

    const { data, isLoading, error } = useGetEventosDashboardPorDistribuidorQuery({
        ...(distribuidorFilter && { distribuidor: distribuidorFilter }),
        ...(codNeveraFilter && { cod_nevera: codNeveraFilter }),
        ...(imeiFilter && { imei: imeiFilter }),
        ...(locacionFilter && { locacion: locacionFilter }),
    });

    const [activeBar, setActiveBar] = useState<{
        region: string;
        distribuidor: string;
        estado: string;
    } | null>(null);
    const [regionActiva, setRegionActiva] = useState<string | null>(null);
    const cardRefs = useRef<Record<string, HTMLElement | null>>({});

    const handleClearLocalFilter = useCallback(() => {
        setActiveBar(null);
        onClearFilters?.();
    }, [onClearFilters]);

    const handleSegmentClick = useCallback(
        (fila: Fila, estado: (typeof ESTADOS)[number], region: string) => {
            setActiveBar({
                region,
                distribuidor: fila.nombre,
                estado: estado.label,
            });
            setDistribuidorFilter(fila.nombre);
            onDistribuidorClick?.(fila.nombre);
            setEstadoFilter(estado.tabla);
            onEstadoClick?.(estado.tabla);
        },
        [setDistribuidorFilter, setEstadoFilter, onDistribuidorClick, onEstadoClick],
    );

    const handleNameClick = useCallback(
        (nombre: string) => {
            setDistribuidorFilter(nombre);
            onDistribuidorClick?.(nombre);
            setActiveBar(null);
        },
        [setDistribuidorFilter, onDistribuidorClick],
    );

    if (isLoading) return <Skeletons />;

    const regionesRaw = data?.data?.[0]?.regiones;
    if (error || !regionesRaw) {
        return (
            <div className={`${card} text-nx-err-ink bg-nx-err-soft`}>
                Error al cargar los datos de distribuidores
            </div>
        );
    }

    const regiones = Object.keys(regionesRaw)
        .map((nombre) => {
            const filas = toFilas(regionesRaw[nombre]);
            return { nombre, filas, ...sumar(filas) };
        })
        .sort((a, b) => b.filas.length - a.filas.length);

    const grande = regiones.length > 1 ? regiones[0] : null;
    const pequenas = (grande ? regiones.slice(1) : regiones).sort(
        (a, b) => b.filas.length - a.filas.length,
    );
    const filaSuperior = pequenas.slice(0, 3);
    const columnaIzquierda = pequenas.slice(3);

    const irARegion = (nombre: string) => {
        const next = regionActiva === nombre ? null : nombre;
        setRegionActiva(next);
        if (next)
            cardRefs.current[next]?.scrollIntoView({
                behavior: "smooth",
                block: "nearest",
            });
    };

    const renderFila = (
        fila: Fila,
        region: string,
        maxTotal: number,
        key: string,
    ) => {
        const ancho = maxTotal > 0 ? (fila.total / maxTotal) * 100 : 0;
        const selected = activeBar?.distribuidor === fila.nombre;
        const segmentos = [
            { estado: ESTADOS[0], value: fila.zona },
            { estado: ESTADOS[1], value: fila.energia },
        ];

        return (
            <li key={key} className="flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2 text-xs">
                    <button
                        type="button"
                        onClick={() => handleNameClick(fila.nombre)}
                        className={`truncate text-left font-medium hover:text-nx-purple ${
                            selected ? "text-nx-purple" : "text-nx-text"
                        }`}
                        title={`Filtrar por ${fila.nombre}`}
                    >
                        {limpiarNombre(fila.nombre)}
                    </button>
                    <span className="flex items-center gap-1.5 tabular-nums font-semibold shrink-0">
                        <Num value={fila.zona} className="text-nx-err-ink" />
                        <span className="text-nx-text-3">·</span>
                        <Num value={fila.energia} className="text-nx-warn-ink" />
                    </span>
                </div>
                <div className="h-2 w-full rounded-full bg-nx-surface-2 overflow-hidden">
                    <div className="flex h-full gap-[2px]" style={{ width: `${ancho}%` }}>
                        {segmentos
                            .filter((s) => s.value > 0)
                            .map((s) => (
                                <button
                                    key={s.estado.key}
                                    type="button"
                                    aria-label={`${s.estado.label}: ${s.value}`}
                                    title={`${s.estado.label}: ${s.value}`}
                                    onClick={() =>
                                        handleSegmentClick(fila, s.estado, region)
                                    }
                                    className={`h-full rounded-full min-w-[4px] cursor-pointer ${s.estado.bar} ${
                                        selected && activeBar?.estado !== s.estado.label
                                            ? "opacity-40"
                                            : ""
                                    }`}
                                    style={{ flexGrow: s.value, flexBasis: 0 }}
                                />
                            ))}
                    </div>
                </div>
            </li>
        );
    };

    const renderCardShell = (
        r: (typeof regiones)[number],
        children: React.ReactNode,
        className = "",
    ) => (
        <section
            key={r.nombre}
            ref={(el) => {
                cardRefs.current[r.nombre] = el;
            }}
            className={`${card} flex flex-col gap-4 min-h-0 overflow-hidden ${
                regionActiva === r.nombre ? "ring-2 ring-nx-purple/40" : ""
            } ${className}`}
        >
            <header className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-nx-text">{r.nombre}</h3>
                <div className="flex items-center gap-2">
                    {activeBar?.region === r.nombre && (
                        <button
                            type="button"
                            onClick={handleClearLocalFilter}
                            className="text-xs text-nx-purple hover:underline"
                        >
                            Limpiar filtro
                        </button>
                    )}
                    <span className="px-3 py-1 rounded-full bg-nx-surface-2 text-xs font-medium text-nx-text-2 tabular-nums">
                        {formatNumber(r.zona + r.energia)} neveras
                    </span>
                </div>
            </header>
            {children}
        </section>
    );

    const scrollList = "flex-1 min-h-0 overflow-y-auto pr-1";

    const renderRegionPequena = (r: (typeof regiones)[number], className = "") => {
        const max = Math.max(...r.filas.map((f) => f.total), 0);
        return renderCardShell(
            r,
            <ul className={`${scrollList} flex flex-col gap-3.5`}>
                {r.filas.map((f) => renderFila(f, r.nombre, max, f.nombre))}
            </ul>,
            className,
        );
    };

    const renderRegionGrande = (r: (typeof regiones)[number], className = "") => {
        const max = Math.max(...r.filas.map((f) => f.total), 0);
        const mitad = Math.ceil(r.filas.length / 2);
        const columnas = [r.filas.slice(0, mitad), r.filas.slice(mitad)];

        return renderCardShell(
            r,
            <div
                className={`${scrollList} grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3.5 content-start`}
            >
                {columnas.map((col, i) => (
                    <ul key={i} className="flex flex-col gap-3.5">
                        {col.map((f) => renderFila(f, r.nombre, max, f.nombre))}
                    </ul>
                ))}
            </div>,
            className,
        );
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                {regiones.map((r) => {
                    const active = regionActiva === r.nombre;
                    const total = r.zona + r.energia;
                    return (
                        <button
                            key={r.nombre}
                            type="button"
                            onClick={() => irARegion(r.nombre)}
                            className={`text-left rounded-[1.25rem] p-4 flex flex-col gap-1.5 transition-colors ${
                                active
                                    ? "bg-nx-gradient text-white"
                                    : "bg-nx-surface hover:ring-2 hover:ring-nx-purple/30"
                            }`}
                        >
                            <span
                                className={`flex items-center justify-between text-xs ${
                                    active ? "text-white/85" : "text-nx-text-3"
                                }`}
                            >
                                {r.nombre}
                                <ArrowRightUp size={14} />
                            </span>
                            <span className="flex items-baseline gap-1.5">
                                <span
                                    className={`text-2xl font-bold tabular-nums ${
                                        active ? "text-white" : "text-nx-text"
                                    }`}
                                >
                                    {formatNumber(total)}
                                </span>
                                <span
                                    className={`text-xs ${
                                        active ? "text-white/80" : "text-nx-text-3"
                                    }`}
                                >
                                    neveras
                                </span>
                            </span>
                            <span className="flex h-1.5 gap-[2px] mt-1">
                                {[
                                    { v: r.zona, c: active ? "bg-white" : "bg-nx-err" },
                                    {
                                        v: r.energia,
                                        c: active ? "bg-white/45" : "bg-nx-warn",
                                    },
                                ]
                                    .filter((s) => s.v > 0)
                                    .map((s, i) => (
                                        <span
                                            key={i}
                                            className={`h-full rounded-full ${s.c}`}
                                            style={{ flexGrow: s.v, flexBasis: 0 }}
                                        />
                                    ))}
                            </span>
                        </button>
                    );
                })}
            </div>

            {filaSuperior.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filaSuperior.map((r) => renderRegionPequena(r, "h-[26rem]"))}
                </div>
            )}

            {(columnaIzquierda.length > 0 || grande) && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 xl:h-[26rem]">
                    {columnaIzquierda.length > 0 && (
                        <div
                            className="grid gap-4 min-h-0"
                            style={{
                                gridTemplateRows: `repeat(${columnaIzquierda.length}, minmax(0, 1fr))`,
                            }}
                        >
                            {columnaIzquierda.map((r) =>
                                renderRegionPequena(r, "h-[22rem] xl:h-auto"),
                            )}
                        </div>
                    )}
                    {grande &&
                        renderRegionGrande(
                            grande,
                            `h-[26rem] xl:h-auto md:col-span-2 ${
                                columnaIzquierda.length > 0
                                    ? "xl:col-span-2"
                                    : "xl:col-span-3"
                            }`,
                        )}
                </div>
            )}
        </div>
    );
};

export default GraficoDistribuidor;
