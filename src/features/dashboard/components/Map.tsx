import NeveraLayer from "./NeveraLayer";
import GraphicsCountNeveras from "./GraphicsCountNeveras";
import TallerLayer from "./TallerLayer";
import BigMap from "./BigMap";

interface Nevera {
  cod_nevera: string;
  distribuidor: string;
  latitud: string;
  longitud: string;
  estado_alarma: number;
}

interface Taller {
  codigo: number;
  nombre: string;
  direccion: string;
  latitud: string;
  longitud: string;
  supervisor: string;
  coordinador: string;
  tipo: number;
  razon_social: string;
}

interface MapProps {
  neveras: Nevera[];
  talleres: Taller[];
  mapStyle: string;
  onFilterFromChart?: (estadoLabel: string) => void;
  onClearFilters?: () => void;
}

export default function Map({
  neveras,
  talleres,
  mapStyle,
  onFilterFromChart,
  onClearFilters,
}: MapProps) {
  return (
    <div className="relative w-full h-full min-h-125">
      <div className="absolute top-19 left-2 z-10 h-[88vh] overflow-auto">
        <GraphicsCountNeveras
          layout="sidebar"
          onFilterByEstado={onFilterFromChart}
          onClearFilters={onClearFilters}
        />
      </div>

      <BigMap mapStyle={mapStyle}>
        {(map) => (
          <>
            <NeveraLayer map={map} neveras={neveras} />
            <TallerLayer map={map} talleres={talleres} />
          </>
        )}
      </BigMap>
    </div>
  );
}