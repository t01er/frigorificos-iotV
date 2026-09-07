import { useState, useMemo, useCallback, useEffect } from "react";
import type { DateValue } from "@heroui/react";
import { addToast } from "@heroui/react";
import { CalendarDate } from "@internationalized/date";
import TableComponent, {
    type CustomColumnDef,
    type FilterFieldDef,
} from "../../../components/ux/TableComponent";
import { useGetAlertsHistoricalV2Query, useGetAlertsHistoricalCountV2Query } from "../services/alertsApi";
import type { AlertsHistorialFilters, AlertsItem } from "../services/alertsApi";
import { Chip } from "@heroui/react";
import { useTodayDate } from "../../../hooks/useTodayDate";
import { StreetsMapPoint } from "@solar-icons/react";
import MapModal from "../../dashboard/components/MapModal";
import DownloadButton from "../../../components/ux/DownloadButton";
import { DOWNLOAD_CONFIGS } from "../../../config/downloads";

const PAGE_SIZE_DEFAULT = 15;
const MAX_MONTHS_RANGE = 3;

const formatDateValue = (date: DateValue | null): string => {
    if (!date) return "";
    if ('year' in date && 'month' in date && 'day' in date) {
        return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    }
    return "";
};

const getMonthsDifference = (startDate: DateValue, endDate: DateValue): number => {
    const start = new Date(startDate.year, startDate.month - 1, startDate.day);
    const end = new Date(endDate.year, endDate.month - 1, endDate.day);

    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth();

    if (end.getDate() < start.getDate()) {
        months--;
    }

    return months;
};

interface HistorialAlertasTablaProps {
    onTotalChange?: (total: number) => void;
}

const getThreeMonthsAgo = (today: DateValue): DateValue => {
    let month = today.month - MAX_MONTHS_RANGE;
    let year = today.year;
    let day = today.day;

    if (month <= 0) {
        month += 12;
        year--;
    }

    const maxDay = new Date(year, month, 0).getDate();
    if (day > maxDay) {
        day = maxDay;
    }
    return new CalendarDate(year, month, day);
};

const hasActiveFilters = (filters: AlertsHistorialFilters): boolean => {
    const { _fecha_inicio, _fecha_fin, ...otherFilters } = filters;
    return Object.values(otherFilters).some(value => value && value.toString().trim() !== '');
};

export default function HistorialAlertasTabla({
    onTotalChange,
}: HistorialAlertasTablaProps) {
    const today = useTodayDate();
    const initialDateStr = formatDateValue(today);
    const threeMonthsAgo = getThreeMonthsAgo(today);

    const initialFilters: AlertsHistorialFilters = {
        _cliente: "",
        _cod_nevera: "",
        _distribuidor: "",
        _evento: "",
        _fecha_inicio: formatDateValue(threeMonthsAgo),
        _fecha_fin: initialDateStr,
        _imei: "",
        _locacion: "",
        _or: "desc",
        _order: "alert_dis_fechahora",
        _page: 1,
        _size: PAGE_SIZE_DEFAULT,
    };

    const [draftFilters, setDraftFilters] = useState<AlertsHistorialFilters>(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState<AlertsHistorialFilters>(initialFilters);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
    const [sortDescriptor, setSortDescriptor] = useState<{
        column: string;
        direction: "ascending" | "descending";
    }>({ column: "alert_dis_fechahora", direction: "descending" });

    const [startDate, setStartDate] = useState<DateValue | null>(threeMonthsAgo);
    const [endDate, setEndDate] = useState<DateValue | null>(today);

    const [selectedAlert, setSelectedAlert] = useState<AlertsItem | null>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    const handleOpenMap = useCallback((item: AlertsItem) => {
        setSelectedAlert(item);
        setIsMapModalOpen(true);
    }, []);

    const validateDateRange = useCallback((start: DateValue | null, end: DateValue | null): boolean => {
        if (!start || !end) return true;

        const monthsDiff = getMonthsDifference(start, end);

        if (monthsDiff > MAX_MONTHS_RANGE) {
            addToast({
                title: "Rango de fechas excedido",
                description: `No se puede seleccionar más de ${MAX_MONTHS_RANGE} meses. El rango actual es de ${monthsDiff} meses.`,
                color: "warning",
                timeout: 5000,
            });
            return false;
        }

        return true;
    }, []);

    const handleStartDateChange = useCallback((date: DateValue | null) => {
        if (date && endDate) {
            const start = new Date(date.year, date.month - 1, date.day);
            const end = new Date(endDate.year, endDate.month - 1, endDate.day);

            if (start > end) {
                addToast({
                    title: "Fechas inválidas",
                    description: "La fecha de inicio no puede ser mayor que la fecha final.",
                    color: "danger",
                    timeout: 4000,
                });
                return;
            }

            if (!validateDateRange(date, endDate)) {
                return;
            }
        }

        setStartDate(date);
        setDraftFilters((prev) => ({
            ...prev,
            _fecha_inicio: formatDateValue(date),
        }));
    }, [endDate, validateDateRange]);

    const handleEndDateChange = useCallback((date: DateValue | null) => {
        if (date && startDate) {
            const end = new Date(date.year, date.month - 1, date.day);
            const start = new Date(startDate.year, startDate.month - 1, startDate.day);

            if (end < start) {
                addToast({
                    title: "Fechas inválidas",
                    description: "La fecha final no puede ser menor que la fecha de inicio.",
                    color: "danger",
                    timeout: 4000,
                });
                return;
            }

            if (!validateDateRange(startDate, date)) {
                return;
            }
        }

        setEndDate(date);
        setDraftFilters((prev) => ({
            ...prev,
            _fecha_fin: formatDateValue(date),
        }));
    }, [startDate, validateDateRange]);

    const handleSearch = () => {
        if (startDate && endDate) {
            const monthsDiff = getMonthsDifference(startDate, endDate);
            if (monthsDiff > MAX_MONTHS_RANGE) {
                addToast({
                    title: "Rango de fechas excedido",
                    description: `El rango seleccionado es de ${monthsDiff} meses. El máximo permitido es de ${MAX_MONTHS_RANGE} meses.`,
                    color: "warning",
                    timeout: 5000,
                });
                return;
            }
        }

        setAppliedFilters(draftFilters);
        setPage(1);
    };

    const handleClearFilters = () => {
        setDraftFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setStartDate(threeMonthsAgo);
        setEndDate(today);
        setPage(1);
    };

    const countFilters: AlertsHistorialFilters = {
        _cliente: appliedFilters._cliente,
        _cod_nevera: appliedFilters._cod_nevera,
        _distribuidor: appliedFilters._distribuidor,
        _evento: appliedFilters._evento,
        _fecha_inicio: hasActiveFilters(appliedFilters) ? "" : appliedFilters._fecha_inicio,
        _fecha_fin: hasActiveFilters(appliedFilters) ? "" : appliedFilters._fecha_fin,
        _imei: appliedFilters._imei,
        _locacion: appliedFilters._locacion,
    };

    const queryFilters: AlertsHistorialFilters = {
        _cliente: appliedFilters._cliente,
        _cod_nevera: appliedFilters._cod_nevera,
        _distribuidor: appliedFilters._distribuidor,
        _evento: appliedFilters._evento,
        _fecha_inicio: hasActiveFilters(appliedFilters) ? "" : appliedFilters._fecha_inicio,
        _fecha_fin: hasActiveFilters(appliedFilters) ? "" : appliedFilters._fecha_fin,
        _imei: appliedFilters._imei,
        _locacion: appliedFilters._locacion,
        _or: sortDescriptor.direction === "ascending" ? "asc" : "desc",
        _order: sortDescriptor.column,
        _page: page,
        _size: pageSize,
    };

    const { data, isLoading, isFetching } = useGetAlertsHistoricalV2Query(queryFilters);
    const { data: countData, isLoading: isCountLoading } = useGetAlertsHistoricalCountV2Query(countFilters);

    const alerts = data?.data ?? [];
    const totalRegistros = countData?.total_records ?? 0;

    useEffect(() => {
        onTotalChange?.(totalRegistros);
    }, [totalRegistros, onTotalChange]);

    const columns: CustomColumnDef<AlertsItem>[] = useMemo(
        () => [
            { key: "alert_dis_cod_nevera", label: "Cod. Nevera", width: 130, sortable: false },
            { key: "alert_dis_imei", label: "IMEI", width: 130, sortable: false },
            { key: "alert_dis_distribuidor", label: "Distribuidor", width: 130, sortable: false },
            { key: "alert_dis_fechahora", label: "Fecha Evento", width: 130, sortable: true },
            {
                key: "alert_evento",
                label: "Evento",
                sortable: false,
                width: 130,
                align: "center",
                render: (item) => {
                    const estado = item.alert_evento?.toLowerCase();
                    const map: Record<string, "secondary" | "danger" | "warning" | "default"> = {
                        "desconexión por energía": "warning",
                        "detenido fuera de zona": "danger",
                        "movimiento fuera de zona": "secondary",
                    };
                    return (
                        <Chip size="sm" variant="light" color={map[estado] ?? "default"}>
                            {item.alert_evento}
                        </Chip>
                    );
                },
            },

            { key: "alert_loc_nom", label: "Locación", width: 130, sortable: false },
            {
                key: "alert_dis_bateria",
                label: "Batería",
                width: 140,
                sortable: false,
                render: (item) => {
                    const value = item.alert_dis_bateria ?? "";
                    const pct = Number(value.replace("%", "").trim());
                    if (Number.isNaN(pct)) return <span className="text-xs text-slate-500">{value}</span>;
                    const color = pct > 50 ? "bg-green-500" : pct > 20 ? "bg-amber-500" : "bg-red-500";
                    return (
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-slate-500">{pct}%</span>
                        </div>
                    );
                },
            },
            {
                key: "alert_dis_energia",
                label: "Energía",
                width: 100,
                align: "start",
                sortable: false,
                render: (item) => (
                    <div className="flex items-center gap-1">
                        {item.alert_dis_energia === "Conectado" ? (
                            <span className="flex items-center gap-1 text-green-600">
                                <span>ON</span>
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-slate-400">
                                <span>OFF</span>
                            </span>
                        )}
                    </div>
                ),
            },
            {
                key: "ubicacion",
                label: "Ubicación",
                sortable: false,
                width: 200,
                render: (item) => {
                    const lat = item.alert_dis_lat;
                    const lon = item.alert_dis_lon;
                    const hasCoords = lat && lon;

                    return (
                        <button
                            type="button"
                            onClick={() => handleOpenMap(item)}
                            className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors font-medium text-xs hover:underline group"
                            title="Ver ubicación en el mapa"
                        >
                            <StreetsMapPoint className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform shrink-0" />
                            <span>
                                {hasCoords ? `${lat}, ${lon}` : "Ver en mapa"}
                            </span>
                        </button>
                    );
                },
            },
            { key: "alert_dis_signal", label: "Señal", width: 130, sortable: false },
            { key: "alert_dis_satelite", label: "Satélite", width: 130, sortable: false },
            { key: "alert_dis_cliente", label: "Cliente", width: 130, sortable: false },
        ],
        []
    );

    const filters: FilterFieldDef[] = [
        { key: "_cod_nevera", type: "text", placeholder: "Cod Nevera" },
        { key: "_cliente", type: "text", placeholder: "Cliente" },
        { key: "_distribuidor", type: "text", placeholder: "Distribuidor" },
        { key: "_evento", type: "text", placeholder: "Evento" },
        { key: "_fecha_inicio", type: "startDate", placeholder: "Fecha Inicio" },
        { key: "_fecha_fin", type: "endDate", placeholder: "Fecha Fin" },
        { key: "_imei", type: "text", placeholder: "IMEI" },
        { key: "_locacion", type: "text", placeholder: "Locación" },
    ];

    const alertsWithUniqueId = useMemo(() => {
        return alerts.map((alert, index) => ({
            ...alert,
            _uniqueId: `${alert.alert_dis_cod_nevera}_${alert.alert_dis_fechahora}_${alert.alert_evento}_${index}`,
        }));
    }, [alerts]);

    const getFechaInicio = useCallback(() => {
        return startDate ? formatDateValue(startDate) : formatDateValue(threeMonthsAgo);
    }, [startDate]);

    const getFechaFin = useCallback(() => {
        return endDate ? formatDateValue(endDate) : formatDateValue(today);
    }, [endDate]);

    const getDownloadBody = useCallback(() => {
        // Para la descarga, también excluimos fechas si hay otros filtros activos
        const hasFilters = hasActiveFilters(appliedFilters);
        return {
            _cod_nevera: appliedFilters._cod_nevera || "",
            _distribuidor: appliedFilters._distribuidor || "",
            _evento: appliedFilters._evento || "",
            _fecha_inicio: hasFilters ? "" : (appliedFilters._fecha_inicio || getFechaInicio()),
            _fecha_fin: hasFilters ? "" : (appliedFilters._fecha_fin || getFechaFin()),
            _imei: appliedFilters._imei || "",
            _locacion: appliedFilters._locacion || "",
            _cliente: appliedFilters._cliente || "",
            _or: sortDescriptor.direction === "ascending" ? "asc" : "desc",
            _order: sortDescriptor.column,
            _size: 20,
            _page: 1,
        };
    }, [appliedFilters, getFechaInicio, getFechaFin, sortDescriptor]);

    return (
        <div>
            <TableComponent
                data={alertsWithUniqueId}
                columns={columns}
                idField="_uniqueId"
                filters={filters}
                filterValues={draftFilters as Record<string, string>}
                onFilterChange={(key, value) => {
                    if (key === "_fecha_inicio" || key === "_fecha_fin") return;
                    setDraftFilters((prev) => ({ ...prev, [key]: value }));
                }}
                showSearchButton={true}
                onSearch={handleSearch}
                onClearFilters={handleClearFilters}
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
                headerActions={
                    <div className="flex items-center gap-2">
                        <DownloadButton
                            url={DOWNLOAD_CONFIGS.alertasHistorial.url}
                            label=""
                            isIconOnly={true}
                            tooltip="Descargar Historial de Alertas (ZIP)"
                            color="primary"
                            method="POST"
                            body={getDownloadBody()}
                            fileName={`Alertas_Historial_${getFechaInicio()}_al_${getFechaFin()}.zip`}
                            rolesPermitidos={["adminnestle", "usuarionestle2", "adminentel"]}
                            showConfirmDialog={true}
                            confirmMessage={
                                "Esta operación generará un archivo comprimido (.zip) y puede tardar aproximadamente 10 minutos debido al volumen de datos.\n\n¿Está seguro de proceder?"
                            }
                            onDownloadStart={() => console.log("Iniciando descarga...")}
                            onDownloadComplete={() => console.log("Descarga completada")}
                            onError={(error) => console.error("Error en descarga:", error)}
                        />
                    </div>
                }
                isLoading={isLoading || isFetching || isCountLoading}
                startDateValue={startDate}
                onStartDateChange={handleStartDateChange}
                endDateValue={endDate}
                onEndDateChange={handleEndDateChange}
            />

            <MapModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                nevera={
                    selectedAlert
                        ? {
                            cod_nevera: selectedAlert.alert_dis_cod_nevera,
                            imei: selectedAlert.alert_dis_imei,
                            latitud: selectedAlert.alert_dis_lat,
                            longitud: selectedAlert.alert_dis_lon,
                        }
                        : null
                }
            />
        </div>
    );
}