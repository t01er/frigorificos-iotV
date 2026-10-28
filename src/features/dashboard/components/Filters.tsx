import { useState, useMemo } from "react";
import {
  Button,
  Input,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Checkbox,
  Chip,
  ScrollShadow,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";

import {
  Magnifier,
  Tuning2,
  Signpost2,
  UserCheckRounded,
  CloseCircle,
} from "@solar-icons/react";

import {
  useGetDistribuidoresQuery,
  useGetDepartamentosQuery,
} from "../services/mapApi";

interface Nevera {
  cod_nevera: string;
  distribuidor: string;
  latitud: string;
  longitud: string;
  estado_alarma: number;
  departamento: string;
}

interface FiltersState {
  empresa: string;
  tipo: string;
  cod_nevera: string;
  distribuidor: string[];
  estado: number;
  departamento: string;
}

interface FiltersProps {
  neveras: Nevera[];
  filters: FiltersState;
  setFilters: (filters: FiltersState) => void;
  onApply: () => void;
  isLoading: boolean;
  /** Contenido a la derecha del buscador (chips de grupo) */
  children?: React.ReactNode;
}

function DistribuidorMultiSelect({
  distribuidores,
  selected,
  onChange,
}: {
  distribuidores: { nombre: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return distribuidores;
    const q = search.toLowerCase();
    return distribuidores.filter((d) => d.nombre.toLowerCase().includes(q));
  }, [distribuidores, search]);

  const toggleValue = (nombre: string) => {
    if (selected.includes(nombre)) {
      onChange(selected.filter((v) => v !== nombre));
    } else {
      onChange([...selected, nombre]);
    }
  };


  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-600 px-1">
        Distribuidor
      </label>

      <Popover
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom-start"
        triggerScaleOnOpen={false}
      >
        <PopoverTrigger>
          <button
            type="button"
            className="flex items-center gap-2 w-full min-h-10 px-3 py-3 rounded-medium  bg-[#f4f4f5] text-left hover:bg-[#e3e3e6] transition-colors"
          >
            <UserCheckRounded className="text-zinc-700 shrink-0" size={18} />

            {selected.length === 0 ? (
              <span className="text-sm text-zinc-700 flex-1">
                Seleccione un distribuidor
              </span>
            ) : (
              <div className="flex flex-wrap gap-1 flex-1 py-0.5">
                {selected.map((nombre) => (
                  <Chip
                    key={nombre}
                    size="sm"
                    variant="flat"
                  >
                    {nombre}
                  </Chip>
                ))}
              </div>
            )}
          </button>
        </PopoverTrigger>

        <PopoverContent className="w-[350px] p-0">
          <div className="flex flex-col w-full">
            <div className="p-2 border-b border-gray-100">
              <Input
                size="sm"
                autoFocus
                placeholder="Buscar distribuidor..."
                startContent={
                  <Magnifier className="text-gray-400" size={16} />
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                isClearable
                onClear={() => setSearch("")}
              />
            </div>

            <ScrollShadow className="max-h-52 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">
                  Sin resultados
                </p>
              ) : (
                filtered.map((d) => (
                  <div
                    key={d.nombre}
                    onClick={() => toggleValue(d.nombre)}
                    className="flex items-center gap-2 px-2 py-2 rounded-medium hover:bg-gray-100 cursor-pointer"
                  >
                    <Checkbox
                      size="sm"
                      isSelected={selected.includes(d.nombre)}
                      onValueChange={() => toggleValue(d.nombre)}
                    />
                    <span className="text-sm">{d.nombre}</span>
                  </div>
                ))
              )}
            </ScrollShadow>

            {selected.length > 0 && (
              <div className="flex justify-between items-center px-3 py-2 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {selected.length} seleccionado
                  {selected.length > 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
                >
                  <CloseCircle size={14} />
                  Limpiar
                </button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function Filters({
  neveras: _neveras,
  filters,
  onApply,
  setFilters,
  isLoading,
  children,
}: FiltersProps) {
  const [search, setSearch] = useState(filters.cod_nevera);

  const { data: distribuidoresData } = useGetDistribuidoresQuery();
  const distribuidores = distribuidoresData?.data ?? [];

  const { data: departamentosData } = useGetDepartamentosQuery();
  const departamentos = departamentosData?.data ?? [];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setFilters({ ...filters, cod_nevera: value });
  };

  const clearFilters = () => {
    const cleanFilters: FiltersState = {
      ...filters,
      cod_nevera: "",
      distribuidor: [],
      estado: 0,
      departamento: "",
    };

    setSearch("");
    setFilters(cleanFilters);
    onApply();
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center gap-2 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-nx-surface/95 backdrop-blur shadow-lg border border-nx-line/60 pl-4 pr-2 h-12 w-full sm:w-80">
        <Input
          aria-label="Buscar código de nevera"
          placeholder="Buscar código de nevera..."
          value={search}
          onValueChange={handleSearchChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") onApply();
          }}
          size="sm"
          variant="flat"
          startContent={
            isLoading ? (
              <Spinner size="sm" color="primary" />
            ) : (
              <Magnifier size={18} className="text-nx-text-3" />
            )
          }
          classNames={{
            inputWrapper:
              "bg-transparent shadow-none px-0 data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent",
            input: "text-sm text-nx-text placeholder:text-nx-text-3",
          }}
        />
        <Popover placement="bottom-start" size="sm" className="mt-2">
          <PopoverTrigger>
            <button
              type="button"
              title="Filtros"
              aria-label="Filtros"
              className="size-9 shrink-0 rounded-full bg-nx-surface-2 flex items-center justify-center text-nx-text-2 hover:text-nx-text transition-colors"
            >
              <Tuning2 size={18} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-sm p-4">
            {() => (
              <div className="flex flex-col gap-4 w-full">
                <Autocomplete
                  size="sm"
                  label="Departamento"
                  placeholder="Buscar departamento..."
                  startContent={
                    <Signpost2
                      className="text-gray-500"
                      size={18}
                    />
                  }
                  selectedKey={filters.departamento || null}
                  onSelectionChange={(key) =>
                    setFilters({
                      ...filters,
                      departamento: key ? String(key) : "",
                    })
                  }
                  defaultItems={departamentos}
                  classNames={{
                    popoverContent: "p-1",
                    listboxWrapper: "max-h-52 overflow-y-auto",
                  }}
                >
                  {(d) => (
                    <AutocompleteItem
                      key={d.departamento}
                      textValue={d.departamento}
                    >
                      {d.departamento}
                    </AutocompleteItem>
                  )}
                </Autocomplete>

                <DistribuidorMultiSelect
                  distribuidores={distribuidores}
                  selected={filters.distribuidor}
                  onChange={(values) =>
                    setFilters({ ...filters, distribuidor: values })
                  }
                />
                <div className="flex items-center gap-1">
                  <Button
                    color="primary"
                    className="w-full"
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    onPress={() => {
                      onApply();
                    }}
                  >
                    Aplicar filtros
                  </Button>
                  <Button
                    variant="flat"
                    isIconOnly
                    className="w-full"
                    onPress={clearFilters}
                    isDisabled={isLoading}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      <div className="pointer-events-auto">{children}</div>
    </div>
  );
}
