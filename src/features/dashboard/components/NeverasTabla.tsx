import { useState, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import TableComponent, {
    type CustomColumnDef,
    type ColumnGroupDef,
    type FilterFieldDef,
} from "../../../components/ux/TableComponent";
import { useGetNeverasDashboardQuery, useGetContadorRegistrosPaginasQuery } from "../services/mapApi";
import { MAX_DISPOSITIVOS } from "../../../config/types";
import type { NeveraDashboardItem } from "../services/mapApi";
import { ESTADO_OPTIONS_TABLE, ESTADOS_NEVERA } from "../services/estadoNeveraConstants";
import { useNeveraFilterContext } from "../contexts/NeveraFilterContext";
import { BatteryCell, EnergiaCell, EstadoChip, MovimientoCell } from "./NeveraCells";
import MapModal from "../../dashboard/components/MapModal";
import RecorridoMapModal from "../../dashboard/components/RecorridoMapModal";

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

    const totalRegistros = Math.min(paginacionData?.total_records ?? 0, MAX_DISPOSITIVOS);

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

    // La última página no puede pasar del tope
    const neveras = (data?.data ?? []).slice(0, Math.max(0, MAX_DISPOSITIVOS - (page - 1) * pageSize));

    const [selectedCodNevera, setSelectedCodNevera] = useState<string | null>(null);

    const handleOpenRecorrido = useCallback(
        (imei: string, codNevera: string) => {
            setSelectedImei(imei);
            setSelectedCodNevera(codNevera);
            setIsRecorridoModalOpen(true);
        },
        []
    );


    const columns: CustomColumnDef<NeveraDashboardItem>[] = useMemo(
        () => [
            {
                key: "dis_cod_nevera",
                label: "Código",
                width: 120,
                sticky: true,
                sortable: false,
                render: (item) => (
                    <Link
                        to={`/dashboard/neveras/${encodeURIComponent(item.dis_cod_nevera)}`}
                        className="font-bold text-nx-text hover:text-nx-purple hover:underline transition-colors"
                        title="Ver detalle de la nevera"
                    >
                        {item.dis_cod_nevera}
                    </Link>
                ),
            },
            {
                key: "dis_imei",
                label: "IMEI",
                sortable: false,
                width: 160,
                sticky: true,
                render: (item) => (
                    <button
                        type="button"
                        onClick={() =>
                            handleOpenRecorrido(item.dis_imei, item.dis_cod_nevera)
                        }
                        className="font-mono text-xs text-nx-text-2 hover:text-nx-purple hover:underline transition-colors"
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
                key: "dis_coordenadas",
                label: "Coordenadas",
                sortable: false,
                width: 190,
                render: (item) => (
                    <button
                        type="button"
                        onClick={() => handleOpenMap(item)}
                        className="font-mono text-xs text-nx-blue hover:underline transition-colors"
                        title="Ver en el mapa"
                    >
                        {item.dis_latitud_actual}, {item.dis_longitud_actual}
                    </button>
                ),
            },

            { key: "dis_estado", label: "Estado", width: 170, sortable: false, render: (item) => <EstadoChip estado={item.dis_estado} /> },
            { key: "dis_movimiento", label: "Movimiento", width: 130, sortable: true, render: (item) => <MovimientoCell movimiento={item.dis_movimiento} /> },
            { key: "dis_bateria", label: "Batería", width: 140, sortable: true, render: (item) => <BatteryCell value={item.dis_bateria} /> },
            { key: "dis_energia", label: "Energía", width: 130, sortable: false, render: (item) => <EnergiaCell value={item.dis_energia} /> },
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
                "dis_coordenadas",
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
                title="Inventario de neveras"
                count={totalRegistros}
                itemLabel="neveras"
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