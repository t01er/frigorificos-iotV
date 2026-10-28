import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { Gps, Maximize, Plain } from "@solar-icons/react";

import BigMap from "../BigMap";
import { useTheme } from "../../../../hooks/useTheme";
import { NEVERA_MOCK } from "../../mocks/neveraDetalleMock";

interface UbicacionCardProps {
  lat?: number;
  lng?: number;
}

const ZOOM = 15;

function PinNevera({ map, lat, lng }: { map: mapboxgl.Map; lat: number; lng: number }) {
  useEffect(() => {
    // Mapbox posiciona el marcador con position:absolute + transform; no sobreescribir position.
    const el = document.createElement("div");
    el.style.width = "34px";
    el.style.height = "34px";
    el.innerHTML = `
      <span style="position:absolute;left:-28px;top:-28px;width:90px;height:90px;border-radius:9999px;background:rgba(123,47,242,.18);pointer-events:none;"></span>
      <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:9999px;background:#7b2ff2;border:3px solid #fff;box-shadow:0 4px 14px rgba(123,47,242,.45);box-sizing:border-box;">
        <span style="width:10px;height:14px;border:2px solid #fff;border-radius:3px;box-sizing:border-box;"></span>
      </span>`;

    const marker = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
    return () => {
      marker.remove();
    };
  }, [map, lat, lng]);

  return null;
}

export default function UbicacionCard({ lat, lng }: UbicacionCardProps) {
  const { theme } = useTheme();
  const latitud = lat ?? NEVERA_MOCK.ubicacion.lat;
  const longitud = lng ?? NEVERA_MOCK.ubicacion.lng;

  return (
    <section className="relative min-h-[15rem] flex-1 rounded-[1.5rem] overflow-hidden border border-nx-line/60 shadow-sm bg-nx-surface-2">
      <div className="absolute inset-0">
        <BigMap
          key={`${latitud},${longitud}`}
          center={[longitud, latitud]}
          zoom={ZOOM}
          controls={false}
          mapStyle={
            theme === "dark"
              ? "mapbox://styles/mapbox/dark-v11"
              : "mapbox://styles/mapbox/light-v11"
          }
        >
          {(map) => <PinNevera map={map} lat={latitud} lng={longitud} />}
        </BigMap>
      </div>

      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-nx-surface/95 backdrop-blur shadow px-2.5 py-1 text-[11px] font-medium text-nx-text">
        <Gps size={13} className="text-nx-purple" />
        GPS · señal fuerte
      </div>
      <a
        href={`https://www.google.com/maps?q=${latitud},${longitud}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Abrir en Google Maps"
        className="absolute top-3 right-3 size-8 rounded-full bg-nx-surface/95 shadow flex items-center justify-center text-nx-text-2 hover:text-nx-text"
      >
        <Maximize size={14} />
      </a>

      <div className="absolute left-3 right-3 bottom-3 flex items-center gap-3 rounded-2xl bg-nx-surface/95 backdrop-blur shadow px-3.5 py-2.5">
        <div className="flex-1 min-w-0 leading-tight">
          <p className="text-sm font-mono font-semibold text-nx-text truncate">
            {latitud.toFixed(6)}, {longitud.toFixed(6)}
          </p>
          <p className="text-[11px] text-nx-ok-ink">
            Dentro de geocerca · a {NEVERA_MOCK.ubicacion.distanciaPunto} m del punto asignado
          </p>
        </div>
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${latitud},${longitud}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Cómo llegar"
          className="size-9 shrink-0 rounded-full bg-nx-ink text-nx-surface flex items-center justify-center"
        >
          <Plain size={16} />
        </a>
      </div>
    </section>
  );
}
