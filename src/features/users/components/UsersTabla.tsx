import { useState, useMemo, useCallback, useEffect } from "react";
import TableComponent, {
    type CustomColumnDef,
    type FilterFieldDef,
} from "../../../components/ux/TableComponent";
import { useGetUsersQuery, type UserItem } from "../services/userApi";
import { Avatar, Chip, Button } from "@heroui/react";
import ModalUsuarioNuevo from "./ModalUsuarioNuevo";

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

    // Estados para el modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reloadData, setReloadData] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Obtener todos los usuarios (sin paginación en el backend)
    const { data, isLoading, isFetching, refetch } = useGetUsersQuery();

    const allUsers = data?.data ?? [];

    // Recargar datos cuando se guarda un usuario
    const handleReload = useCallback(() => {
        if (reloadData) {
            refetch();
            setReloadData(false);
        }
    }, [reloadData, refetch]);

    useEffect(() => {
        handleReload();
    }, [handleReload, reloadData]);

    // Filtrar usuarios
    const filteredUsers = useMemo(() => {
        let result = [...allUsers];

        // Filtro por búsqueda
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

        // Filtro por estado
        if (filterValues.estado) {
            result = result.filter((user) =>
                user.usu_estado?.toLowerCase() === filterValues.estado.toLowerCase()
            );
        }

        // Filtro por tipo/perfil
        if (filterValues.tipo) {
            result = result.filter((user) =>
                user.usu_tipo?.toLowerCase() === filterValues.tipo.toLowerCase()
            );
        }

        return result;
    }, [allUsers, filterValues]);

    // Ordenar usuarios
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

    // Total de registros después de filtros
    const totalRegistros = sortedUsers.length;

    // Paginación en frontend
    const paginatedUsers = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedUsers.slice(start, start + pageSize);
    }, [sortedUsers, page, pageSize]);

    // Resetear a página 1 cuando cambian los filtros
    useEffect(() => {
        setPage(1);
    }, [filterValues, pageSize]);

    // Abrir modal para nuevo usuario
    const handleOpenModal = useCallback(() => {
        setIsEditing(false);
        setEditingUser(null);
        setIsModalOpen(true);
    }, []);

    // Abrir modal para editar usuario
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

    // Columnas con acción de editar
    const columns: CustomColumnDef<UserItem>[] = useMemo(
        () => [
            {
                key: "usu_nombre",
                label: "Nombre",
                width: 200,
                sticky: true,
                render: (item) => (
                    <div className="flex items-center gap-2">
                        <Avatar
                            size="sm"
                            name={item.usu_nombre}
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.usu_nombre)}&background=%231e187b&size=32&color=fff&bold=true`}
                            className="shrink-0"
                        />
                        <div className="flex flex-col leading-tight">
                            <span className="font-semibold text-slate-700">{item.usu_nombre}</span>
                            <span className="text-[11px] text-slate-400">{item.usu_correo}</span>
                        </div>
                    </div>
                ),
            },
            {
                key: "usu_telefono",
                label: "Teléfono",
                width: 130
            },
            {
                key: "usu_cargo",
                label: "Cargo",
                width: 130
            },
            {
                key: "usu_usuario",
                label: "Usuario",
                width: 200,
                sticky: true,
                render: (item) => (
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col leading-tight">
                            <span className="font-semibold text-slate-700">{item.usu_usuario}</span>
                            <span className="text-[11px] text-slate-400">{item.usu_tipo}</span>
                        </div>
                    </div>
                ),
            },
            {
                key: "usu_estado",
                label: "Estado",
                width: 130,
                align: "center",
                render: (item) => {
                    const estado = item.usu_estado?.toLowerCase();
                    const map: Record<string, "success" | "danger" | "warning" | "default"> = {
                        activo: "success",
                        inactivo: "danger",
                        desconocido: "warning",
                    };
                    return (
                        <Chip size="sm" variant="solid" color={map[estado] ?? "default"}>
                            {item.usu_estado}
                        </Chip>
                    );
                },
            },
            // Columna de acciones - Botón Editar
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
                        onPress={() => handleEditUser(item)}
                        startContent={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        }
                    >
                        Editar
                    </Button>
                ),
            },
        ],
        [handleEditUser]
    );

    const filters: FilterFieldDef[] = [
        {
            key: "usu_usuario",
            type: "text",
            placeholder: "Buscar por nombre, usuario, correo..."
        },
        {
            key: "estado",
            type: "select",
            placeholder: "Estado",
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
        <>
            <TableComponent
                data={paginatedUsers}
                columns={columns}
                idField="usu_id"
                filters={filters}
                filterValues={filterValues}
                headerActions={
                    <Button
                        color="primary"
                        size="sm"
                        onPress={handleOpenModal}
                        startContent={<span>+</span>}
                    >
                        Nuevo Usuario
                    </Button>
                }
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

            <ModalUsuarioNuevo
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onOpenChange={handleModalOpenChange}
                setReloadData={setReloadData}
                editingUser={editingUser}
                isEditing={isEditing}
                empresaId={9} 
            />
        </>
    );
}