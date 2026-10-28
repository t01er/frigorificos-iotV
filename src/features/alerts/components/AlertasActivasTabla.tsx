import { useState, useMemo, useCallback, useEffect } from "react";
import TableComponent, {
    type CustomColumnDef,
    type FilterFieldDef,
} from "../../../components/ux/TableComponent";
import { useGetAlertsHistoricalQuery, useGetAlertsHistoricalCountQuery } from "../services/alertsApi";
import type { AlertsFilters, AlertsItem } from "../services/alertsApi";
import type { DateValue } from "@heroui/react";
import MapModal from "../../dashboard/components/MapModal";
import {
    Buildings,
    Bell,
    Calendar,
    Hashtag,
    MapPoint,
    Delivery,
    Magnifier,
} from "@solar-icons/react";
import { BatteryCell } from "../../dashboard/components/NeveraCells";
import { EventoChip, SatelitesCell, SenialCell } from "./AlertCells";
import { formatFechaHora } from "../../../utils/fecha";

const PAGE_SIZE_DEFAULT = 15;
const POLLING_MS = 30000;

const formatDate = (date: DateValue | null) => {
    if (!date) return "";
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
};

interface AlertsTablaProps {
    /** Se llama con la marca de tiempo de cada actualización de datos */
    onLastUpdate?: (timestamp: number) => void;
}

export default function AlertsTabla({ onLastUpdate }: AlertsTablaProps) {
    const [selectedAlert, setSelectedAlert] = useState<AlertsItem | null>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    const handleOpenMap = useCallback((item: AlertsItem) => {
        setSelectedAlert(item);
        setIsMapModalOpen(true);
    }, []);

    const initialFilters: AlertsFilters = {
        _cliente: "",
        _cod_nevera: "",
        _distribuidor: "",
        _evento: "",
        _fecha_hora: "",
        _imei: "",
        _locacion: "",
        _or: "desc",
        _order: "dis_ult_conex",
        _page: 1,
        _size: PAGE_SIZE_DEFAULT,
    };

    const [draftFilters, setDraftFilters] = useState<AlertsFilters>(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState<AlertsFilters>(initialFilters);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
    const [dateValue, setDateValue] = useState<DateValue | null>(null);

    const [sortDescriptor, setSortDescriptor] = useState<{
        column: string;
        direction: "ascending" | "descending";
    }>({ column: "dis_ult_conex", direction: "descending" });

    // Construir los filtros para el conteo
    const countFilters: AlertsFilters = {
        _cliente: appliedFilters._cliente,
        _cod_nevera: appliedFilters._cod_nevera,
        _distribuidor: appliedFilters._distribuidor,
        _evento: appliedFilters._evento,
        _fecha_hora: appliedFilters._fecha_hora,
        _imei: appliedFilters._imei,
        _locacion: appliedFilters._locacion,
    };

    // Construir los filtros para la consulta principal
    const queryFilters: AlertsFilters = {
        _cliente: appliedFilters._cliente,
        _cod_nevera: appliedFilters._cod_nevera,
        _distribuidor: appliedFilters._distribuidor,
        _evento: appliedFilters._evento,
        _fecha_hora: appliedFilters._fecha_hora,
        _imei: appliedFilters._imei,
        _locacion: appliedFilters._locacion,
        _or: sortDescriptor.direction === "ascending" ? "asc" : "desc",
        _order: sortDescriptor.column,
        _page: page,
        _size: pageSize,
    };

    const { data, currentData, isError, fulfilledTimeStamp } =
        useGetAlertsHistoricalQuery(queryFilters, { pollingInterval: POLLING_MS });
    const { data: countData, isLoading: isCountLoading } = useGetAlertsHistoricalCountQuery(countFilters);

    useEffect(() => {
        if (fulfilledTimeStamp) onLastUpdate?.(fulfilledTimeStamp);
    }, [fulfilledTimeStamp, onLastUpdate]);

    // Con el sondeo en segundo plano se siguen mostrando los datos anteriores,
    // sin loader; solo se muestra al cargar por primera vez o al cambiar filtros/página.
    const alerts = data?.data ?? [];
    const totalRegistros = countData?.total_records ?? 0;

    const handleSearch = () => {
        setAppliedFilters(draftFilters);
        setPage(1);
    };

    const handleDateChange = useCallback((date: DateValue | null) => {
        setDateValue(date);
        const formatted = formatDate(date);
        setDraftFilters((prev) => ({ ...prev, _fecha_hora: formatted }));
    }, []);

    const handleClearFilters = () => {
        setDraftFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setDateValue(null);
        setPage(1);
    };

    const columns: CustomColumnDef<AlertsItem>[] = useMemo(
        () => [
            {
                key: "alert_dis_cod_nevera",
                label: "Cód. nevera",
                width: 130,
                sortable: false,
                render: (item) => (
                    <span className="font-bold text-nx-text">{item.alert_dis_cod_nevera}</span>
                ),
            },
            { key: "alert_dis_distribuidor", label: "Distribuidor", width: 150, sortable: false },
            {
                key: "alert_dis_fechahora",
                label: "Fecha evento",
                width: 200,
                sortable: true,
                render: (item) => {
                    const f = formatFechaHora(item.alert_dis_fechahora);
                    if (!f) return <span>{item.alert_dis_fechahora}</span>;
                    return (
                        <span>
                            {f.fecha}{" "}
                            <span className="text-nx-text-3 text-xs tabular-nums">{f.hora}</span>
                        </span>
                    );
                },
            },
            {
                key: "alert_evento",
                label: "Evento",
                width: 170,
                sortable: false,
                render: (item) => <EventoChip evento={item.alert_evento} />,
            },
            { key: "alert_loc_nom", label: "Locación", width: 140, sortable: false },
            {
                key: "alert_dis_bateria",
                sortable: false,
                label: "Batería",
                width: 140,
                render: (item) => <BatteryCell value={item.alert_dis_bateria} />,
            },
            {
                key: "ubicacion",
                label: "Ubicación",
                sortable: false,
                width: 200,
                render: (item) => {
                    const lat = item.alert_dis_lat;
                    const lon = item.alert_dis_lon;

                    return (
                        <button
                            type="button"
                            onClick={() => handleOpenMap(item)}
                            className="inline-flex items-center gap-1.5 text-nx-blue hover:underline text-xs"
                            title="Ver ubicación en el mapa"
                        >
                            <MapPoint size={14} className="shrink-0" />
                            <span className="font-mono">
                                {lat && lon ? `${lat}, ${lon}` : "Ver en mapa"}
                            </span>
                        </button>
                    );
                },
            },
            {
                key: "alert_dis_signal",
                label: "Señal",
                width: 90,
                sortable: false,
                render: (item) => <SenialCell value={item.alert_dis_signal} />,
            },
            {
                key: "alert_dis_satelite",
                label: "Satélites",
                width: 100,
                sortable: false,
                render: (item) => <SatelitesCell value={item.alert_dis_satelite} />,
            },
            { key: "alert_movimiento", label: "Movimiento", width: 120, sortable: false },
            {
                key: "alert_dis_cliente",
                label: "Cliente",
                width: 110,
                sortable: false,
                render: (item) => (
                    <span className="text-nx-text-3 tabular-nums">{item.alert_dis_cliente}</span>
                ),
            },
        ],
        [handleOpenMap]
    );

    const filters: FilterFieldDef[] = [
        { key: "_cod_nevera", type: "text", placeholder: "Cód. nevera", icon: <Magnifier size={15} /> },
        { key: "_cliente", type: "text", placeholder: "Cliente", icon: <Buildings size={15} /> },
        { key: "_distribuidor", type: "text", placeholder: "Distribuidor", icon: <Delivery size={15} /> },
        { key: "_evento", type: "text", placeholder: "Evento", icon: <Bell size={15} /> },
        { key: "_fecha", type: "date", placeholder: "Fecha", icon: <Calendar size={15} /> },
        { key: "_imei", type: "text", placeholder: "IMEI", icon: <Hashtag size={15} /> },
        { key: "_locacion", type: "text", placeholder: "Locación", icon: <MapPoint size={15} /> },
    ];

    const alertsWithUniqueId = useMemo(() => {
        return alerts.map((alert, index) => ({
            ...alert,
            _uniqueId: `${alert.alert_dis_cod_nevera}_${alert.alert_dis_fechahora}_${alert.alert_evento}_${index}`,
        }));
    }, [alerts]);

    return (
        <div>
            <TableComponent
                data={alertsWithUniqueId}
                columns={columns}
                idField="_uniqueId"
                itemLabel="alertas"
                filters={filters}
                fillFilters
                clearIconOnly
                filterValues={draftFilters as Record<string, string>}
                onFilterChange={(key, value) => {
                    if (key === "_fecha") return;
                    setDraftFilters((prev) => ({ ...prev, [key]: value }));
                }}
                onClearFilters={handleClearFilters}
                showSearchButton={true}
                onSearch={handleSearch}
                sortDescriptor={sortDescriptor}
                onSortChange={(d) => {
                    setSortDescriptor(d);
                    setPage(1);
                }}
                page={page}
                pageSize={pageSize}
                totalRegistros={totalRegistros}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                }}
                dateValue={dateValue}
                onDateChange={handleDateChange}
                isLoading={(!currentData && !isError) || isCountLoading}
            />

            <MapModal
                isOpen={isMapModalOpen}
                onClose={() => {
                    setIsMapModalOpen(false);
                    setSelectedAlert(null);
                }}
                nevera={
                    selectedAlert
                        ? {
                            cod_nevera: selectedAlert.alert_dis_cod_nevera,
                            imei: selectedAlert.alert_dis_imei,
                            latitud: selectedAlert.alert_dis_lat,
                            longitud: selectedAlert.alert_dis_lon,
                            alert_evento: selectedAlert.alert_evento
                        }
                        : null
                }
            />
        </div>
    );
}
