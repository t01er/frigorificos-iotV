import BigMap from "./BigMap";
import NeveraLayer from "./NeveraLayer";
import TallerLayer, { type Taller } from "./TallerLayer";
import MapControls from "./MapControls";

interface MapProps {
  neveras: any[];
  talleres: any[];
  mapStyle: string;
  onChangeStyle: (value: string) => void;
  onSelectNevera?: (codigo: string, estado: number) => void;
  onSelectTaller?: (taller: Taller) => void;
}

const legendIcon = "size-9 rounded-full object-contain";

export default function Map({
  neveras,
  talleres,
  mapStyle,
  onChangeStyle,
  onSelectNevera,
  onSelectTaller,
}: MapProps) {
  return (
    <div className="relative w-full h-full">
      <BigMap mapStyle={mapStyle} controls={false}>
        {(map) => (
          <>
            <NeveraLayer map={map} neveras={neveras} onSelect={onSelectNevera} />
            <TallerLayer map={map} talleres={talleres} onSelect={onSelectTaller} />
            <MapControls
              map={map}
              mapStyle={mapStyle}
              onChangeStyle={onChangeStyle}
            />
          </>
        )}
      </BigMap>

      <div className="absolute left-4 bottom-4 z-10 hidden sm:flex items-center gap-5 rounded-full bg-nx-surface/95 backdrop-blur shadow-lg border border-nx-line/60 pl-2 pr-5 py-2 text-sm font-medium text-nx-text-2">
        <span className="flex items-center gap-2">
          <img src="/distribuidor.png" alt="" className={legendIcon} />
          Distribuidor
        </span>
        <span className="flex items-center gap-2">
          <img src="/taller.png" alt="" className={legendIcon} />
          Taller
        </span>
        <span className="flex items-center gap-2">
          <span className="size-9 flex items-center justify-center">
            <span className="size-[22px] rounded-full bg-nx-purple border-[3px] border-white shadow-md" />
          </span>
          Neveras
        </span>
      </div>
    </div>
  );
}
