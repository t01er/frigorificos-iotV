import { useCallback, useMemo, useState } from "react";
import TableComponent, {
    type CustomColumnDef,
    type FilterFieldDef,
} from "../../../components/ux/TableComponent";
import { addToast, Chip } from "@heroui/react";
import { useTodayDate } from "../../../hooks/useTodayDate";
import {
    useGetEventosForzadosQuery,
    type EventoForzadoItem,
    type EventosForzadosFilters,
} from "../services/alertsApi";
import type { DateValue } from "@heroui/react";

const PAGE_SIZE_DEFAULT = 10;

const formatDateValue = (date: DateValue | null): string => {
    if (!date) return "";

    return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
};
export default function EventosForzados() {


    const today = useTodayDate();
    const initialDateStr = formatDateValue(today);
    const [startDate, setStartDate] = useState<DateValue | null>(today);
    const [endDate, setEndDate] = useState<DateValue | null>(today);


    const initialFilters: EventosForzadosFilters = {
        cod_nevera: "",
        evento: "",
        estado_anterior: "",
        estado_nuevo: "",
        detalle: "",
        fecha_inicio: initialDateStr,
        fecha_fin: initialDateStr,
        or: "",
        order: "",
    };

    const [draftFilters, setDraftFilters] =
        useState<EventosForzadosFilters>(initialFilters);

    const [appliedFilters, setAppliedFilters] =
        useState<EventosForzadosFilters>(initialFilters);

    const handleStartDateChange = useCallback(
        (date: DateValue | null) => {
            if (date && endDate) {
                const start = new Date(
                    date.year,
                    date.month - 1,
                    date.day
                );

                const end = new Date(
                    endDate.year,
                    endDate.month - 1,
                    endDate.day
                );

                if (start > end) {
                    addToast({
                        title: "Fechas inválidas",
                        description:
                            "La fecha de inicio no puede ser mayor que la fecha final.",
                        color: "danger",
                        timeout: 4000,
                    });
                    return;
                }
            }

            setStartDate(date);

            setDraftFilters((prev) => ({
                ...prev,
                fecha_inicio: formatDateValue(date),
            }));
        },
        [endDate]
    );

    const handleEndDateChange = useCallback(
        (date: DateValue | null) => {
            if (date && startDate) {
                const end = new Date(
                    date.year,
                    date.month - 1,
                    date.day
                );

                const start = new Date(
                    startDate.year,
                    startDate.month - 1,
                    startDate.day
                );

                if (end < start) {
                    addToast({
                        title: "Fechas inválidas",
                        description:
                            "La fecha final no puede ser menor que la fecha de inicio.",
                        color: "danger",
                        timeout: 4000,
                    });
                    return;
                }
            }

            setEndDate(date);

            setDraftFilters((prev) => ({
                ...prev,
                fecha_fin: formatDateValue(date),
            }));
        },
        [startDate]
    );

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] =
        useState(PAGE_SIZE_DEFAULT);

    const [sortDescriptor, setSortDescriptor] = useState<{
        column: string;
        direction: "ascending" | "descending";
    }>({
        column: "fecha_registro",
        direction: "descending",
    });

    const queryFilters: EventosForzadosFilters = {
        ...appliedFilters,
        or:
            sortDescriptor.direction === "ascending"
                ? "asc"
                : "desc",
        order:
            sortDescriptor.column === "fechaRegistro"
                ? "fecha_registro"
                : sortDescriptor.column,
        page,
        size: pageSize,
    };
    const {
        data,
        isLoading,
        isFetching,
    } = useGetEventosForzadosQuery(queryFilters);

    const eventos = data?.data ?? [];

    const totalRegistros = data?.total_records ?? 0;

    const columns: CustomColumnDef<EventoForzadoItem>[] =
        useMemo(
            () => [
                {
                    key: "id",
                    label: "ID",
                    width: 80,
                    align: "center",
                    sortable: false,                    
                },
                {
                    key: "codNevera",
                    label: "Cod. Nevera",
                    width: 150,
                    sortable: false,
                },
                {
                    key: "estadoEvento",
                    label: "Evento",
                    width: 180,
                    sortable: false,
                    render: (item) => {
                        const evento =
                            item.estadoEvento?.toLowerCase();

                        let color:
                            | "success"
                            | "warning"
                            | "danger"
                            | "primary"
                            | "default" = "default";

                        if (
                            evento?.includes("inicio")
                        ) {
                            color = "warning";
                        } else if (
                            evento?.includes("fin")
                        ) {
                            color = "success";
                        }

                        return (
                            <Chip
                                size="sm"
                                variant="flat"
                                color={color}
                            >
                                {item.estadoEvento || "-"}
                            </Chip>
                        );
                    },
                },
                {
                    key: "estadoAnterior",
                    label: "Estado anterior",
                    width: 180,
                    sortable: false,
                    render: (item) => (
                        <span className="text-sm">
                            {item.estadoAnterior || "-"}
                        </span>
                    ),
                },
                {
                    key: "estadoNuevo",
                    label: "Estado nuevo",
                    width: 150,
                    sortable: false,
                    render: (item) => (
                        <Chip
                            size="sm"
                            variant="flat"
                            color="primary"
                        >
                            {item.estadoNuevo || "-"}
                        </Chip>
                    ),
                },
                {
                    key: "detalle",
                    label: "Detalle",
                    width: 220,
                    sortable: false,
                    render: (item) => (
                        <span
                            className="text-sm truncate block max-w-55"
                            title={item.detalle}
                        >
                            {item.detalle || "-"}
                        </span>
                    ),
                },
                {
                    key: "fechaRegistro",
                    label: "Fecha Registro",
                    width: 180,
                    sortable: true,
                },
                {
                    key: "origen",
                    label: "Origen",
                    width: 120,
                    sortable: false,
                    align: "center",
                    render: (item) => (
                        <Chip
                            size="sm"
                            variant="flat"
                            color="secondary"
                        >
                            {item.origen || "-"}
                        </Chip>
                    ),
                },
                {
                    key: "alertasHabilitadas",
                    label: "Alertas",
                    width: 120,
                    sortable: false,
                    align: "center",
                    render: (item) => (
                        <Chip
                            size="sm"
                            variant="flat"
                            color={
                                item.alertasHabilitadas === 1
                                    ? "success"
                                    : "default"
                            }
                        >
                            {item.alertasHabilitadas === 1
                                ? "Habilitadas"
                                : "Deshabilitadas"}
                        </Chip>
                    ),
                },
            ],
            []
        );

    const filters: FilterFieldDef[] = [
        {
            key: "cod_nevera",
            type: "text",
            placeholder: "Cod. Nevera",
        },
        {
            key: "evento",
            type: "text",
            placeholder: "Evento",
        },
        {
            key: "estado_anterior",
            type: "text",
            placeholder: "Estado anterior",
        },
        {
            key: "estado_nuevo",
            type: "text",
            placeholder: "Estado nuevo",
        },
        {
            key: "detalle",
            type: "text",
            placeholder: "Detalle",
        },
        {
            key: "fecha_inicio",
            type: "startDate",
            placeholder: "Fecha Inicio",
        },
        {
            key: "fecha_fin",
            type: "endDate",
            placeholder: "Fecha Fin",
        },
    ];

    const eventosWithUniqueId = useMemo(() => {
        return eventos.map((evento) => ({
            ...evento,
            _uniqueId: String(evento.id),
        }));
    }, [eventos]);

    const handleSearch = () => {
        setAppliedFilters(draftFilters);
        setPage(1);
    };

    const handleClearFilters = () => {
        setDraftFilters(initialFilters);
        setAppliedFilters(initialFilters);

        setStartDate(today);
        setEndDate(today);

        setPage(1);
    };
    return (
        <div>
            <TableComponent
                data={eventosWithUniqueId}
                columns={columns}
                idField="_uniqueId"
                filters={filters}
                filterValues={draftFilters as Record<string, string>}
                onFilterChange={(key, value) => {
                    if (key === "fecha_inicio" || key === "fecha_fin") return;

                    setDraftFilters((prev) => ({
                        ...prev,
                        [key]: value,
                    }));
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
                startDateValue={startDate}
                onStartDateChange={handleStartDateChange}
                endDateValue={endDate}
                onEndDateChange={handleEndDateChange}
                isLoading={isLoading || isFetching}
            />
        </div>
    );
}