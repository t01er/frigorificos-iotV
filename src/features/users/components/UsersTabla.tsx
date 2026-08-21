import { useState, useMemo, useCallback, useEffect } from "react";
import TableComponent, {
    type CustomColumnDef,
    type FilterFieldDef,
} from "../../../components/ux/TableComponent";
import { useGetUsersQuery, type UserItem } from "../services/userApi";
import { Avatar, Chip, Button } from "@heroui/react";
import ModalUsuarioNuevo from "./ModalUsuarioNuevo";
import * as XLSX from 'xlsx';
import { InboxIn, PenNewSquare, TrashBinTrash } from "@solar-icons/react";

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
            {
                key: "acciones",
                label: "Acciones",
                width: 100,
                align: "center",
                render: (item) => (
                    <div className="flex items-center justify-center" >
                        <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={() => handleEditUser(item)}
                            startContent={
                                <PenNewSquare size={18} />
                            }
                        >
                            Editar
                        </Button>
                        <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            startContent={
                                <TrashBinTrash size={18} />
                            }
                        >
                            Editar
                        </Button>
                    </div>
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

    const headerActions = (
        <div className="flex gap-2">
            <Button
                color="primary"
                size="sm"
                onPress={handleOpenModal}
                startContent={<span>+</span>}
            >
                Nuevo Usuario
            </Button>
            <Button
                color="success"
                size="sm"
                variant="solid"
                onPress={handleDownloadExcel}

                startContent={
                    <InboxIn size={15} />
                }
            >
                {isExporting ? "Exportando..." : "Exportar Excel"}
            </Button>
        </div>
    );

    return (
        <>
            <TableComponent
                data={paginatedUsers}
                columns={columns}
                idField="usu_id"
                filters={filters}
                filterValues={filterValues}
                headerActions={headerActions}
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