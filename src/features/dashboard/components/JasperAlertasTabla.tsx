// JasperAlertasTabla.tsx
import { useState, useMemo } from "react";
import TableComponent, {
    type CustomColumnDef,
    type FilterFieldDef,
} from "../../../components/ux/TableComponent";
import { useGetAlertasFallitasJasperReportQuery } from "../services/mapApi";
import type { JasperReportItem } from "../services/mapApi";
import { Chip } from "@heroui/react";

const PAGE_SIZE_DEFAULT = 15;

export default function JasperAlertasTabla() {
    const [filterValues, setFilterValues] = useState<Record<string, string>>({
        cod_nevera: "",
    });
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_DEFAULT);
    const [sortDescriptor, setSortDescriptor] = useState<{
        column: string;
        direction: "ascending" | "descending";
    }>({ column: "dateSent", direction: "descending" });

    const { data, isLoading, isFetching } = useGetAlertasFallitasJasperReportQuery({
        cod_nevera: filterValues.cod_nevera,
        page: 1,
        size: 9999,
    });

    const allDevices = data?.data ?? [];

    const filteredDevices = allDevices;

    const sortedDevices = useMemo(() => {
        return [...filteredDevices].sort((a, b) => {
            const col = sortDescriptor.column as keyof JasperReportItem;
            const aVal = String(a[col] ?? "").toLowerCase();
            const bVal = String(b[col] ?? "").toLowerCase();

            if (aVal < bVal) return sortDescriptor.direction === "ascending" ? -1 : 1;
            if (aVal > bVal) return sortDescriptor.direction === "ascending" ? 1 : -1;
            return 0;
        });
    }, [filteredDevices, sortDescriptor]);

    const totalRegistros = sortedDevices.length;

    const paginatedDevices = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedDevices.slice(start, start + pageSize);
    }, [sortedDevices, page, pageSize]);

    const handleFilterChange = (key: string, value: string) => {
        setFilterValues((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    };

    const columns: CustomColumnDef<JasperReportItem>[] = useMemo(
        () => [
            { key: "codigoNevera", label: "SMS ID", width: 130 },
            { key: "iccid", label: "Mensaje", width: 200 },
            { key: "smsId", label: "SMS ID", width: 130 },
            { key: "messageText", label: "Mensaje", width: 200 },
            { key: "senderLogin", label: "Sender Login", width: 130 },
            { key: "sentTo", label: "Enviado a", width: 130 },
            { key: "sentFrom", label: "Enviado desde", width: 130 },
            { key: "msgType", label: "Tipo de mensaje", width: 130 },
            { key: "dateSent", label: "Fecha de envío", width: 130 },
            { key: "dateReceived", label: "Fecha de recepción", width: 130 },
            {
                key: "status",
                label: "Estado",
                width: 130,
                align: "center",
                render: (item) => {
                    const estado = item.status?.toLowerCase();
                    const map: Record<string, "success" | "danger" | "warning" | "default"> = {
                        entregado: "success",
                        fallido: "danger",
                        desconocido: "warning",
                    };
                    return (
                        <Chip size="sm" variant="solid" color={map[estado] ?? "default"}>
                            {item.status}
                        </Chip>
                    );
                },
            },
            { key: "dateModified", label: "Fecha de modificación", width: 130 },
            { key: "dateDispositivo", label: "Fecha del dispositivo", width: 130 },
        ],
        []
    );

    const filters: FilterFieldDef[] = [
        { key: "cod_nevera", type: "text", placeholder: "Cod Nevera" },
    ];

    const devicesWithUniqueId = useMemo(() => {
        return paginatedDevices.map((device, index) => ({
            ...device,
            _uniqueId: `${device.smsId}_${device.codigoNevera}_${index}`,
        }));
    }, [paginatedDevices]);

    return (
        <div>
            <TableComponent
                data={devicesWithUniqueId}
                columns={columns}
                idField="_uniqueId"
                filters={filters}
                filterValues={filterValues}
                onFilterChange={handleFilterChange}
                onClearFilters={() => {
                    setFilterValues({ cod_nevera: "" });
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
                isLoading={isLoading || isFetching}
            />
        </div>
    );
}