import { useMemo, useState } from "react";
import TableComponent, {
    type CustomColumnDef,
    type FilterFieldDef,
} from "../../../components/ux/TableComponent";
import { Chip } from "@heroui/react";
import {
    useGetCorreosNestleQuery,
    type CorreoNestle,
} from "../services/alertsApi";

const PAGE_SIZE_DEFAULT = 15;

export default function CorreosNestleTabla() {
    const {
        data,
        isLoading,
        isFetching,
    } = useGetCorreosNestleQuery();

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);

    const [search, setSearch] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    const [sortDescriptor, setSortDescriptor] = useState<{
        column: string;
        direction: "ascending" | "descending";
    }>({
        column: "correo_id",
        direction: "ascending",
    });

    const correos = data?.data ?? [];

    const filteredCorreos = useMemo(() => {
        const value = appliedSearch.toLowerCase().trim();

        let result = [...correos];

        if (value) {
            result = result.filter((correo) =>
                [
                    correo.correo_nombre,
                    correo.correo_email,
                    correo.correo_telefono,
                ]
                    .join(" ")
                    .toLowerCase()
                    .includes(value)
            );
        }

        result.sort((a, b) => {
            const column = sortDescriptor.column as keyof CorreoNestle;

            const aValue = String(a[column] ?? "").toLowerCase();
            const bValue = String(b[column] ?? "").toLowerCase();

            const comparison = aValue.localeCompare(bValue, undefined, {
                numeric: true,
            });

            return sortDescriptor.direction === "ascending"
                ? comparison
                : -comparison;
        });

        return result;
    }, [correos, appliedSearch, sortDescriptor]);

    const totalRegistros = filteredCorreos.length;

    const paginatedCorreos = useMemo(() => {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        return filteredCorreos.slice(start, end);
    }, [filteredCorreos, page, pageSize]);

    const columns: CustomColumnDef<CorreoNestle>[] = useMemo(
        () => [
            {
                key: "correo_id",
                label: "ID",
                width: 80,
                align: "center",
            },
            {
                key: "correo_nombre",
                label: "Nombre",
                width: 180,
            },
            {
                key: "correo_email",
                label: "Correo",
                width: 250,
            },
            {
                key: "correo_telefono",
                label: "Teléfono",
                width: 150,
                render: (item) =>
                    item.correo_telefono || "-",
            },
            {
                key: "correo_status",
                label: "Estado",
                width: 120,
                align: "center",
                render: (item) => (
                    <Chip
                        size="sm"
                        variant="flat"
                        color={
                            item.correo_status === 1
                                ? "success"
                                : "danger"
                        }
                    >
                        {item.correo_status === 1
                            ? "Activo"
                            : "Inactivo"}
                    </Chip>
                ),
            },
        ],
        []
    );

    const filters: FilterFieldDef[] = [
        {
            key: "search",
            type: "text",
            placeholder: "Buscar correo...",
        },
    ];

    const correosWithUniqueId = useMemo(() => {
        return paginatedCorreos.map((correo) => ({
            ...correo,
            _uniqueId: String(correo.correo_id),
        }));
    }, [paginatedCorreos]);

    const handleSearch = () => {
        setAppliedSearch(search);
        setPage(1);
    };

    const handleClearFilters = () => {
        setSearch("");
        setAppliedSearch("");
        setPage(1);
    };

    return (
        <div>
            <TableComponent
                data={correosWithUniqueId}
                columns={columns}
                idField="_uniqueId"

                filters={filters}
                filterValues={{
                    search,
                }}

                onFilterChange={(key, value) => {
                    if (key === "search") {
                        setSearch(value);
                    }
                }}

                onClearFilters={handleClearFilters}

                showSearchButton={true}
                onSearch={handleSearch}

                sortDescriptor={sortDescriptor}
                onSortChange={(descriptor) => {
                    setSortDescriptor(descriptor);
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

                isLoading={isLoading || isFetching}
            />
        </div>
    );
}