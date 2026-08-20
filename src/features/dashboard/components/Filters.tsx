import { useState } from "react";
import {
  Select,
  SelectItem,
  Button,
  Input,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import { Magnifier, Tuning2, StreetsMapPoint, Signpost2, UserCheckRounded } from "@solar-icons/react";

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

  showMapStyles?: boolean;
  mapStyle?: string;
  setMapStyle?: (value: string) => void;
  mapStyles?: {
    label: string;
    value: string;
  }[];
}

export default function Filters({
  neveras: _neveras,
  filters,
  onApply,
  setFilters,
  isLoading,
  showMapStyles,
  mapStyle,
  setMapStyle,
  mapStyles,
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

  return (
    <div className="absolute top-20 right-3 z-20 max-w-xl">
      <div className="flex items-center gap-2 bg-white rounded-full shadow-lg px-2 py-1.5 w-sm">
        {showMapStyles && mapStyles && setMapStyle && mapStyle && (
          <Dropdown backdrop="blur">
            <DropdownTrigger>
              <Button
                variant="flat"
                isIconOnly
                size="sm"
                className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600 shrink-0"
              >
                <StreetsMapPoint size={18} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Estilos de mapa"
              selectionMode="single"
              selectedKeys={new Set([mapStyle])}
              onSelectionChange={(keys) =>
                setMapStyle(String(Array.from(keys)[0]))
              }
            >
              {mapStyles.map((style) => (
                <DropdownItem key={style.value}>{style.label}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        )}

        <Popover placement="bottom-start" size="sm" className="mt-2" >
          <PopoverTrigger>
            <Button
              variant="flat"
              isIconOnly
              size="sm"
              className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 text-gray-600 shrink-0"
            >
              <Tuning2 size={18} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-sm p-4">
            {() => (
              <div className="flex flex-col gap-4 w-full">
                <Select
                  size="sm"
                  label="Departamento"
                  startContent={
                    <Signpost2 className="text-gray-500" size={18} />
                  }
                  placeholder="Seleccione un departamento"
                  selectedKeys={
                    filters.departamento
                      ? new Set([filters.departamento])
                      : new Set([])
                  }
                  onSelectionChange={(keys) =>
                    setFilters({
                      ...filters,
                      departamento: String(Array.from(keys)[0] ?? ""),
                    })
                  }
                  classNames={{
                    listboxWrapper: "max-h-48 overflow-y-auto",
                  }}
                >
                  {departamentos.map((d) => (
                    <SelectItem key={d.departamento}>
                      {d.departamento}
                    </SelectItem>
                  ))}
                </Select>

                <Select
                  size="sm"
                  placeholder="Seleccione un distribuidor"
                  startContent={<UserCheckRounded className="text-gray-500" size={18} />}
                  label="Distribuidor"
                  selectionMode="multiple"
                  selectedKeys={new Set(filters.distribuidor)}
                  onSelectionChange={(keys) =>
                    setFilters({
                      ...filters,
                      distribuidor: Array.from(keys) as string[],
                    })
                  }
                  classNames={{
                    listboxWrapper: "max-h-48 overflow-y-auto",
                  }}
                >
                  {distribuidores.map((d) => (
                    <SelectItem key={d.nombre}>{d.nombre}</SelectItem>
                  ))}
                </Select>

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
              </div>
            )}
          </PopoverContent>
        </Popover>

        <Input
          radius="full"
          startContent={
            <button
              type="button"
              disabled={isLoading}
              onClick={onApply}
              className="flex items-center justify-center"
            >
              {isLoading ? (
                <Spinner size="sm" color="primary" />
              ) : (
                <Magnifier size={18} />
              )}
            </button>
          }
          className="flex-1"
          type="text"
          placeholder="Buscar dispositivo"
          value={search}
          onKeyDown={(e) => {
            if (e.key === "Enter") onApply();
          }}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}