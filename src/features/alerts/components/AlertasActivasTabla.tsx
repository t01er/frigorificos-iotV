import { useState, useMemo, useCallback } from "react";
import TableComponent, {
    type CustomColumnDef,
    type FilterFieldDef,
} from "../../../components/ux/TableComponent";
import { useGetAlertsHistoricalQuery, useGetAlertsHistoricalCountQuery } from "../services/alertsApi";
import type { AlertsFilters, AlertsItem } from "../services/alertsApi";
import { Chip, type DateValue } from "@heroui/react";
import { useTodayDate } from "../../../hooks/useTodayDate";
import MapModal from "../../dashboard/components/MapModal";
import { StreetsMapPoint } from "@solar-icons/react";
import DownloadButton from "../../../components/ux/DownloadButton";
import { DOWNLOAD_CONFIGS } from "../../../config/downloads";


const PAGE_SIZE_DEFAULT = 15;

const formatDate = (date: DateValue | null) => {
    if (!date) return "";
    return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
};

export default function AlertsTabla() {
    const today = useTodayDate();
    const initialDateStr = formatDate(today);

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
        _fecha_hora: initialDateStr,
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
    const [dateValue, setDateValue] = useState<DateValue | null>(today);

    const [sortDescriptor, setSortDescriptor] = useState<{
        column: string;
        direction: "ascending" | "descending";
    }>({ column: "dis_ult_conex", direction: "descending" });

    const countFilters: AlertsFilters = {
        _cliente: appliedFilters._cliente,
        _cod_nevera: appliedFilters._cod_nevera,
        _distribuidor: appliedFilters._distribuidor,
        _evento: appliedFilters._evento,
        _fecha_hora: appliedFilters._fecha_hora,
        _imei: appliedFilters._imei,
        _locacion: appliedFilters._locacion,
    };

    const queryFilters: AlertsFilters = {
        ...countFilters,
        _or: sortDescriptor.direction === "ascending" ? "asc" : "desc",
        _order: sortDescriptor.column,
        _page: page,
        _size: pageSize,
    };

    const { data, isLoading, isFetching } = useGetAlertsHistoricalQuery(queryFilters);
    const { data: countData, isLoading: isCountLoading } = useGetAlertsHistoricalCountQuery(countFilters);

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
        setDateValue(today);
        setPage(1);
    };

    const columns: CustomColumnDef<AlertsItem>[] = useMemo(
        () => [
            { key: "alert_dis_cod_nevera", label: "Cod. Nevera", width: 130 },
            { key: "alert_dis_imei", label: "IMEI", width: 130 },
            { key: "alert_dis_distribuidor", label: "Distribuidor", width: 130 },
            { key: "alert_loc_nom", label: "Locación", width: 130 },
            {
                key: "alert_dis_bateria",
                label: "Batería",
                width: 140,
                render: (item) => {
                    const rawValue = item.alert_dis_bateria?.trim();
                    if (!rawValue) return <span className="text-xs text-slate-500">N/A</span>;

                    const pct = Number(rawValue.replace("%", "").trim());

                    if (Number.isNaN(pct)) {
                        return <span className="text-xs text-slate-500">{rawValue}</span>;
                    }

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
                render: (item) => (
                    <div className="flex items-center gap-1">
                        {item.alert_dis_energia === "Conectado" ? (
                            <span className="text-green-600 font-medium">ON</span>
                        ) : (
                            <span className="text-slate-400 font-medium">OFF</span>
                        )}
                    </div>
                ),
            },
            {
                key: "ubicacion",
                label: "Ubicación",
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
            { key: "alert_dis_signal", label: "Señal", width: 130 },
            { key: "alert_dis_satelite", label: "Satélite", width: 130 },
            {
                key: "alert_evento",
                label: "Estado",
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
            { key: "alert_movimiento", label: "Movimiento", width: 130 },
            { key: "alert_dis_fechahora", label: "Fecha/Hora", width: 130 },
            { key: "alert_dis_cliente", label: "Cliente", width: 130 },
        ],
        [handleOpenMap]
    );

    const filters: FilterFieldDef[] = [
        { key: "_cod_nevera", type: "text", placeholder: "Cod Nevera" },
        { key: "_cliente", type: "text", placeholder: "Cliente" },
        { key: "_distribuidor", type: "text", placeholder: "Distribuidor" },
        { key: "_evento", type: "text", placeholder: "Evento" },
        { key: "_fecha", type: "date", placeholder: "Fecha" },
        { key: "_imei", type: "text", placeholder: "IMEI" },
        { key: "_locacion", type: "text", placeholder: "Locación" },
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
                filters={filters}
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
                headerActions={
                    <DownloadButton
                        url={DOWNLOAD_CONFIGS.alertasActivas.url}
                        label=""
                        isIconOnly={true}
                        tooltip="Descargar Alertas Activas"
                        color="primary"
                        rolesPermitidos={DOWNLOAD_CONFIGS.censo.rolesPermitidos}
                    />
                }
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
                isLoading={isLoading || isFetching || isCountLoading}
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