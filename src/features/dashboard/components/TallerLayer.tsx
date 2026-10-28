import { useEffect, useRef } from "react";
import type { Map as MapboxMap, GeoJSONSource } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";


export interface Taller {
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

interface Props {
  map: MapboxMap;
  talleres: Taller[];
  onSelect?: (taller: Taller) => void;
}

export default function TallerLayer({ map, talleres, onSelect }: Props) {
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const beforeLayer = map.getLayer("clusters") ? "clusters" : undefined;

  useEffect(() => {
    if (!map || !talleres.length) return;

    const geojson = {
      type: "FeatureCollection",
      features: talleres
        .map((t) => ({
          type: "Feature",
          properties: {
            ...t,
            icon: t.tipo === 1 ? "icon-distribuidor" : "icon-taller",
          },
          geometry: {
            type: "Point",
            coordinates: [Number(t.longitud), Number(t.latitud)],
          },
        }))
        .filter(
          (f) =>
            !isNaN(f.geometry.coordinates[0]) &&
            !isNaN(f.geometry.coordinates[1])
        ),
    };

    if (map.getSource("talleres")) {
      (map.getSource("talleres") as GeoJSONSource).setData(
        geojson as any
      );
      return;
    }

    map.addSource("talleres", {
      type: "geojson",
      data: geojson as any,
    });

    map.addLayer(
      {
        id: "talleres-layer",
        type: "symbol",
        source: "talleres",
        layout: {
          "icon-image": ["get", "icon"],
          "icon-size": 0.06,
          "icon-allow-overlap": true,
        },
      },
      beforeLayer
    );

    map.on("click", "talleres-layer", (e) => {
      const feature = e.features?.[0];
      if (!feature) return;

      map.easeTo({
        center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
        duration: 500,
      });
      onSelectRef.current?.(feature.properties as unknown as Taller);
    });

    map.on("mouseenter", "talleres-layer", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "talleres-layer", () => {
      map.getCanvas().style.cursor = "";
    });

    map.loadImage("/taller.png", (err, image) => {
      if (err || !image) return;
      if (!map.hasImage("icon-taller")) {
        map.addImage("icon-taller", image);
      }
    });
    map.loadImage("/distribuidor.png", (err, image) => {
      if (err || !image) return;
      if (!map.hasImage("icon-distribuidor")) {
        map.addImage("icon-distribuidor", image);
      }
    });
  }, [map, talleres]);

  return null;
}