import type { ReactNode } from "react";
import { Input, Select, SelectItem, Button, Pagination, Skeleton, DateRangePicker, DatePicker } from "@heroui/react";
import type { RangeValue, DateValue } from "@heroui/react";
import { Magnifer, AltArrowDown, AltArrowUp } from "@solar-icons/react";

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
}

const GROUP_ROW_HEIGHT = 34;

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
  pageSizeOptions = [15, 25, 50, 100],
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
    <div className="bg-white rounded-2xl px-3 w-full max-w-full flex flex-col">
      {(filters.length > 0 || headerActions || onClearFilters) && (
        <div className="flex flex-wrap items-center gap-2 py-3 border-b border-slate-100 bg-slate-50/50">
          {filters.map((f) => {
            if (f.type === "select") {
              return (
                <Select
                  key={f.key}
                  size="md"
                  radius="md"
                  className="w-50"
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
                  size="md"
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
                  radius="md"
                  className="w-52"
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
                  size="md"
                  radius="md"
                  className="w-52"
                  aria-label={f.placeholder ?? "Fecha Inicio"}
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
                  size="md"
                  radius="md"
                  className="w-52"
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
                radius="md"             
                className="w-40"
                placeholder={f.placeholder ?? f.key}
                startContent={<Magnifer size={14} className="text-default-400" />}
                value={filterValues[f.key] ?? ""}
                onValueChange={(v) => onFilterChange(f.key, v)}
              />
            );
          })}
          {showSearchButton && (
            <Button
              size="sm"
              color="primary"
              variant="solid"
              startContent={<Magnifer size={16} />}
              onPress={onSearch}
            >
              Buscar
            </Button>
          )}
          {onClearFilters && (
            <Button size="sm" color="danger" variant="flat" onPress={onClearFilters}>
              Limpiar
            </Button>
          )}

          <div className="flex-1" />
          {headerActions}
        </div>
      )}

      <div className="w-full overflow-auto" style={{ maxHeight: maxBodyHeight }}>
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
                      className={`sticky top-0 bg-slate-100 text-slate-500 text-[11px] font-bold  tracking-wide text-center border-b border-slate-200 ${group.noRightBorder ? "" : "border-r"
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
                  className={`sticky bg-white text-slate-400 font-bold text-[11px] tracking-wide border-b border-slate-100 px-3 py-2 whitespace-nowrap select-none ${col.sticky ? "z-30 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]" : "z-20"
                    } ${col.sortable !== false ? "cursor-pointer hover:text-slate-600" : ""} ${col.align === "center"
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
                <tr key={`skeleton-${rowIdx}`} className="border-b border-slate-50">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        width: col.width,
                        minWidth: col.width,
                        ...(col.sticky ? { left: stickyOffsets[col.key] } : {}),
                      }}
                      className={`px-3 py-3 ${col.sticky ? "sticky z-10 bg-white" : ""
                        }`}
                    >
                      <Skeleton className="h-3 w-4/5 rounded-md" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400">
                  No se encontraron resultados
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item[idField]} className="hover:bg-slate-50/60 group">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        width: col.width,
                        minWidth: col.width,
                        ...(col.sticky ? { left: stickyOffsets[col.key] } : {}),
                      }}
                      className={`px-3 py-2 text-xs text-zinc-500 border-b border-slate-50 whitespace-nowrap ${col.sticky
                        ? "sticky z-10 bg-white group-hover:bg-slate-50 shadow-[1px_0_0_0_rgba(0,0,0,0.06)]"
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

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/30">
        <span className="text-xs text-slate-500">
          Total Registros: <span className="font-semibold">{totalRegistros}</span>
        </span>

        <div className="flex items-center gap-3">
          <Select
            size="sm"
            radius="lg"
            className="w-24"
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
            size="sm"
            radius="lg"
            color="primary"
            page={page}
            total={totalPages}
            onChange={onPageChange}
          />
        </div>
      </div>
    </div>
  );
}