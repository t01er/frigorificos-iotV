import React, { useCallback, useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts";
import { useGetEventosDashboardPorDistribuidorQuery } from "../services/mapApi";
import { useNeveraFilterContext } from "../contexts/NeveraFilterContext";
import { Card, CardBody } from "@heroui/react";
import { Skeleton } from "@heroui/react";

interface GraficoDistribuidorProps {
    onDistribuidorClick?: (distribuidor: string) => void;
    onEstadoClick?: (estado: string) => void;
    onClearFilters?: () => void;
}

const ESTADO_COLORS: Record<string, string> = {
    "Fuera de Zona": "#F28B00",
    "Desconexión de Energía": "#fede4c",
};

const ESTADOS_PERMITIDOS = [
    "fuera_de_zona",
    "desconexion_de_energia",
];

const ESTADO_LABELS: Record<string, string> = {
    fuera_de_zona: "Fuera de Zona",
    desconexion_de_energia: "Desconexión de Energía",
};

const ESTADO_MAPEO_TABLA: Record<string, string> = {
    "Fuera de Zona": "Fuera de Zona",
    "Desconexión de Energía": "Desconexión por Energía",
};

const MAX_ITEMS_POR_COLUMNA = 8;

interface TooltipPayloadItem {
    dataKey: string;
    value: number;
    name: string;
    color: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-lg p-3 z-50">
            <p className="font-bold text-gray-800 mb-2">{label}</p>
            <div className="space-y-1">
                {payload.map((item: TooltipPayloadItem, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-600">{item.name}:</span>
                        <span className="text-sm font-bold">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const GlobalLegend = () => {
    const legendItems = [
        {
            label: "Fuera de Zona",
            color: ESTADO_COLORS["Fuera de Zona"],
        },
        {
            label: "Desconexión de Energía",
            color: ESTADO_COLORS["Desconexión de Energía"],
        },
    ];

    return (
        <div className="flex flex-wrap justify-center gap-6 mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {legendItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
};

function TarjetaPequenaSkeleton() {
    return (
        <Card shadow="none" className="bg-white h-full min-h-100">
            <CardBody className="flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="rounded-lg w-24 h-7" />
                        <Skeleton className="rounded-full w-14 h-6" />
                    </div>
                </div>
                <div className="grow flex flex-col gap-2">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="rounded-lg w-full h-8" />
                    ))}
                </div>
            </CardBody>
        </Card>
    );
}

function TarjetaGrandeSkeleton() {
    return (
        <div className="col-span-1 md:col-span-2 xl:col-span-3 h-full">
            <Card shadow="none" className="bg-white h-full">
                <CardBody className="flex flex-col justify-between h-full gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
                        <div className="flex items-center gap-3">
                            <Skeleton className="rounded-lg w-32 h-8" />
                            <Skeleton className="rounded-full w-24 h-6" />
                        </div>
                        <Skeleton className="rounded-full w-20 h-6" />
                    </div>
                    <div className="flex flex-row gap-4 overflow-x-auto pb-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="shrink-0" style={{ width: "400px", minWidth: "380px" }}>
                                <div className="flex flex-col gap-2">
                                    {[...Array(9)].map((_, j) => (
                                        <Skeleton key={j} className="rounded-lg w-full h-7" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
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

    const queryParams = {
        ...(distribuidorFilter && { distribuidor: distribuidorFilter }),
        ...(codNeveraFilter && { cod_nevera: codNeveraFilter }),
        ...(imeiFilter && { imei: imeiFilter }),
        ...(locacionFilter && { locacion: locacionFilter }),
    };
    const { data, isLoading, error } = useGetEventosDashboardPorDistribuidorQuery(queryParams);
    const [activeBar, setActiveBar] = useState<{
        region: string;
        distribuidor: string;
        estado: string;
    } | null>(null);

    const processDataForChart = (regionData: Record<string, any>) => {
        const distribuidores = Object.keys(regionData);

        const distribuidoresOrdenados = distribuidores
            .map((dist) => {
                const total = ESTADOS_PERMITIDOS.reduce(
                    (acc, estado) => acc + (Number(regionData[dist][estado]) || 0),
                    0
                );
                return { name: dist, total };
            })
            .sort((a, b) => b.total - a.total)
            .map((d) => d.name);

        return distribuidoresOrdenados.map((dist) => {
            const item: any = { distribuidor: dist };

            ESTADOS_PERMITIDOS.forEach((estado) => {
                const label = ESTADO_LABELS[estado];
                item[label] = Number(regionData[dist][estado]) || 0;
            });

            return item;
        });
    };

    const handleClearLocalFilter = useCallback(() => {
        setActiveBar(null);
        onClearFilters?.();
    }, [onClearFilters]);

    const dividirEnColumnas = (data: any[]) => {
        if (data.length <= MAX_ITEMS_POR_COLUMNA) {
            return [data];
        }

        const columnas = [];
        const itemsPorColumna = Math.ceil(data.length / 3);

        for (let i = 0; i < 3; i++) {
            const inicio = i * itemsPorColumna;
            const fin = Math.min(inicio + itemsPorColumna, data.length);
            const columna = data.slice(inicio, fin);

            if (columna.length > 0) {
                columnas.push(columna);
            }
        }

        return columnas;
    };

    const handleBarClick = useCallback(
        (data: any, estadoKey: string, region: string) => {
            if (!data || !data.distribuidor) return;

            const distribuidor = data.distribuidor;
            const estadoLabel = estadoKey;

            setActiveBar({
                region,
                distribuidor,
                estado: estadoLabel,
            });

            setDistribuidorFilter(distribuidor);
            onDistribuidorClick?.(distribuidor);

            const estadoMapeado = ESTADO_MAPEO_TABLA[estadoLabel] || estadoLabel;
            setEstadoFilter(estadoMapeado);
            onEstadoClick?.(estadoMapeado);
        },
        [setDistribuidorFilter, setEstadoFilter, onDistribuidorClick, onEstadoClick]
    );

    const handleDistribuidorLabelClick = useCallback(
        (distribuidor: string) => {
            setDistribuidorFilter(distribuidor);
            onDistribuidorClick?.(distribuidor);
            setActiveBar(null);
        },
        [setDistribuidorFilter, onDistribuidorClick]
    );

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 py-4 animate-pulse">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                    {[...Array(4)].map((_, i) => (
                        <TarjetaPequenaSkeleton key={i} />
                    ))}
                    <TarjetaGrandeSkeleton />
                </div>
            </div>
        );
    }

    if (error || !data?.data?.[0]?.regiones) {
        return (
            <Card className="bg-red-50">
                <CardBody>
                    <p className="text-red-600">Error al cargar los datos de distribuidores</p>
                </CardBody>
            </Card>
        );
    }

    const regiones = Object.keys(data.data[0].regiones);

    const regionesOrdenadas = regiones.sort((a, b) => {
        const countA = Object.keys(data.data[0].regiones[a]).length;
        const countB = Object.keys(data.data[0].regiones[b]).length;
        return countA - countB;
    });

    const regionesPequenas = regionesOrdenadas.slice(0, -1);
    const regionGrande = regionesOrdenadas[regionesOrdenadas.length - 1];

    return (
        <div className="flex flex-col gap-6">
            <GlobalLegend />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
                {regionesPequenas.map((region) => {
                    const regionData = data.data[0].regiones[region];
                    if (!regionData) return null;

                    const chartData = processDataForChart(regionData);

                    const totalNeveras = chartData.reduce((acc, item) => {
                        const sumaDistribuidor = ESTADOS_PERMITIDOS.reduce((sum, estado) => {
                            const label = ESTADO_LABELS[estado];
                            return sum + (Number(item[label]) || 0);
                        }, 0);
                        return acc + sumaDistribuidor;
                    }, 0);

                    const distribuidoresCount = Object.keys(regionData).length;
                    const chartHeight = Math.max(250, distribuidoresCount * 40);

                    return (
                        <Card
                            key={region}
                            shadow="none"
                            className="bg-white h-full min-h-100"
                        >
                            <CardBody className="flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-gray-800">{region}</h3>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                                            {totalNeveras} neveras
                                        </span>
                                    </div>

                                    {activeBar?.region === region && (
                                        <div className="mb-3 p-2 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center justify-between">
                                            <span>
                                                Filtrando: <strong>{activeBar.distribuidor}, {activeBar.estado}</strong>
                                            </span>
                                            <button
                                                onClick={handleClearLocalFilter}
                                                className="text-blue-500 hover:text-blue-700 underline text-xs"
                                            >
                                                Limpiar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="grow">
                                    <ResponsiveContainer width="100%" height={chartHeight}>
                                        <BarChart
                                            data={chartData}
                                            layout="vertical"
                                            margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
                                            barSize={16}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} />
                                            <YAxis
                                                type="category"
                                                dataKey="distribuidor"
                                                tick={{ fontSize: 10, fontWeight: 600 }}
                                                tickLine={false}
                                                axisLine={false}
                                                width={50}
                                                onClick={(data: any) => {
                                                    if (data?.value) handleDistribuidorLabelClick(data.value);
                                                }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />

                                            {ESTADOS_PERMITIDOS.map((estado) => {
                                                const label = ESTADO_LABELS[estado];
                                                return (
                                                    <Bar
                                                        key={estado}
                                                        dataKey={label}
                                                        stackId="a"
                                                        fill={ESTADO_COLORS[label]}
                                                        onClick={(data: any) => handleBarClick(data, label, region)}
                                                        cursor="pointer"
                                                        radius={[0, 4, 4, 0]}
                                                    >
                                                        <LabelList
                                                            dataKey={label}
                                                            position="insideRight"
                                                            style={{ fill: "#fff", fontSize: 9, fontWeight: "bold" }}
                                                        />
                                                    </Bar>
                                                );
                                            })}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardBody>
                        </Card>
                    );
                })}

                {regionGrande && (() => {
                    const regionData = data.data[0].regiones[regionGrande];
                    const chartData = processDataForChart(regionData);

                    const totalNeveras = chartData.reduce((acc, item) => {
                        const sumaDistribuidor = ESTADOS_PERMITIDOS.reduce((sum, estado) => {
                            const label = ESTADO_LABELS[estado];
                            return sum + (Number(item[label]) || 0);
                        }, 0);
                        return acc + sumaDistribuidor;
                    }, 0);

                    const columnas = dividirEnColumnas(chartData);
                    const tieneMultiplesColumnas = columnas.length > 1;

                    const getColumnHeight = (data: any[]) => {
                        return Math.max(220, data.length * 30);
                    };

                    const limpiarNombre = (nombre: string) => {
                        if (nombre.trim().toLowerCase() === "friohielos") {
                            return "FRIO HIELOS";
                        }
                        return nombre.replace(/^friohielos\s*/gi, "").trim();
                    };
                    return (
                        <div className="col-span-1 md:col-span-2 xl:col-span-3 h-full">
                            <Card shadow="none" className="bg-white h-full">
                                <CardBody className="flex flex-col justify-start h-full gap-10">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-xl font-bold text-gray-800">
                                                {regionGrande}
                                            </h3>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                                                {totalNeveras} neveras
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {activeBar?.region === regionGrande && (
                                                <div className="px-2.5 py-1 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-center gap-2">
                                                    <span>Filtrando: <strong>{limpiarNombre(activeBar.distribuidor)}</strong></span>
                                                    <button
                                                        onClick={handleClearLocalFilter}
                                                        className="text-blue-500 hover:text-blue-700 underline font-semibold"
                                                    >
                                                        Limpiar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className={`flex ${tieneMultiplesColumnas
                                            ? "flex-row gap-1 overflow-x-auto pb-2"
                                            : "flex-col"
                                            }`}
                                    >
                                        {columnas.map((columna, colIndex) => (
                                            <div
                                                key={colIndex}
                                                className={tieneMultiplesColumnas ? "shrink-0" : ""}
                                                style={{
                                                    width: tieneMultiplesColumnas ? "400px" : "100%",
                                                    minWidth: tieneMultiplesColumnas ? "380px" : "auto",
                                                }}
                                            >
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height={getColumnHeight(columna)}
                                                >
                                                    <BarChart
                                                        data={columna}
                                                        layout="vertical"
                                                        margin={{ top: 5, right: 15, left: 40, bottom: 5 }}
                                                        barSize={20}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                        <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} />
                                                        <YAxis
                                                            type="category"
                                                            dataKey="distribuidor"
                                                            tickFormatter={limpiarNombre}
                                                            tick={{
                                                                fontSize: 9,
                                                                fontWeight: 600,
                                                            }}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            width={65}
                                                            onClick={(data: any) => {
                                                                if (data?.value) handleDistribuidorLabelClick(data.value);
                                                            }}
                                                        />
                                                        <Tooltip content={<CustomTooltip />} />

                                                        {ESTADOS_PERMITIDOS.map((estado) => {
                                                            const label = ESTADO_LABELS[estado];
                                                            return (
                                                                <Bar
                                                                    key={estado}
                                                                    dataKey={label}
                                                                    stackId="a"
                                                                    fill={ESTADO_COLORS[label]}
                                                                    onClick={(data: any) =>
                                                                        handleBarClick(data, label, regionGrande)
                                                                    }
                                                                    cursor="pointer"
                                                                    radius={[0, 4, 4, 0]}
                                                                >
                                                                    <LabelList
                                                                        dataKey={label}
                                                                        position="insideRight"
                                                                        style={{ fill: "#fff", fontSize: 8, fontWeight: "bold" }}
                                                                    />
                                                                </Bar>
                                                            );
                                                        })}
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ))}
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    );
                })()}
            </div>
        </div>
    );
};

export default GraficoDistribuidor;