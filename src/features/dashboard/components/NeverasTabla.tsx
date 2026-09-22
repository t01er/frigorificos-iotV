import { useState, useMemo, useEffect, useCallback } from "react";
import TableComponent, {
    type CustomColumnDef,
    type ColumnGroupDef,
    type FilterFieldDef,
} from "../../../components/ux/TableComponent";
import { useGetNeverasDashboardQuery, useGetContadorRegistrosPaginasQuery } from "../services/mapApi";
import type { NeveraDashboardItem } from "../services/mapApi";
import { ESTADO_OPTIONS_TABLE, ESTADOS_NEVERA } from "../services/estadoNeveraConstants";
import { useNeveraFilterContext } from "../contexts/NeveraFilterContext";
import MapModal from "../../dashboard/components/MapModal";
import RecorridoMapModal from "../../dashboard/components/RecorridoMapModal";
import DownloadButton from "../../../components/ux/DownloadButton";
import { DOWNLOAD_CONFIGS } from "../../../config/downloads";

const PAGE_SIZE_DEFAULT = 15;

interface NeverasTablaProps {
    externalFilter?: string;
    onClearExternalFilter?: () => void;
}

export default function NeverasTabla({
    externalFilter,
    onClearExternalFilter
}: NeverasTablaProps) {
    const {
        distribuidorFilter,
        codNeveraFilter,
        imeiFilter,
        locacionFilter,
        estadoFilter,
        setDistribuidorFilter,
        setCodNeveraFilter,
        setImeiFilter,
        setLocacionFilter,
        setEstadoFilter,
        clearAllFilters
    } = useNeveraFilterContext();

    const [selectedNevera, setSelectedNevera] = useState<NeveraDashboardItem | null>(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);

    const [selectedImei, setSelectedImei] = useState<string | null>(null);
    const [isRecorridoModalOpen, setIsRecorridoModalOpen] = useState(false);

    const handleOpenMap = useCallback((item: NeveraDashboardItem) => {
        setSelectedNevera(item);
        setIsMapModalOpen(true);
    }, []);

    const [filterValues, setFilterValues] = useState<Record<string, string>>({
        cod_nevera: codNeveraFilter || "",
        imei: imeiFilter || "",
        locacion: locacionFilter || "",
        distribuidor: distribuidorFilter || "",
        estado: "",
    });

    useEffect(() => {
        setFilterValues(prev => ({
            ...prev,
            cod_nevera: codNeveraFilter,
            imei: imeiFilter,
            locacion: locacionFilter,
            distribuidor: distribuidorFilter
        }));
        setPage(1);
    }, [codNeveraFilter, imeiFilter, locacionFilter, distribuidorFilter]);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
    const [sortDescriptor, setSortDescriptor] = useState<{
        column: string;
        direction: "ascending" | "descending";
    }>({ column: "dis_ult_conex", direction: "descending" });

    const queryFilters = {
        cod_nevera: filterValues.cod_nevera,
        imei: filterValues.imei,
        locacion: filterValues.locacion,
        distribuidor: filterValues.distribuidor,
        estado: filterValues.estado,
    };

    const { data, isLoading, isFetching } = useGetNeverasDashboardQuery({
        ...queryFilters,
        page,
        size: pageSize,
        order: sortDescriptor.column,
        or: sortDescriptor.direction === "descending" ? "desc" : "asc",
    });

    const { data: paginacionData, isLoading: isLoadingPaginacion } = useGetContadorRegistrosPaginasQuery(queryFilters);

    const totalRegistros = paginacionData?.total_records ?? 0;

    useEffect(() => {
        if (externalFilter) {
            const estado = ESTADOS_NEVERA.find(e =>
                e.label.toLowerCase().includes(externalFilter.toLowerCase()) ||
                e.filterKey.toLowerCase().includes(externalFilter.toLowerCase())
            );

            if (estado) {
                setFilterValues(prev => ({ ...prev, estado: estado.filterKey }));
                setPage(1);
            }
        } else if (!estadoFilter) {
            setFilterValues(prev => {
                if (prev.estado !== "") {
                    return { ...prev, estado: "" };
                }
                return prev;
            });
            setPage(1);
        }
    }, [externalFilter]);

    useEffect(() => {
        if (distribuidorFilter) {
            setFilterValues(prev => ({
                ...prev,
                distribuidor: distribuidorFilter
            }));
            setPage(1);
        }

        if (estadoFilter) {
            setFilterValues(prev => ({
                ...prev,
                estado: estadoFilter
            }));
            setPage(1);
        }
    }, [distribuidorFilter, estadoFilter]);

    const handleFilterChange = (key: string, value: string) => {
        setFilterValues((prev) => ({ ...prev, [key]: value }));
        setPage(1);

        if (key === "cod_nevera") setCodNeveraFilter(value);
        if (key === "imei") setImeiFilter(value);
        if (key === "locacion") setLocacionFilter(value);
        if (key === "distribuidor") setDistribuidorFilter(value);

        if (key === "estado") {
            setEstadoFilter(value);
            if (onClearExternalFilter) {
                setTimeout(() => onClearExternalFilter(), 0);
            }
        }
    };

    const neveras = data?.data ?? [];

    const getDownloadPayload = useCallback(() => {
        return {
            _cod_nevera: filterValues.cod_nevera || "",
            _imei: filterValues.imei || "",
            _locacion: filterValues.locacion || "",
            _distribuidor: filterValues.distribuidor || "",
            _estado: filterValues.estado || "",
            _movimiento: "",
            _order: sortDescriptor.column,
            _or: sortDescriptor.direction === "descending" ? "desc" : "asc",
            _page: 1,
            _size: 9999
        };
    }, [filterValues, sortDescriptor]);

    const [downloadBody, setDownloadBody] = useState(getDownloadPayload());

    useEffect(() => {
        setDownloadBody(getDownloadPayload());
    }, [getDownloadPayload]);

    const [selectedCodNevera, setSelectedCodNevera] = useState<string | null>(null);

    const handleOpenRecorrido = useCallback(
        (imei: string, codNevera: string) => {
            setSelectedImei(imei);
            setSelectedCodNevera(codNevera);
            setIsRecorridoModalOpen(true);
        },
        []
    );


    function getRangoUltimoMes() {
        const pad = (n: number) => String(n).padStart(2, "0");
        const format = (d: Date) =>
            `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
            `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

        const hoy = new Date();
        const haceUnMes = new Date(hoy);
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);

        return {
            fechaInicio: format(haceUnMes),
            fechaFin: format(hoy),
        };
    }

    function formatFechaParaNombre(d: Date) {
        const pad = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    }

    function getRangoUltimoMesParaNombre() {
        const hoy = new Date();
        const haceUnMes = new Date(hoy);
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);

        return {
            fechaInicio: formatFechaParaNombre(haceUnMes),
            fechaFin: formatFechaParaNombre(hoy),
        };
    }

    const getBitacoraFechaInicio = useCallback(() => {
        return getRangoUltimoMes().fechaInicio;
    }, []);

    const getBitacoraFechaFin = useCallback(() => {
        return getRangoUltimoMes().fechaFin;
    }, []);

    const getBitacoraBody = useCallback(() => {
        const { fechaInicio, fechaFin } = getRangoUltimoMes();
        return {
            fechaInicio,
            fechaFin,
        };
    }, []);

    const getBitacoraFileName = useCallback(() => {
        const { fechaInicio, fechaFin } = getRangoUltimoMesParaNombre();
        return `Bitacora_${fechaInicio}_al_${fechaFin}.zip`;
    }, []);

    const columns: CustomColumnDef<NeveraDashboardItem>[] = useMemo(
        () => [
            { key: "dis_cod_nevera", label: "Código Nevera", width: 130, sticky: true, sortable: false },
            {
                key: "dis_imei",
                label: "IMEI",
                sortable: false,
                width: 150,
                sticky: true,
                render: (item) => (
                    <button
                        type="button"
                        onClick={() =>
                            handleOpenRecorrido(
                                item.dis_imei,
                                item.dis_cod_nevera
                            )
                        }
                        className="text-blue-600 underline font-medium hover:text-blue-800 transition-colors"
                        title="Ver recorrido del dispositivo"
                    >
                        {item.dis_imei}
                    </button>
                ),
            },
            { key: "loc_nombre", label: "Locación", width: 150, sortable: false, },
            { key: "dis_distribuidor", label: "Distribuidor", width: 130, sortable: false, },
            { key: "dis_sincronizado", label: "Sincronizado", width: 120, sortable: false, },
            { key: "dis_ult_conex", label: "Última Transmisión", width: 150, sortable: true, },

            {
                key: "dis_latitud_actual",
                label: "Latitud",
                sortable: false,
                width: 130,
                render: (item) => (
                    <button
                        type="button"
                        onClick={() => handleOpenMap(item)}
                        className="text-blue-600 underline font-medium hover:text-blue-800 transition-colors"
                    >
                        {item.dis_latitud_actual}
                    </button>
                ),
            },

            {
                key: "dis_longitud_actual",
                label: "Longitud",
                sortable: false,
                width: 130,
                render: (item) => (
                    <button
                        type="button"
                        onClick={() => handleOpenMap(item)}
                        className="text-blue-600 underline font-medium hover:text-blue-800 transition-colors"
                    >
                        {item.dis_longitud_actual}
                    </button>
                ),
            },

            { key: "dis_estado", label: "Estado", width: 170, sortable: false, },
            { key: "dis_movimiento", label: "Movimiento", width: 110, sortable: true, },
            { key: "dis_bateria", label: "Batería", width: 100, sortable: true, },
            { key: "dis_energia", label: "Energía", width: 110, sortable: false, },
            { key: "dis_desconexiones", label: "Desconexiones", width: 130, sortable: false, },
            { key: "dis_senial_celular", label: "Señal Celular", width: 120, sortable: false, },
            { key: "dis_senial_gps", label: "Señal GPS", width: 120, sortable: false, },

            { key: "dis_fecha_instalacion", label: "Fecha", width: 150, sortable: false, },
            { key: "dis_latitud_inst", label: "Latitud", width: 110, sortable: false, },
            { key: "dis_longitud_inst", label: "Longitud", width: 110, sortable: false, },
            { key: "dis_distancia_km_instalacion", label: "Distancia KM", width: 150, sortable: false, },

            { key: "dis_cliente_codigo", label: "Código Cliente", width: 130, sortable: false, },
            { key: "dis_cliente_nombre", label: "Cliente", width: 150, sortable: false, },
            { key: "dis_fecha_censo", label: "Fecha", width: 150, sortable: false, },
            { key: "dis_latitud_censo", label: "Latitud", width: 110, sortable: false, },
            { key: "dis_longitud_censo", label: "Longitud", width: 110, sortable: false, },
            { key: "dis_distancia_km_censo", label: "Distancia KM", width: 150, sortable: false, },

            { key: "dis_fecha_cartera", label: "Fecha", width: 150, sortable: false, },
            { key: "dis_latitud_cartera", label: "Latitud", width: 110, sortable: false, },
            { key: "dis_longitud_cartera", label: "Longitud", width: 110, sortable: false, },
            { key: "dis_distancia_km_cartera", label: "Distancia KM", width: 150, sortable: false, },
            { key: "dis_iccid", label: "ICCID", width: 150, sortable: false, },


        ],
        [handleOpenMap, handleOpenRecorrido]
    );

    const columnGroups: ColumnGroupDef[] = [
        {
            label: "Identificación",
            columnKeys: ["dis_cod_nevera", "dis_imei", "loc_nombre", "dis_distribuidor", "dis_sincronizado"],
        },
        {
            label: "Última Data",
            columnKeys: [
                "dis_ult_conex",
                "dis_latitud_actual",
                "dis_longitud_actual",
                "dis_estado",
                "dis_movimiento",
                "dis_bateria",
                "dis_energia",
                "dis_desconexiones",
                "dis_senial_celular",
                "dis_senial_gps",
            ],
        },
        {
            label: "Instalación",
            columnKeys: [
                "dis_fecha_instalacion",
                "dis_latitud_inst",
                "dis_longitud_inst",
                "dis_distancia_km_instalacion",
            ],
        },
        {
            label: "Censo",
            columnKeys: [
                "dis_cliente_codigo",
                "dis_cliente_nombre",
                "dis_fecha_censo",
                "dis_latitud_censo",
                "dis_longitud_censo",
                "dis_distancia_km_censo",
            ],
        },
        {
            label: "Cartera",
            columnKeys: [
                "dis_fecha_cartera",
                "dis_latitud_cartera",
                "dis_longitud_cartera",
                "dis_distancia_km_cartera",
                "dis_iccid",
            ],
        },

    ];

    const filters: FilterFieldDef[] = [
        { key: "cod_nevera", type: "text", placeholder: "Cod Nevera" },
        { key: "imei", type: "text", placeholder: "IMEI" },
        { key: "locacion", type: "text", placeholder: "Locación" },
        { key: "distribuidor", type: "text", placeholder: "Distribuidor" },
        {
            key: "estado",
            type: "select",
            placeholder: "Estado",
            options: ESTADO_OPTIONS_TABLE,
        },
    ];


    const handleClearFilters = () => {
        setFilterValues({
            cod_nevera: "",
            imei: "",
            locacion: "",
            distribuidor: "",
            estado: "",
        });
        setPage(1);
        clearAllFilters();

        if (onClearExternalFilter) {
            onClearExternalFilter();
        }
    };

    return (
        <div>
            <TableComponent
                data={neveras}
                columns={columns}
                columnGroups={columnGroups}
                idField="dis_cod_nevera"
                filters={filters}
                filterValues={filterValues}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                sortDescriptor={sortDescriptor}
                onSortChange={(d) => {
                    setSortDescriptor(d);
                    setPage(1);
                }}
                headerActions={
                    <div className="flex gap-1">
                        <DownloadButton
                            url={DOWNLOAD_CONFIGS.censo.url}
                            label="Censo"
                            tooltip="Descargar Censo Actualizado"
                            color="success"
                            rolesPermitidos={DOWNLOAD_CONFIGS.censo.rolesPermitidos}
                        />
                        <DownloadButton
                            url={DOWNLOAD_CONFIGS.cartera.url}
                            label="Cartera"
                            tooltip="Descargar Cartera"
                            color="primary"
                            rolesPermitidos={DOWNLOAD_CONFIGS.cartera.rolesPermitidos}
                        />
                        <DownloadButton
                            url={DOWNLOAD_CONFIGS.bitacora.url}
                            label="Bitacora"
                            tooltip="Descargar Bitácora (último mes) - ZIP"
                            color="default"
                            method="POST"
                            body={getBitacoraBody()}
                            fileName={getBitacoraFileName()}
                            rolesPermitidos={DOWNLOAD_CONFIGS.bitacora.rolesPermitidos}
                            showConfirmDialog={true}
                            confirmMessage={
                                "Esta operación generará un archivo comprimido (.zip) con la bitácora del último mes y puede tardar unos minutos.\n\n¿Está seguro de proceder?"
                            }
                            onDownloadStart={() => console.log("Iniciando descarga de bitácora...")}
                            onDownloadComplete={() => console.log("Bitácora descargada")}
                            onError={(error) => console.error("Error en descarga de bitácora:", error)}
                        />
                        <DownloadButton
                            url={DOWNLOAD_CONFIGS.neverasDashboard.url}
                            label="Neveras"
                            tooltip="Descargar lista general de neveras"
                            color="primary"
                            rolesPermitidos={DOWNLOAD_CONFIGS.neverasDashboard.rolesPermitidos}
                            fileName={DOWNLOAD_CONFIGS.neverasDashboard.fileName}
                            method="POST"
                            body={downloadBody}
                        />
                    </div>
                }
                page={page}
                pageSize={pageSize}
                totalRegistros={totalRegistros}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                }}
                isLoading={isLoading || isFetching || isLoadingPaginacion}
            />

            <MapModal
                isOpen={isMapModalOpen}
                onClose={() => setIsMapModalOpen(false)}
                nevera={
                    selectedNevera
                        ? {
                            cod_nevera: selectedNevera.dis_cod_nevera,
                            imei: selectedNevera.dis_imei,
                            latitud: selectedNevera.dis_latitud_actual,
                            longitud: selectedNevera.dis_longitud_actual,
                        }
                        : null
                }
            />

            <RecorridoMapModal
                isOpen={isRecorridoModalOpen}
                onClose={() => setIsRecorridoModalOpen(false)}
                imei={selectedImei}
                codNevera={selectedCodNevera}
            />
        </div>
    );
}