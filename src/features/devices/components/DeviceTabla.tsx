import { useState, useMemo, useCallback, useEffect } from "react";
import TableComponent, {
    type CustomColumnDef,
} from "../../../components/ux/TableComponent";
import { useGetDeviceQuery, useGetContadorRegistrosPaginasQuery } from "../services/deviceApi";
import type { DeviceItem } from "../services/deviceApi";
import { MAX_DISPOSITIVOS } from "../../../config/types";
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Input,
} from "@heroui/react";
import { Magnifier, MenuDots, PenNewRound } from "@solar-icons/react";
import ModalDispositivoNuevo from "./ModalDispositivoNuevo";
import DeviceDetailPanel from "./DeviceDetailPanel";
import { BateriaCell, EnergiaChip, EstadoBadge, parseBateria } from "./DeviceCells";

const PAGE_SIZE_DEFAULT = 15;

type Segmento = "todos" | "bateria" | "energia";

const SEGMENTOS: { key: Segmento; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "bateria", label: "Batería baja" },
    { key: "energia", label: "Sin energía" },
];

const BATERIA_BAJA = 50;

export default function DeviceTabla() {
    const [search, setSearch] = useState("");
    const [codNevera, setCodNevera] = useState("");
    const [segmento, setSegmento] = useState<Segmento>("todos");
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
    const [selected, setSelected] = useState<DeviceItem | null>(null);

    // El buscador consulta al servidor con una pequeña espera
    useEffect(() => {
        const timer = setTimeout(() => {
            setCodNevera((prev) => {
                if (prev === search) return prev;
                setPage(1);
                return search;
            });
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isFetching, refetch } = useGetDeviceQuery({
        _cod_nevera: codNevera,
        _page: page,
        _size: pageSize,
    });

    const { data: paginacionData, isLoading: isLoadingPaginacion } =
        useGetContadorRegistrosPaginasQuery({
            _cod_nevera: codNevera,
            _page: page,
            _size: pageSize,
        });

    const totalRegistros = Math.min(paginacionData?.total_records ?? 0, MAX_DISPOSITIVOS);

    const devices = useMemo(() => {
        // La última página no puede pasar del tope
        const all = (data?.data ?? []).slice(0, Math.max(0, MAX_DISPOSITIVOS - (page - 1) * pageSize));
        if (segmento === "bateria")
            return all.filter((d) => {
                const pct = parseBateria(d.dis_bateria);
                return pct !== null && pct < BATERIA_BAJA;
            });
        if (segmento === "energia")
            return all.filter((d) => d.dis_energia !== "Conectado");
        return all;
    }, [data, segmento, page, pageSize]);

    useEffect(() => {
        if (reloadData) {
            refetch();
            setReloadData(false);
        }
    }, [reloadData, refetch]);

    // Panel de detalle: el seleccionado (actualizado con los datos nuevos) o el primero
    const current = useMemo(
        () =>
            devices.find((d) => d.dis_id === selected?.dis_id) ?? devices[0] ?? null,
        [devices, selected],
    );

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
            {
                key: "dis_cod_nevera",
                label: "Cód. nevera",
                width: 140,
                render: (item) => {
                    const active = item.dis_id === current?.dis_id;
                    return (
                        <span
                            className={`inline-flex items-center gap-2 font-bold ${
                                active ? "text-nx-purple" : "text-nx-text"
                            }`}
                        >
                            {active && (
                                <span className="w-[3px] h-4 rounded-full bg-nx-purple -ml-2" />
                            )}
                            {item.dis_cod_nevera}
                        </span>
                    );
                },
            },
            { key: "dis_imei", label: "IMEI", width: 150 },
            { key: "dis_distribuidor", label: "Distribuidor", width: 160 },
            {
                key: "dis_bateria",
                label: "Batería",
                width: 140,
                render: (item) => <BateriaCell value={item.dis_bateria} />,
            },
            {
                key: "dis_energia",
                label: "Energía",
                width: 90,
                render: (item) => <EnergiaChip value={item.dis_energia} />,
            },
            { key: "dis_geozona", label: "Geozona", width: 100 },
            { key: "dis_movimiento", label: "Movimiento", width: 120 },
            {
                key: "dis_estado",
                label: "Estado",
                width: 120,
                render: (item) => <EstadoBadge estado={item.dis_estado} />,
            },
            {
                key: "acciones",
                label: "",
                width: 56,
                align: "center",
                render: (item) => (
                    <span onClick={(e) => e.stopPropagation()}>
                        <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                                <button
                                    type="button"
                                    aria-label="Acciones"
                                    className="size-8 rounded-full flex items-center justify-center text-nx-text-3 hover:text-nx-text hover:bg-nx-surface-2 transition-colors"
                                >
                                    <MenuDots size={18} />
                                </button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Acciones del dispositivo"
                                onAction={() => handleEditDevice(item)}
                            >
                                <DropdownItem
                                    key="editar"
                                    startContent={<PenNewRound size={16} />}
                                >
                                    Editar
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </span>
                ),
            },
        ],
        [handleEditDevice, current?.dis_id],
    );

    return (
        <div className="flex flex-col gap-4">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-nx-text">Dispositivos</h1>
                    <p className="text-sm text-nx-text-3">
                        Configura y supervisa los{" "}
                        {totalRegistros.toLocaleString("es-ES", {
                            useGrouping: "always",
                        })}{" "}
                        dispositivos registrados
                    </p>
                </div>
                <Button
                    radius="full"
                    className="bg-nx-gradient text-white font-semibold"
                    startContent={<span className="text-lg leading-none">+</span>}
                    onPress={handleOpenModal}
                >
                    Nuevo dispositivo
                </Button>
            </header>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
                <TableComponent
                    title="Registrados"
                    count={totalRegistros}
                    itemLabel="dispositivos"
                    data={devices}
                    columns={columns}
                    idField="dis_id"
                    filterValues={{}}
                    onFilterChange={() => undefined}
                    onRowClick={setSelected}
                    selectedId={current?.dis_id}
                    headerActions={
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-0.5 rounded-full bg-nx-surface-2 p-1">
                                {SEGMENTOS.map((seg) => (
                                    <button
                                        key={seg.key}
                                        type="button"
                                        aria-pressed={segmento === seg.key}
                                        onClick={() => setSegmento(seg.key)}
                                        className={`h-8 px-3.5 rounded-full text-xs font-medium transition-colors ${
                                            segmento === seg.key
                                                ? "bg-nx-surface text-nx-text font-semibold"
                                                : "text-nx-text-2 hover:text-nx-text"
                                        }`}
                                    >
                                        {seg.label}
                                    </button>
                                ))}
                            </div>
                            <Input
                                aria-label="Buscar por código de nevera"
                                placeholder="Cód. nevera"
                                value={search}
                                onValueChange={setSearch}
                                isClearable
                                radius="full"
                                variant="flat"
                                className="w-44"
                                startContent={
                                    <Magnifier size={15} className="text-nx-text-3" />
                                }
                                classNames={{
                                    inputWrapper:
                                        "bg-nx-surface-2 shadow-none h-10 min-h-10",
                                    input: "text-sm",
                                }}
                            />
                        </div>
                    }
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

                {current && (
                    <DeviceDetailPanel
                        device={current}
                        onConfigure={() => handleEditDevice(current)}
                        onRefresh={() => refetch()}
                        isRefreshing={isFetching}
                    />
                )}
            </div>

            <ModalDispositivoNuevo
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onOpenChange={handleModalOpenChange}
                setReloadData={setReloadData}
                editingDevice={editingDevice}
                isEditing={isEditing}
            />
        </div>
    );
}
