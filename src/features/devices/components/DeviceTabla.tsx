import { useState, useMemo, useCallback } from "react";
import TableComponent, {
    type CustomColumnDef,
    type FilterFieldDef,
} from "../../../components/ux/TableComponent";
import { useGetDeviceQuery, useGetContadorRegistrosPaginasQuery } from "../services/deviceApi";
import type { DeviceItem } from "../services/deviceApi";
import { Chip, Button } from "@heroui/react";
import ModalDispositivoNuevo from "./ModalDispositivoNuevo";
import { PenNewRound } from "@solar-icons/react";

const PAGE_SIZE_DEFAULT = 15;

export default function DeviceTabla() {
    const [filterValues, setFilterValues] = useState<Record<string, string>>({
        cod_nevera: "",
        page: "",
        size: "",
    });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
    const [sortDescriptor, setSortDescriptor] = useState<{
        column: string;
        direction: "ascending" | "descending";
    }>({ column: "dis_ult_conex", direction: "descending" });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reloadData, setReloadData] = useState(false);
    const [editingDevice, setEditingDevice] = useState<DeviceItem | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const { data, isLoading, isFetching, refetch } = useGetDeviceQuery({
        _cod_nevera: filterValues.cod_nevera,
        _page: page,
        _size: pageSize,
    });

    const devices = data?.data ?? [];

    const { data: paginacionData, isLoading: isLoadingPaginacion } = useGetContadorRegistrosPaginasQuery({
        _cod_nevera: filterValues.cod_nevera,
        _page: page,
        _size: pageSize,
    });

    const handleReload = useCallback(() => {
        if (reloadData) {
            refetch();
            setReloadData(false);
        }
    }, [reloadData, refetch]);

    useState(() => {
        handleReload();
    });

    const handleOpenModal = useCallback(() => {
        setIsEditing(false);
        setEditingDevice(null);
        setIsModalOpen(true);
    }, []);

    const handleEditDevice = useCallback((device: DeviceItem) => {
        setEditingDevice(device);
        setIsEditing(true);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingDevice(null);
        setIsEditing(false);
    }, []);

    const handleModalOpenChange = useCallback((isOpen: boolean) => {
        setIsModalOpen(isOpen);
        if (!isOpen) {
            setEditingDevice(null);
            setIsEditing(false);
        }
    }, []);

    const columns: CustomColumnDef<DeviceItem>[] = useMemo(
        () => [
            { key: "dis_cod_nevera", label: "Cod Nevera", width: 130 },
            { key: "dis_imei", label: "IMEI", width: 130 },
            { key: "dis_distribuidor", label: "Distribuidor", width: 130 },
            { key: "dis_loc_nom", label: "Locación", width: 130 },
            {
                key: "dis_bateria",
                label: "Batería",
                width: 140,
                render: (item) => {
                    const value = item.dis_bateria ?? "";
                    const pct = Number(value.replace("%", "").trim());

                    if (Number.isNaN(pct)) {
                        return (
                            <span className="text-xs text-slate-500">
                                {value}
                            </span>
                        );
                    }

                    const color =
                        pct > 50
                            ? "bg-green-500"
                            : pct > 20
                                ? "bg-amber-500"
                                : "bg-red-500";

                    return (
                        <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className={`h-full ${color}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="text-xs text-slate-500">
                                {pct}%
                            </span>
                        </div>
                    );
                },
            },
            {
                key: "dis_energia",
                label: "Energía",
                width: 100,
                align: "start",
                render: (item) => (
                    <div className="flex items-center gap-1">
                        {item.dis_energia === "Conectado" ? (
                            <span className="flex items-center gap-1 text-amber-600">
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
            { key: "dis_latitud", label: "Latitud", width: 130 },
            { key: "dis_longitud", label: "Longitud", width: 130 },
            { key: "dis_geozona", label: "Geozona", width: 130 },
            { key: "dis_movimiento", label: "Movimiento", width: 130 },           
            {
                key: "dis_estado",
                label: "Estado",
                width: 130,
                align: "center",
                render: (item) => {
                    const estado = item.dis_estado?.toLowerCase();
                    const map: Record<string, "success" | "danger" | "warning" | "default"> = {
                        activo: "success",
                        inactivo: "danger",
                        desconocido: "warning",
                    };
                    return (
                        <Chip size="sm" variant="solid" color={map[estado] ?? "default"}>
                            {item.dis_estado}
                        </Chip>
                    );
                },
            },
            { key: "dis_version", label: "Versión", width: 130 },
            { key: "dis_cliente", label: "Cliente", width: 130 },
             { key: "dis_iccid", label: "ICCID", width: 130 },
            {
                key: "acciones",
                label: "Acciones",
                width: 100,
                align: "center",
                render: (item) => (
                    <Button
                        size="sm"
                        variant="light"
                        color="primary"
                        onPress={() => handleEditDevice(item)}
                        startContent={
                            <PenNewRound size={17} />
                        }
                    >
                        Editar
                    </Button>
                ),
            },
        ],
        [handleEditDevice]
    );

    const filters: FilterFieldDef[] = [
        { key: "cod_nevera", type: "text", placeholder: "Cod Nevera" },
    ];

    const totalRegistros = paginacionData?.total_records ?? 0;

    return (
        <>
            <TableComponent
                data={devices}
                columns={columns}
                idField="dis_id"
                filters={filters}
                filterValues={filterValues}
                headerActions={
                    <Button
                        color="primary"
                        size="sm"
                        onPress={handleOpenModal}
                        startContent={<span>+</span>}
                    >
                        Nuevo Dispositivo
                    </Button>
                }
                onFilterChange={(key, value) => {
                    setFilterValues((prev) => ({ ...prev, [key]: value }));
                    setPage(1);
                }}
                onClearFilters={() => {
                    setFilterValues({
                        cod_nevera: "",
                    });
                    setPage(1);
                }}
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

            <ModalDispositivoNuevo
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onOpenChange={handleModalOpenChange}
                setReloadData={setReloadData}
                editingDevice={editingDevice}
                isEditing={isEditing}
            />
        </>
    );
}