import { useState, useEffect, useMemo } from "react";
import { Spinner } from "@heroui/react";
import Map from "./Map";
import Filters from "./Filters";
import NeveraDetailCard from "./NeveraDetailCard";
import PlaceDetailCard from "./PlaceDetailCard";
import type { Taller } from "./TallerLayer";
import { useGetNeverasMapaQuery, useGetTalleresNestleQuery } from "../services/mapApi";
import { MAX_DISPOSITIVOS } from "../../../config/types";
import { MAP_BASEMAPS } from "../styles/MAP_STYLES";
import { ESTADOS_NEVERA } from "../services/estadoNeveraConstants";
import { useNeveraFilterContext } from "../contexts/NeveraFilterContext";
import {
  GRUPOS_ESTADO,
  formatNumber,
  useResumenNeveras,
  type GrupoKey,
} from "../hooks/useResumenNeveras";

type GrupoFiltro = "todas" | GrupoKey;

const CHIPS: { key: GrupoFiltro; label: string; dot?: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "operativas", label: "Operativas", dot: "#7b2ff2" },
  { key: "alertadas", label: "Alertadas", dot: "#e8a21a" },
  { key: "traslado", label: "Traslado", dot: "#8582a0" },
];

const DEFAULT_FILTERS = {
  empresa: "9",
  tipo: "congeladora",
  cod_nevera: "",
  distribuidor: [] as string[],
  estado: 0,
  departamento: "",
};

interface NeverasMapaProps {
  /** Panel lateral; recibe los manejadores que filtran el mapa */
  renderSide?: (handlers: {
    onFilterByEstado: (estadoLabel: string) => void;
    onClearFilters: () => void;
  }) => React.ReactNode;
}

export default function NeverasMapa({ renderSide }: NeverasMapaProps) {
  const {
    setDistribuidorFilter,
    setEstadoFilter,
    setCodNeveraFilter,
    distribuidorFilter,
    codNeveraFilter,
    clearAllFilters,
  } = useNeveraFilterContext();

  const { resumen } = useResumenNeveras();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [apiFilters, setApiFilters] = useState(filters);
  const [grupo, setGrupo] = useState<GrupoFiltro>("todas");
  const [selected, setSelected] = useState<{
    codigo: string;
    estado: number;
  } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Taller | null>(null);

  useEffect(() => {
    if (apiFilters.distribuidor.length > 0) {
      setDistribuidorFilter(apiFilters.distribuidor.join(','));
    }

    if (apiFilters.estado !== 0) {
      const estadoNevera = ESTADOS_NEVERA.find(e => e.value === apiFilters.estado);
      if (estadoNevera) {
        setEstadoFilter(estadoNevera.filterKey);
      }
    }
  }, [apiFilters, setDistribuidorFilter, setEstadoFilter]);

  useEffect(() => {
    if (distribuidorFilter && distribuidorFilter !== apiFilters.distribuidor.join(',')) {
      const distribuidores = distribuidorFilter.split(',').filter(Boolean);
      if (distribuidores.length > 0) {
        const newFilters = {
          ...filters,
          distribuidor: distribuidores,
        };
        setFilters(newFilters);
        setApiFilters(newFilters);
      }
    }
  }, [distribuidorFilter]);

  // El buscador del header también filtra el mapa
  useEffect(() => {
    if (codNeveraFilter === apiFilters.cod_nevera) return;
    const timer = setTimeout(() => {
      const next = { ...filters, cod_nevera: codNeveraFilter };
      setFilters(next);
      setApiFilters(next);
    }, 400);
    return () => clearTimeout(timer);
  }, [codNeveraFilter]);

  const { data: talleresData } = useGetTalleresNestleQuery({
    departamento: apiFilters.departamento,
  });
  const talleres = talleresData?.data ?? [];

  const [mapStyle, setMapStyle] = useState(
    () => localStorage.getItem("map-style") ?? MAP_BASEMAPS[0].value
  );

  const handleSetMapStyle = (value: string) => {
    setMapStyle(value);
    localStorage.setItem("map-style", value);
  };

  const {
    data,
    isLoading,
    isFetching,
    error,
  } = useGetNeverasMapaQuery(apiFilters);

  const aplicarFiltros = () => {
    setApiFilters(filters);
    setCodNeveraFilter(filters.cod_nevera);
  };

  const handleFilterFromChart = (estadoLabel: string) => {
    const estadoNevera = ESTADOS_NEVERA.find(e =>
      e.label.toLowerCase().includes(estadoLabel.toLowerCase()) ||
      e.filterKey.toLowerCase().includes(estadoLabel.toLowerCase())
    );

    if (estadoNevera) {
      const newFilters = {
        ...filters,
        estado: estadoNevera.value,
      };
      setFilters(newFilters);
      setApiFilters(newFilters);
    }
  };

  const handleClearAllFiltersFromDashboard = () => {
    clearAllFilters();
    setGrupo("todas");
    setFilters(DEFAULT_FILTERS);
    setApiFilters(DEFAULT_FILTERS);
  };

  const neveras = useMemo(
    () => (data?.data ?? []).slice(0, MAX_DISPOSITIVOS),
    [data],
  );

  const visibles = useMemo(() => {
    if (grupo === "todas") return neveras;
    const estados: readonly number[] = GRUPOS_ESTADO[grupo];
    return neveras.filter((n: any) => estados.includes(Number(n.estado_alarma)));
  }, [neveras, grupo]);

  if (error) return <div>Error al cargar las neveras.</div>;

  const conteo = (key: GrupoFiltro) =>
    !resumen ? null : key === "todas" ? resumen.total : resumen.grupos[key].total;

  return (
    <>
    {renderSide && (
      <div className="min-h-0 lg:overflow-y-auto scrollbar-hide order-2 lg:order-1">
        {renderSide({
          onFilterByEstado: handleFilterFromChart,
          onClearFilters: handleClearAllFiltersFromDashboard,
        })}
      </div>
    )}
    <div className="order-1 lg:order-2 min-h-[520px] lg:min-h-0 relative w-full h-full overflow-hidden rounded-[2rem] bg-nx-surface">
      <Map
        neveras={visibles}
        talleres={talleres}
        mapStyle={mapStyle}
        onChangeStyle={handleSetMapStyle}
        onSelectNevera={(codigo, estado) => {
          setSelectedPlace(null);
          setSelected({ codigo, estado });
        }}
        onSelectTaller={(taller) => {
          setSelected(null);
          setSelectedPlace(taller);
        }}
      />

      <Filters
        filters={filters}
        setFilters={setFilters}
        onApply={aplicarFiltros}
        isLoading={isFetching}
        neveras={neveras}
      >
        <div className="flex items-center gap-1 rounded-full bg-nx-surface/95 backdrop-blur shadow-lg p-1 h-12">
          {CHIPS.map((chip) => {
            const active = grupo === chip.key;
            const count = conteo(chip.key);
            return (
              <button
                key={chip.key}
                type="button"
                aria-pressed={active}
                onClick={() => setGrupo(chip.key)}
                className={`h-10 px-3.5 rounded-full flex items-center gap-2 text-sm transition-colors ${
                  active
                    ? "bg-nx-ink text-nx-surface font-semibold"
                    : "text-nx-text-2 hover:bg-nx-surface-2"
                }`}
              >
                {chip.dot && (
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: chip.dot }}
                  />
                )}
                {chip.label}
                {count !== null && (
                  <span
                    className={`text-xs tabular-nums ${
                      active ? "opacity-70" : "text-nx-text-3"
                    }`}
                  >
                    {formatNumber(count)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Filters>

      {selected && (
        <div className="absolute top-20 left-4 z-20">
          <NeveraDetailCard
            key={selected.codigo}
            codigo={selected.codigo}
            estado={selected.estado}
            onClose={() => setSelected(null)}
          />
        </div>
      )}

      {selectedPlace && (
        <div className="absolute top-20 left-4 z-20">
          <PlaceDetailCard
            key={selectedPlace.codigo}
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
          />
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="px-8 py-6 flex flex-col items-center gap-4">
            <Spinner size="lg" color="primary" />
            <span className="text-sm font-medium text-white">
              Cargando neveras...
            </span>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
