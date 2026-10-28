import { useState } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import { AnimatePresence, motion } from "framer-motion";
import {
  AddCircle,
  Gps,
  Layers,
  MinusCircle,
  Moon,
  Routing2,
  Sun2,
  Streets,
} from "@solar-icons/react";

import { MAP_BASEMAPS } from "../styles/MAP_STYLES";

interface MapControlsProps {
  map: MapboxMap;
  mapStyle: string;
  onChangeStyle: (value: string) => void;
}

const glass =
  "rounded-[1.5rem] bg-nx-surface/95 backdrop-blur shadow-lg border border-nx-line/60";

const btn =
  "size-10 rounded-full flex items-center justify-center text-nx-text-2 hover:text-nx-text hover:bg-nx-surface-2 transition-colors";

const BASEMAP_PREVIEW: Record<
  string,
  { className: string; icon: React.ReactNode }
> = {
  claro: {
    className: "bg-gradient-to-br from-[#f3f3f6] to-[#dcdce4] text-[#7b7a94]",
    icon: <Sun2 size={18} />,
  },
  calles: {
    className: "bg-gradient-to-br from-[#f4efe2] to-[#e6dfca] text-[#8b7f5d]",
    icon: <Streets size={18} />,
  },
  satelite: {
    className: "bg-gradient-to-br from-[#4d6b4a] to-[#2d4430] text-white/80",
    icon: <Routing2 size={18} />,
  },
  oscuro: {
    className: "bg-gradient-to-br from-[#1d1b2e] to-[#0d0c18] text-white/80",
    icon: <Moon size={18} />,
  },
};

export default function MapControls({
  map,
  mapStyle,
  onChangeStyle,
}: MapControlsProps) {
  const [panelOpen, setPanelOpen] = useState(false);

  const locate = () => {
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) =>
        map.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14 }),
      () => undefined,
      { enableHighAccuracy: true, timeout: 6000 },
    );
  };

  return (
    <>
      <div className="absolute right-4 bottom-4 z-20 flex flex-col items-end gap-3">
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className={`${glass} p-3 flex flex-col gap-2`}
            >
              <span className="flex items-center gap-1.5 text-xs font-medium text-nx-text-2 px-1">
                <Layers size={14} />
                Cartografía
              </span>
              <div className="flex gap-2">
                {MAP_BASEMAPS.map((b) => {
                  const active = b.value === mapStyle;
                  const preview = BASEMAP_PREVIEW[b.key];
                  return (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => onChangeStyle(b.value)}
                      aria-pressed={active}
                      className="flex flex-col items-center gap-1 group"
                    >
                      <span
                        className={`size-14 rounded-2xl flex items-center justify-center border-2 transition-colors ${
                          preview.className
                        } ${
                          active
                            ? "border-nx-purple"
                            : "border-transparent group-hover:border-nx-line"
                        }`}
                      >
                        {preview.icon}
                      </span>
                      <span
                        className={`text-[11px] ${
                          active
                            ? "font-semibold text-nx-purple"
                            : "text-nx-text-2"
                        }`}
                      >
                        {b.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-3">
          <div className={`${glass} p-1 flex flex-col`}>
            <button
              type="button"
              aria-label="Cartografía"
              aria-pressed={panelOpen}
              onClick={() => setPanelOpen((v) => !v)}
              className={`${btn} ${panelOpen ? "bg-nx-surface-2 text-nx-purple" : ""}`}
            >
              <Layers size={19} />
            </button>
            <button
              type="button"
              aria-label="Mi ubicación"
              onClick={locate}
              className={btn}
            >
              <Gps size={19} />
            </button>
          </div>

          <div className={`${glass} p-1 flex flex-col`}>
            <button
              type="button"
              aria-label="Acercar"
              onClick={() => map.zoomIn()}
              className={btn}
            >
              <AddCircle size={19} />
            </button>
            <button
              type="button"
              aria-label="Alejar"
              onClick={() => map.zoomOut()}
              className={btn}
            >
              <MinusCircle size={19} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
