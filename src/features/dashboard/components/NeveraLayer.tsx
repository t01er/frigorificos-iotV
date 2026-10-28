import { useEffect, useRef } from "react";
import type { Map as MapboxMap, GeoJSONSource } from "mapbox-gl";
import type { Feature, GeoJsonProperties, Point } from "geojson";

interface Nevera {
  cod_nevera: string;
  distribuidor: string;
  latitud: string;
  longitud: string;
  estado_alarma: number;
}

interface NeveraLayerProps {
  map: MapboxMap;
  neveras: Nevera[];
  onSelect?: (codigo: string, estado: number) => void;
}

export const ESTADO_NEVERA_COLORS: Record<number, string> = {
  0: "#9593ae", // Por configurar
  1: "#e5484d", // Fuera de zona
  2: "#7b2ff2", // Cartera
  3: "#2f6bff", // Censo
  4: "#22c7ee", // Instalación
  5: "#17123a", // Taller
  6: "#5f5d7a", // Distribuidor
  7: "#e8a21a", // Desconexión de energía
  8: "#8582a0", // Fuera de línea
  9: "#c6c4d8", // Mantenimiento
};

export default function NeveraLayer({ map, neveras, onSelect }: NeveraLayerProps) {
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!map) return;

    const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: "FeatureCollection",
      features: (neveras ?? [])
        .map((nevera): Feature<Point, GeoJsonProperties> => ({
          type: "Feature",
          properties: {
            codigo: nevera.cod_nevera,
            distribuidor: nevera.distribuidor,
            estado: nevera.estado_alarma,
            color: ESTADO_NEVERA_COLORS[nevera.estado_alarma] ?? "#9593ae",
          },
          geometry: {
            type: "Point",
            coordinates: [
              parseFloat(nevera.longitud),
              parseFloat(nevera.latitud),
            ],
          },
        }))
        .filter(
          (f) =>
            !isNaN(f.geometry.coordinates[0]) &&
            !isNaN(f.geometry.coordinates[1])
        ),
    };

    if (!map.isStyleLoaded()) {
      map.once("idle", () => updateLayer());
      return;
    }

    updateLayer();

    function updateLayer() {
      const source = map.getSource("sensors") as
        | GeoJSONSource
        | undefined;

      if (source) {
        source.setData(geojson);
        return;
      }

      map.addSource("sensors", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 100,
      });

      // Halo suave detrás de cada agrupación
      map.addLayer({
        id: "clusters-halo",
        type: "circle",
        source: "sensors",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#7b2ff2",
          "circle-opacity": 0.18,
          "circle-radius": [
            "step",
            ["get", "point_count"],
            26,
            100,
            32,
            1000,
            40,
          ],
          "circle-blur": 0.4,
        },
      });

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "sensors",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#7b2ff2",
          "circle-radius": [
            "step",
            ["get", "point_count"],
            17,
            100,
            21,
            1000,
            26,
          ],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "sensors",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Pro Bold", "Arial Unicode MS Bold"],
          "text-size": 12,
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#ffffff",
        },
      });

      map.addLayer({
        id: "sensor-points",
        type: "circle",
        source: "sensors",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-radius": 8,
          "circle-color": ["get", "color"],
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });

        if (!features.length) return;

        const clusterId = (features[0].properties as any)?.cluster_id;
        const sourceGeo = map.getSource("sensors") as GeoJSONSource;

        sourceGeo.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || zoom === null || zoom === undefined) return;
          const geometry = features[0].geometry as Point;

          map.easeTo({
            center: geometry.coordinates as [number, number],
            zoom,
          });
        });
      });

      map.on("click", "sensor-points", (e) => {
        const feature = e.features?.[0];
        const props = feature?.properties as
          | { codigo?: string; estado?: number }
          | undefined;
        if (!feature || !props?.codigo) return;

        const geometry = feature.geometry as Point;
        map.easeTo({
          center: geometry.coordinates as [number, number],
          duration: 500,
        });
        onSelectRef.current?.(props.codigo, Number(props.estado));
      });

      for (const layer of ["sensor-points", "clusters"]) {
        map.on("mouseenter", layer, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layer, () => {
          map.getCanvas().style.cursor = "";
        });
      }
    }

    if (map.getLayer("talleres-layer")) {
      map.moveLayer("clusters-halo");
      map.moveLayer("clusters");
      map.moveLayer("cluster-count");
      map.moveLayer("sensor-points");
    }
  }, [map, neveras]);

  return null;
}
