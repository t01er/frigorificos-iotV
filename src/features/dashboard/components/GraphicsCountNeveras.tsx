import { useState } from "react";
import { Card, CardBody, Skeleton } from "@heroui/react";
import { useGetDashboardContadoresQuery } from "../services/mapApi";
import { useNeveraFilterContext } from "../contexts/NeveraFilterContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface PieCardProps {
  title: string;
  data: {
    name: string;
    value: number;
    color: string;
    estadoLabel: string;
  }[];
  layout?: "grid" | "sidebar";
  onItemClick?: (estadoLabel: string) => void;
  activeFilter?: string;
}

interface GraphicsCountNeverasProps {
  layout?: "grid" | "sidebar";
  onFilterByEstado?: (estadoLabel: string) => void;
  onClearFilters?: () => void;
}

function TotalCardSkeleton() {
  return (
    <Card shadow="none" className="bg-white/30 backdrop-blur-md p-1">
      <div className="flex justify-between items-center">
        <Skeleton className="rounded-lg w-32 h-7" />
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="rounded-lg w-24 h-7" />
          <Skeleton className="rounded-lg w-40 h-4" />
        </div>
      </div>
    </Card>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="bg-white/80 border backdrop-blur-2xl border-gray-200 rounded-lg shadow-lg p-3 w-50">
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="font-semibold">{item.name}</span>
      </div>

      <p className="text-sm text-gray-600">
        Cantidad: <span className="font-bold">{item.value}</span>
      </p>
    </div>
  );
}

function PieCardSkeleton({ layout }: { layout: "grid" | "sidebar" }) {
  return (
    <Card shadow="none" className={`h-full bg-white/30 backdrop-blur-md ${layout === "sidebar" ? "shadow-none" : "shadow-sm"}`}>
      <CardBody>
        <Skeleton className="rounded-lg w-[25rem] h-7 mb-4" />

        <div className={`flex flex-col md:flex-row ${layout === "sidebar" ? "items-center" : "items-center"} gap-10`}>
          <div className={`${layout === "sidebar" ? "w-40 h-40" : "w-50 h-50"}`}>
            <Skeleton className="w-full h-full rounded-full" />
          </div>

          <div className="flex flex-col gap-3 flex-1">
            <Skeleton className="rounded-lg w-24 h-8" />

            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-2 flex-1">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="rounded-lg flex-1 h-4" />
                </div>
                <Skeleton className="rounded-lg w-12 h-4" />
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function PieCard({
  title,
  data,
  layout,
  onItemClick,
  activeFilter
}: PieCardProps & { layout: "grid" | "sidebar" }) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  const handleItemClick = (estadoLabel: string) => {
    if (onItemClick && estadoLabel) {
      onItemClick(estadoLabel);
    }
  };

  return (
    <Card shadow="none" className={`h-full bg-white/30 backdrop-blur-md transition-all hover:shadow-md ${layout === "sidebar" ? "shadow-none" : "shadow-sm"}`}>
      <CardBody>


        <div className={`flex flex-col md:flex-row ${layout === "sidebar" ? "items-center" : "items-center"} gap-10`}>
          <div className={`${layout === "sidebar" ? "w-40 h-40 " : "w-50 h-50"}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={layout === "sidebar" ? 30 : 40}
                  outerRadius={layout === "sidebar" ? 70 : 100}
                  paddingAngle={3}
                >
                  {data.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.color}
                      opacity={activeFilter === item.estadoLabel ? 1 : 0.7}
                      stroke={activeFilter === item.estadoLabel ? "#000" : "none"}
                      strokeWidth={activeFilter === item.estadoLabel ? 2 : 0}
                      className="cursor-pointer hover:opacity-90 transition-all"
                      onClick={() => handleItemClick(item.estadoLabel)}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-2 flex-1">

            <div className="flex justify-between items-center ">
              <h3 className="text-lg font-bold">{title}</h3>
              <span className="text-2xl font-bold">
                {total.toLocaleString()}
              </span>
            </div>
            {data.map((item) => (
              <div
                key={item.name}
                className={`flex items-center justify-between gap-3 w-full cursor-pointer rounded-lg  transition-all ${activeFilter === item.estadoLabel
                  ? "bg-blue-100/80 ring-2 ring-blue-400 shadow-sm"
                  : "hover:bg-white/20"
                  }`}
                onClick={() => handleItemClick(item.estadoLabel)}
                title={`Filtrar por ${item.name}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: item.color,
                    }}
                  />
                  <span
                    className={`text-sm ${activeFilter === item.estadoLabel ? "font-bold" : "hover:underline"
                      }`}
                    style={{
                      color: item.color,
                    }}
                  >
                    {item.name}
                  </span>
                </div>
                <span className={`font-semibold ${activeFilter === item.estadoLabel ? "text-blue-800" : ""
                  }`}>
                  {item.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

export default function GraphicsCountNeveras({
  layout = "grid",
  onFilterByEstado,
  onClearFilters,
}: GraphicsCountNeverasProps) {
  const {
    distribuidorFilter,
    codNeveraFilter,
    imeiFilter,
    locacionFilter,
    clearAllFilters,
  } = useNeveraFilterContext();
  const [activeEstadoFilter, setActiveEstadoFilter] = useState<string>("");

  const queryParams = {
    ...(distribuidorFilter && { distribuidor: distribuidorFilter }),
    ...(codNeveraFilter && { cod_nevera: codNeveraFilter }),
    ...(imeiFilter && { imei: imeiFilter }),
    ...(locacionFilter && { locacion: locacionFilter }),
  };

  const { data, isLoading } = useGetDashboardContadoresQuery(queryParams, {
    skip: false,
  });

  const cardsClass =
    layout === "sidebar"
      ? "flex flex-col gap-2"
      : "grid grid-cols-1 lg:grid-cols-3 gap-10";

  const handleEstadoClick = (estadoLabel: string) => {
    if (activeEstadoFilter === estadoLabel) {
      setActiveEstadoFilter("");
      if (onClearFilters) {
        onClearFilters();
      }
      return;
    }
    setActiveEstadoFilter(estadoLabel);
    if (onFilterByEstado) {
      onFilterByEstado(estadoLabel);
    }
  };

  const hasActiveFilters = Boolean(
    activeEstadoFilter ||
    distribuidorFilter ||
    codNeveraFilter ||
    imeiFilter ||
    locacionFilter
  );


  const handleClearAllFilters = () => {
    setActiveEstadoFilter("");
    clearAllFilters();
    if (onClearFilters) {
      onClearFilters();
    }
  };
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 animate-pulse">
        <TotalCardSkeleton />
        <div className={cardsClass}>
          <PieCardSkeleton layout={layout} />
          <PieCardSkeleton layout={layout} />
          <PieCardSkeleton layout={layout} />
        </div>
      </div>
    );
  }

  if (!data?.data) {
    return null;
  }

  const dashboard = data.data;

  const total =
    dashboard.operativo_CARTERA +
    dashboard.operativo_CENSO +
    dashboard.operativo_INSTALACION +
    dashboard.fuera_DE_ZONA +
    dashboard.desconexion_DE_ENERGIA +
    dashboard.taller +
    dashboard.distribuidor +
    dashboard.mtto +
    dashboard.traslado +
    dashboard.nestle +
    dashboard.fuera_DE_LINEA;

  const operativas = [
    {
      name: "Operativo Cartera",
      value: dashboard.operativo_CARTERA,
      color: "#003595",
      estadoLabel: "Operativo - Cartera",
    },
    {
      name: "Operativo Censo",
      value: dashboard.operativo_CENSO,
      color: "#4E95D9",
      estadoLabel: "Operativo - Censo",
    },
    {
      name: "Operativo Instalación",
      value: dashboard.operativo_INSTALACION,
      color: "#00A5E8",
      estadoLabel: "Operativo - Instalación",
    },
  ];

  const alertadas = [
    {
      name: "Fuera de Zona",
      value: dashboard.fuera_DE_ZONA,
      color: "#F28B00",
      estadoLabel: "Fuera de Zona",
    },
    {
      name: "Sin Energía",
      value: dashboard.desconexion_DE_ENERGIA,
      color: "#FFD200",
      estadoLabel: "Desconexión por Energía",
    },
  ];

  const otros = [
    {
      name: "Fuera de Línea",
      value: dashboard.fuera_DE_LINEA,
      color: "#000000",
      estadoLabel: "Fuera de Línea",
    },
    {
      name: "Taller",
      value: dashboard.taller,
      color: "#1F1F1F",
      estadoLabel: "Taller",
    },
    {
      name: "Distribuidor",
      value: dashboard.distribuidor,
      color: "#3D3D3D",
      estadoLabel: "Distribuidor",
    },
    {
      name: "Traslado",
      value: dashboard.traslado,
      color: "#5C5C5C",
      estadoLabel: "Traslado",
    },
    {
      name: "Mantenimiento",
      value: dashboard.mtto,
      color: "#7A7A7A",
      estadoLabel: "Mantenimiento",
    },
    {
      name: "Nestlé",
      value: dashboard.nestle,
      color: "#999999",
      estadoLabel: "Nestlé",
    },
  ];


  return (
    <div className="flex flex-col gap-2">
      <Card
        shadow="none"
        className={`bg-white/30 backdrop-blur-md p-1 transition-all`}
      >
        <div
          className="flex justify-between items-center"
          onClick={handleClearAllFilters}
          title={activeEstadoFilter ? "Haz clic para limpiar todos los filtros" : ""}
        >
          <div className="flex items-start flex-col">
            <h3 className="text-lg font-bold">Total de Neveras</h3>
            <button onClick={(e) => {
              e.stopPropagation();
              handleClearAllFilters();
            }}
              className="text-lg font-bold group-hover:text-red-600 hover:underline transition-all">
              {total.toLocaleString()}
            </button>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 mt-1">
              Última actualización:{" "}
              {new Date(dashboard.registro_CORTE).toLocaleString()}
            </span>
          </div>
        </div>
      </Card>

      <div className={cardsClass}>
        <PieCard
          title="Operativas"
          data={operativas}
          layout={layout}
          onItemClick={handleEstadoClick}
          activeFilter={activeEstadoFilter}
        />
        <PieCard
          title="Alertadas"
          data={alertadas}
          layout={layout}
          onItemClick={handleEstadoClick}
          activeFilter={activeEstadoFilter}
        />
        <PieCard
          title="En Traslado"
          data={otros}
          layout={layout}
          onItemClick={handleEstadoClick}
          activeFilter={activeEstadoFilter}
        />
      </div>
    </div>
  );
}