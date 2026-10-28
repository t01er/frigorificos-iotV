import type { ReactNode } from "react";
import { Input, Select, SelectItem, Button, Pagination, Skeleton, DateRangePicker, DatePicker } from "@heroui/react";
import type { RangeValue, DateValue } from "@heroui/react";
import { Magnifier, AltArrowDown, AltArrowUp, Restart } from "@solar-icons/react";

export interface CustomColumnDef<T> {
  key: string;
  label: string;
  sortable?: boolean;
  sticky?: boolean;
  width: number;
  align?: "start" | "center" | "end";
  render?: (item: T) => ReactNode;
}

export interface ColumnGroupDef {
  label: string;
  columnKeys: string[];
  noRightBorder?: boolean;
}

export interface FilterFieldDef {
  key: string;
  type: "text" | "select" | "dateRange" | "date" | "startDate" | "endDate";
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Ícono a la izquierda del campo */
  icon?: ReactNode;
  /** Clases de ancho propias (reemplazan el ancho por defecto) */
  width?: string;
}

export interface CustomTableProps<T extends Record<string, any>> {
  data: T[];
  columns: CustomColumnDef<T>[];
  columnGroups?: ColumnGroupDef[];
  idField: string;
  filters?: FilterFieldDef[];
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters?: () => void;
  headerActions?: ReactNode;
  dateValue?: DateValue | null;
  onDateChange?: (date: DateValue | null) => void;
  sortDescriptor: { column: string; direction: "ascending" | "descending" };
  onSortChange: (d: {
    column: string;
    direction: "ascending" | "descending";
  }) => void;

  page: number;
  pageSize: number;
  totalRegistros: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;

  isLoading?: boolean;
  maxBodyHeight?: string;
  startDateValue?: DateValue | null;
  onStartDateChange?: (date: DateValue | null) => void;
  endDateValue?: DateValue | null;
  onEndDateChange?: (date: DateValue | null) => void;
  dateRangeValue?: RangeValue<DateValue> | null;
  onDateRangeChange?: (range: RangeValue<DateValue> | null) => void;
  showSearchButton?: boolean;
  onSearch?: () => void;
  /** Título del bloque (aparece a la izquierda de los filtros) */
  title?: ReactNode;
  /** Cantidad mostrada junto al título */
  count?: number;
  /** Nombre del elemento para el texto "Mostrando 1–10 de N ..." */
  itemLabel?: string;
  /** Hace clickeables las filas */
  onRowClick?: (item: T) => void;
  /** Valor de `idField` de la fila seleccionada */
  selectedId?: string | number | null;
  /** Los filtros ocupan todo el ancho disponible */
  fillFilters?: boolean;
  /** El botón de limpiar muestra solo el ícono */
  clearIconOnly?: boolean;
}

const GROUP_ROW_HEIGHT = 34;

const fmt = (n: number) => n.toLocaleString("es-ES", { useGrouping: "always" });

export default function TableComponent<T extends Record<string, any>>({
  data,
  columns,
  columnGroups,
  idField,
  filters = [],
  filterValues,
  onFilterChange,
  onClearFilters,
  headerActions,
  sortDescriptor,
  onSortChange,
  page,
  pageSize,
  totalRegistros,
  pageSizeOptions = [15, 25, 50, 100, 500],
  onPageChange,
  onPageSizeChange,
  isLoading,
  maxBodyHeight = "560px",
  dateRangeValue,
  onDateRangeChange,
  dateValue,
  onDateChange,
  startDateValue,
  onStartDateChange,
  endDateValue,
  onEndDateChange,
  showSearchButton = false,
  onSearch,
  title,
  count,
  itemLabel = "registros",
  onRowClick,
  selectedId,
  fillFilters = false,
  clearIconOnly = false,
}: CustomTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalRegistros / pageSize));

  const stickyOffsets: Record<string, number> = {};
  let acc = 0;
  columns.forEach((col) => {
    if (col.sticky) {
      stickyOffsets[col.key] = acc;
      acc += col.width;
    }
  });

  const handleHeaderClick = (col: CustomColumnDef<T>) => {
    if (col.sortable === false) return;
    if (sortDescriptor.column === col.key) {
      onSortChange({
        column: col.key,
        direction:
          sortDescriptor.direction === "ascending" ? "descending" : "ascending",
      });
    } else {
      onSortChange({ column: col.key, direction: "ascending" });
    }
  };



  return (
    <div className="bg-nx-surface rounded-[1.75rem] p-5 w-full max-w-full flex flex-col gap-4">
      {(title || filters.length > 0 || headerActions || onClearFilters) && (
        <div className="flex flex-wrap items-center gap-2">
          {title && (
            <div className="flex items-center gap-2 mr-auto">
              <h2 className="text-lg font-bold text-nx-text">{title}</h2>
              {count !== undefined && (
                <span className="px-2.5 py-0.5 rounded-full bg-nx-surface-2 text-xs font-medium text-nx-text-2 tabular-nums">
                  {count.toLocaleString("es-ES", { useGrouping: "always" })}
                </span>
              )}
            </div>
          )}
          {filters.map((f) => {
            if (f.type === "select") {
              return (
                <Select
                  key={f.key}
                  size="md"
                  radius="full"
                  className={f.width ?? (fillFilters ? "flex-1 min-w-[10rem]" : "w-44")}
                  aria-label={f.placeholder}
                  variant="flat"
                  classNames={{ trigger: "bg-nx-surface-2 shadow-none h-10 min-h-10", value: "text-sm" }}
                  placeholder={f.placeholder}
                  selectedKeys={
                    filterValues[f.key] ? new Set([filterValues[f.key]]) : new Set([])
                  }
                  onSelectionChange={(keys) =>
                    onFilterChange(f.key, String(Array.from(keys)[0] ?? ""))
                  }
                >
                  {(f.options ?? []).map((opt) => (
                    <SelectItem key={opt.value}>{opt.label}</SelectItem>
                  ))}
                </Select>
              );
            }

            if (f.type === "dateRange") {
              return (
                <DateRangePicker
                  key={f.key}
                  size="sm"
                  radius="md"
                  className="w-72"
                  aria-label={f.placeholder ?? "Rango de fechas"}
                  value={dateRangeValue as any}
                  onChange={onDateRangeChange as any}
                  granularity="day"
                />
              );
            }
            if (f.type === "date") {
              return (
                <DatePicker
                  key={f.key}
                  size="md"
                  radius="full"
                  variant="flat"
                  className={`${fillFilters ? "flex-1 min-w-[10rem]" : "w-52"} [&_[data-slot=input-wrapper]]:bg-nx-surface-2 [&_[data-slot=input-wrapper]]:shadow-none [&_[data-slot=input-wrapper]]:h-10 [&_[data-slot=input-wrapper]]:min-h-10`}
                  aria-label={f.placeholder ?? "Fecha"}
                  value={dateValue as any}
                  onChange={onDateChange as any}
                  granularity="day"
                />
              );
            }
            if (f.type === "startDate") {
              return (
                <DatePicker
                  key={f.key}
                  size="sm"
                  radius="md"
                  className="w-52"
                  aria-label={f.placeholder ?? "Fecha Inicio"}
                  label="Fecha Inicio"
                  value={startDateValue as any}
                  onChange={onStartDateChange as any}
                  granularity="day"
                />
              );
            }

            if (f.type === "endDate") {
              return (
                <DatePicker
                  key={f.key}
                  size="sm"
                  radius="md"
                  className="w-52"
                  label="Fecha fin"
                  aria-label={f.placeholder ?? "Fecha Fin"}
                  value={endDateValue as any}
                  onChange={onEndDateChange as any}
                  granularity="day"
                />
              );
            }
            return (
              <Input
                key={f.key}
                size="md"
                radius="full"
                variant="flat"
                className={f.width ?? (fillFilters ? "flex-1 min-w-[9rem]" : "w-40")}
                aria-label={f.placeholder ?? f.key}
                classNames={{ inputWrapper: "bg-nx-surface-2 shadow-none h-10 min-h-10", input: "text-sm" }}
                placeholder={f.placeholder ?? f.key}
                startContent={
                  <span className="text-nx-text-3">
                    {f.icon ?? <Magnifier size={15} />}
                  </span>
                }
                value={filterValues[f.key] ?? ""}
                onValueChange={(v) => onFilterChange(f.key, v)}
              />
            );
          })}
          {showSearchButton && (
            <Button
              size="md"
              radius="full"
              className="bg-nx-ink text-nx-surface font-semibold h-10 px-5"
              startContent={<Magnifier size={16} />}
              onPress={onSearch}
            >
              Buscar
            </Button>
          )}
          {onClearFilters &&
            (clearIconOnly ? (
              <Button
                isIconOnly
                size="md"
                radius="full"
                variant="bordered"
                aria-label="Limpiar filtros"
                className="border-nx-line text-nx-text-2 size-10 min-w-10"
                onPress={onClearFilters}
              >
                <Restart size={16} />
              </Button>
            ) : (
              <Button
                size="md"
                radius="full"
                variant="bordered"
                className="border-nx-line text-nx-text-2 h-10"
                startContent={<Restart size={15} />}
                onPress={onClearFilters}
              >
                Limpiar
              </Button>
            ))}

          {headerActions}
        </div>
      )}

      <div className="w-full overflow-auto rounded-2xl border border-nx-line" style={{ maxHeight: maxBodyHeight }}>
        <table className="border-collapse text-sm w-max min-w-full">
          {columnGroups && columnGroups.length > 0 && (
            <thead>
              <tr>
                {columnGroups.map((group, idx) => {
                  const groupCols = columns.filter((c) =>
                    group.columnKeys.includes(c.key)
                  );
                  const isSticky = groupCols.every((c) => c.sticky);
                  const groupWidth = groupCols.reduce((s, c) => s + c.width, 0);
                  return (
                    <th
                      key={`${group.label}-${idx}`}
                      colSpan={groupCols.length}
                      style={{ width: groupWidth, minWidth: groupWidth, height: GROUP_ROW_HEIGHT }}
                      className={`sticky top-0 bg-nx-surface-2 text-nx-text-3 text-[11px] font-semibold tracking-wide text-center border-b border-nx-line ${group.noRightBorder ? "" : "border-r border-nx-line"
                        } ${isSticky ? "z-30 left-0" : "z-20"}`}
                    >
                      {group.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
          )}

          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleHeaderClick(col)}
                  style={{
                    width: col.width,
                    minWidth: col.width,
                    top: columnGroups?.length ? GROUP_ROW_HEIGHT : 0,
                    ...(col.sticky ? { left: stickyOffsets[col.key] } : {}),
                  }}
                  className={`sticky bg-nx-surface-2 text-nx-text-3 font-semibold text-[11px] tracking-wide border-b border-nx-line px-3 py-3 whitespace-nowrap select-none ${col.sticky ? "z-30 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]" : "z-20"
                    } ${col.sortable !== false ? "cursor-pointer hover:text-nx-text" : ""} ${col.align === "center"
                      ? "text-center"
                      : col.align === "end"
                        ? "text-right"
                        : "text-left"
                    }`}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false &&
                      sortDescriptor.column === col.key &&
                      (sortDescriptor.direction === "ascending" ? (
                        <AltArrowUp size={12} />
                      ) : (
                        <AltArrowDown size={12} />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, rowIdx) => (
                <tr key={`skeleton-${rowIdx}`} className="border-b border-nx-line/50">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        width: col.width,
                        minWidth: col.width,
                        ...(col.sticky ? { left: stickyOffsets[col.key] } : {}),
                      }}
                      className={`px-3 py-3 ${col.sticky ? "sticky z-10 bg-nx-surface" : ""
                        }`}
                    >
                      <Skeleton className="h-3 w-4/5 rounded-md" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-nx-text-3">
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item[idField]}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  className={`group ${onRowClick ? "cursor-pointer" : ""} ${
                    selectedId != null && item[idField] === selectedId
                      ? "bg-nx-purple/5"
                      : "hover:bg-nx-surface-2/70"
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        width: col.width,
                        minWidth: col.width,
                        ...(col.sticky ? { left: stickyOffsets[col.key] } : {}),
                      }}
                      className={`px-3 py-2.5 text-[13px] text-nx-text-2 border-b border-nx-line/50 whitespace-nowrap ${col.sticky
                        ? "sticky z-10 bg-nx-surface group-hover:bg-nx-surface-2 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]"
                        : ""
                        } ${col.align === "center"
                          ? "text-center"
                          : col.align === "end"
                            ? "text-right"
                            : "text-left"
                        }`}
                    >
                      {col.render ? col.render(item) : String(item[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-nx-text-3">
          {totalRegistros === 0
            ? `Sin ${itemLabel}`
            : `Mostrando ${fmt((page - 1) * pageSize + 1)}–${fmt(Math.min(page * pageSize, totalRegistros))} de ${fmt(totalRegistros)} ${itemLabel}`}
        </span>

        <div className="flex items-center gap-3">
          <Select
            size="sm"
            radius="full"
            variant="flat"
            aria-label="Registros por página"
            className="w-24"
            classNames={{ trigger: "bg-nx-surface-2 shadow-none" }}
            selectedKeys={new Set([String(pageSize)])}
            onSelectionChange={(keys) =>
              onPageSizeChange(Number(Array.from(keys)[0]))
            }
          >
            {pageSizeOptions.map((size) => (
              <SelectItem key={String(size)}>{String(size)}</SelectItem>
            ))}
          </Select>

          <Pagination
            isCompact
            showControls
            size="md"
            radius="full"
            page={page}
            total={totalPages}
            onChange={onPageChange}
            classNames={{
              item: "bg-transparent text-nx-text-2",
              prev: "bg-nx-surface-2 text-nx-text-2",
              next: "bg-nx-surface-2 text-nx-text-2",
              cursor: "bg-nx-ink text-nx-surface font-semibold",
            }}
          />
        </div>
      </div>
    </div>
  );
}