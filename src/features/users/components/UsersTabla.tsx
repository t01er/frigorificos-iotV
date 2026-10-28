import { useState, useMemo, useCallback, useEffect } from "react";
import TableComponent, {
    type CustomColumnDef,
    type FilterFieldDef,
} from "../../../components/ux/TableComponent";
import {
    useActualizarUsuarioEntelMutation,
    useActualizarUsuarioNestleMutation,
    useEliminarUsuarioEntelMutation,
    useEliminarUsuarioNestleMutation,
    useGetUsersQuery,
    type UserItem,
} from "../services/userApi";
import UsersSidePanel from "./UsersSidePanel";
import { PerfilTag, UserAvatar } from "./UserCells";
import ModalUsuarioNuevo from "./ModalUsuarioNuevo";
import * as XLSX from 'xlsx';
import { FileText, Magnifier, PenNewSquare, TrashBinTrash, UserPlus } from "@solar-icons/react";
import { Button, Switch } from "@heroui/react";
const PAGE_SIZE_DEFAULT = 15;

export default function UsersTabla() {
    const [filterValues, setFilterValues] = useState<Record<string, string>>({
        usu_usuario: "",
        estado: "",
        tipo: "",
    });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
    const [sortDescriptor, setSortDescriptor] = useState<{
        column: string;
        direction: "ascending" | "descending";
    }>({ column: "usu_usuario", direction: "ascending" });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reloadData, setReloadData] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const { data, isLoading, isFetching, refetch } = useGetUsersQuery();
    const [eliminarUsuarioNestle] = useEliminarUsuarioNestleMutation();
    const [eliminarUsuarioEntel] = useEliminarUsuarioEntelMutation();
    const [actualizarNestle] = useActualizarUsuarioNestleMutation();
    const [actualizarEntel] = useActualizarUsuarioEntelMutation();
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const allUsers = data?.data ?? [];

    const handleReload = useCallback(() => {
        if (reloadData) {
            refetch();
            setReloadData(false);
        }
    }, [reloadData, refetch]);

    useEffect(() => {
        handleReload();
    }, [handleReload, reloadData]);


    const filteredUsers = useMemo(() => {
        let result = [...allUsers];

        const searchTerm = filterValues.usu_usuario?.toLowerCase() || "";
        if (searchTerm) {
            result = result.filter((user) =>
                user.usu_usuario?.toLowerCase().includes(searchTerm) ||
                user.usu_nombre?.toLowerCase().includes(searchTerm) ||
                user.usu_correo?.toLowerCase().includes(searchTerm) ||
                user.usu_telefono?.toLowerCase().includes(searchTerm) ||
                user.usu_cargo?.toLowerCase().includes(searchTerm)
            );
        }

        if (filterValues.estado) {
            result = result.filter((user) =>
                user.usu_estado?.toLowerCase() === filterValues.estado.toLowerCase()
            );
        }

        if (filterValues.tipo) {
            result = result.filter((user) =>
                user.usu_tipo?.toLowerCase() === filterValues.tipo.toLowerCase()
            );
        }

        return result;
    }, [allUsers, filterValues]);

    const sortedUsers = useMemo(() => {
        return [...filteredUsers].sort((a, b) => {
            const col = sortDescriptor.column as keyof UserItem;
            const aVal = String(a[col] ?? "").toLowerCase();
            const bVal = String(b[col] ?? "").toLowerCase();

            if (aVal < bVal) return sortDescriptor.direction === "ascending" ? -1 : 1;
            if (aVal > bVal) return sortDescriptor.direction === "ascending" ? 1 : -1;
            return 0;
        });
    }, [filteredUsers, sortDescriptor]);

    const totalRegistros = sortedUsers.length;

    const paginatedUsers = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedUsers.slice(start, start + pageSize);
    }, [sortedUsers, page, pageSize]);

    useEffect(() => {
        setPage(1);
    }, [filterValues, pageSize]);


    const handleDownloadExcel = useCallback(() => {
        setIsExporting(true);

        try {
            const excelData = sortedUsers.map((user) => ({
                'Usuario': user.usu_usuario || '',
                'Nombre': user.usu_nombre || '',
                'Correo': user.usu_correo || '',
                'Teléfono': user.usu_telefono || '',
                'Cargo': user.usu_cargo || '',
                'Perfil': user.usu_tipo || '',
                'Estado': user.usu_estado || '',
            }));

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            const columnWidths = [
                { wch: 20 },
                { wch: 25 },
                { wch: 30 },
                { wch: 15 },
                { wch: 20 },
                { wch: 20 },
                { wch: 15 },
            ];
            worksheet['!cols'] = columnWidths;

            XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

            const date = new Date();
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const filename = `Usuarios_${dateStr}.xlsx`;

            XLSX.writeFile(workbook, filename);

        } catch (error) {
            console.error("Error al exportar Excel:", error);
        } finally {
            setIsExporting(false);
        }
    }, [sortedUsers]);

    const handleOpenModal = useCallback(() => {
        setIsEditing(false);
        setEditingUser(null);
        setIsModalOpen(true);
    }, []);

    const handleEditUser = useCallback((user: UserItem) => {
        setEditingUser(user);
        setIsEditing(true);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingUser(null);
        setIsEditing(false);
    }, []);

    const handleModalOpenChange = useCallback((isOpen: boolean) => {
        setIsModalOpen(isOpen);
        if (!isOpen) {
            setEditingUser(null);
            setIsEditing(false);
        }
    }, []);

    const handleDeleteUser = useCallback(async (user: UserItem) => {
        if (!window.confirm(`¿Eliminar al usuario "${user.usu_usuario}"? Esta acción no se puede deshacer.`)) {
            return;
        }
        try {
            await Promise.all([
                eliminarUsuarioNestle(user.usu_usuario).unwrap(),
                eliminarUsuarioEntel(user.usu_usuario).unwrap(),
            ]);
            setReloadData(true);
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
        }
    }, [eliminarUsuarioNestle, eliminarUsuarioEntel]);

    const handleToggleEstado = useCallback(
        async (user: UserItem) => {
            const activar = user.usu_estado?.toLowerCase() !== "activo";
            if (
                !window.confirm(
                    `¿${activar ? "Activar" : "Desactivar"} al usuario "${user.usu_usuario}"?`,
                )
            )
                return;

            setTogglingId(user.usu_id);
            try {
                const payload = {
                    usu_id: user.usu_id,
                    usu_empresa: 9,
                    usu_nombre: user.usu_nombre,
                    usu_correo: user.usu_correo,
                    usu_telefono: user.usu_telefono,
                    usu_cargo: user.usu_cargo,
                    usu_usuario: user.usu_usuario,
                    usu_contrasena: user.usu_contrasena,
                    usu_tipo: user.usu_tipo,
                    usu_estado: activar ? "activo" : "inactivo",
                    usu_lista_distribuidores: user.usu_lista_distribuidores ?? [],
                };
                await Promise.all([
                    actualizarNestle(payload).unwrap(),
                    actualizarEntel({
                        ...payload,
                        usu_usuario_original: user.usu_usuario,
                    } as typeof payload).unwrap(),
                ]);
                setReloadData(true);
            } catch (error) {
                console.error("Error al cambiar el estado del usuario:", error);
            } finally {
                setTogglingId(null);
            }
        },
        [actualizarNestle, actualizarEntel],
    );

    const iconBtn =
        "size-8 rounded-full flex items-center justify-center transition-colors";

    const columns: CustomColumnDef<UserItem>[] = useMemo(
        () => [
            {
                key: "usu_nombre",
                label: "Nombre",
                width: 260,
                render: (item) => (
                    <div className="flex items-center gap-3">
                        <UserAvatar name={item.usu_nombre} />
                        <div className="flex flex-col leading-tight min-w-0">
                            <span className="font-semibold text-nx-text truncate">
                                {item.usu_nombre}
                            </span>
                            <span className="text-[11px] text-nx-text-3 truncate">
                                {item.usu_correo}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                key: "usu_telefono",
                label: "Teléfono",
                width: 130,
                render: (item) => <span>{item.usu_telefono || "—"}</span>,
            },
            {
                key: "usu_cargo",
                label: "Cargo",
                width: 200,
                render: (item) => <span>{item.usu_cargo || "—"}</span>,
            },
            {
                key: "usu_usuario",
                label: "Usuario",
                width: 190,
                render: (item) => (
                    <div className="flex flex-col gap-0.5 leading-tight">
                        <span className="font-medium text-nx-text">{item.usu_usuario}</span>
                        <PerfilTag tipo={item.usu_tipo} />
                    </div>
                ),
            },
            {
                key: "usu_estado",
                label: "Estado",
                width: 90,
                render: (item) => (
                    <Switch
                        size="sm"
                        color="success"
                        aria-label={`Estado de ${item.usu_usuario}`}
                        isSelected={item.usu_estado?.toLowerCase() === "activo"}
                        isDisabled={togglingId === item.usu_id}
                        onValueChange={() => handleToggleEstado(item)}
                    />
                ),
            },
            {
                key: "acciones",
                label: "Acciones",
                width: 110,
                align: "end",
                sortable: false,
                render: (item) => (
                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            aria-label="Editar usuario"
                            title="Editar"
                            onClick={() => handleEditUser(item)}
                            className={`${iconBtn} bg-nx-surface-2 text-nx-text-2 hover:text-nx-text`}
                        >
                            <PenNewSquare size={16} />
                        </button>
                        <button
                            type="button"
                            aria-label="Eliminar usuario"
                            title="Eliminar"
                            onClick={() => handleDeleteUser(item)}
                            className={`${iconBtn} bg-nx-err-soft text-nx-err hover:text-nx-err-ink`}
                        >
                            <TrashBinTrash size={16} />
                        </button>
                    </div>
                ),
            },
        ],
        [handleEditUser, handleDeleteUser, handleToggleEstado, togglingId]
    );

    const filters: FilterFieldDef[] = [
        {
            key: "usu_usuario",
            type: "text",
            placeholder: "Buscar por nombre o usuario",
            icon: <Magnifier size={15} />,
            width: "flex-[3] min-w-[14rem]",
        },
        {
            key: "estado",
            type: "select",
            placeholder: "Estado",
            width: "w-40",
            options: [
                { value: "", label: "Todos" },
                { value: "activo", label: "Activo" },
                { value: "inactivo", label: "Inactivo" },
            ]
        },
        {
            key: "tipo",
            type: "select",
            placeholder: "Perfil",
            width: "w-44",
            options: [
                { value: "", label: "Todos" },
                { value: "admin", label: "Administrador" },
                { value: "distribuidornestle", label: "Distribuidor Nestle" },
                { value: "usuario", label: "Usuario" },
                { value: "lectura", label: "Lectura" },
                { value: "admincartavio", label: "Admin Cartavio" },
                { value: "usuariocartavio", label: "Usuario Cartavio" },
                { value: "lectorcartavio", label: "Lectura Cartavio" },
            ]
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-nx-text">Usuarios</h1>
                    <p className="text-sm text-nx-text-3">
                        {allUsers.length.toLocaleString("es-ES", { useGrouping: "always" })}{" "}
                        personas con acceso a Labotec entre Nestlé y distribuidores
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        radius="full"
                        isDisabled={isExporting}
                        className="bg-nx-surface text-nx-text font-medium"
                        startContent={<FileText size={18} className="text-nx-ok" />}
                        onPress={handleDownloadExcel}
                    >
                        {isExporting ? "Exportando..." : "Exportar Excel"}
                    </Button>
                    <Button
                        radius="full"
                        className="bg-nx-gradient text-white font-semibold"
                        startContent={<UserPlus size={18} />}
                        onPress={handleOpenModal}
                    >
                        Nuevo usuario
                    </Button>
                </div>
            </header>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
                <TableComponent
                    data={paginatedUsers}
                    columns={columns}
                    idField="usu_id"
                    itemLabel="usuarios"
                    filters={filters}
                    clearIconOnly
                    filterValues={filterValues}
                    onFilterChange={(key, value) => {
                        setFilterValues((prev) => ({ ...prev, [key]: value }));
                    }}
                    onClearFilters={() => {
                        setFilterValues({
                            usu_usuario: "",
                            estado: "",
                            tipo: ""
                        });
                    }}
                    sortDescriptor={sortDescriptor}
                    onSortChange={(d) => {
                        setSortDescriptor(d);
                    }}
                    page={page}
                    pageSize={pageSize}
                    totalRegistros={totalRegistros}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                    }}
                    isLoading={isLoading || isFetching}
                />

                <UsersSidePanel users={allUsers} />
            </div>

            <ModalUsuarioNuevo
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onOpenChange={handleModalOpenChange}
                setReloadData={setReloadData}
                editingUser={editingUser}
                isEditing={isEditing}
                empresaId={9}
            />
        </div>
    );
}
