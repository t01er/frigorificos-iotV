import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import type { Feature, GeoJsonProperties, Point } from "geojson";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "../../../app/store";
import PopupLayer from "./PopupLayer";

interface Nevera {
  cod_nevera: string;
  distribuidor: string;
  latitud: string;
  longitud: string;
  estado_alarma: number;
}

interface NeveraLayerProps {
  map: mapboxgl.Map;
  neveras: Nevera[];
}

export const ESTADO_NEVERA_COLORS: Record<number, string> = {
  0: "#6B7280", // Por configurar
  1: "#F28B00", // Fuera de zona
  2: "#003595", // Cartera
  3: "#4E95D9", // Censo
  4: "#00A5E8", // Instalación
  5: "#7F7F7F", // Taller
  6: "#A7A7A7", // Distribuidor
  7: "#FFD200", // Traslado
  8: "#000000", // Nestlé
  9: "#9CA3AF", // Mantenimiento
};


export default function NeveraLayer({ map, neveras }: NeveraLayerProps) {
  useEffect(() => {
    if (!map || !neveras?.length) return;

    interface NeveraFeature extends Feature<Point> {
      geometry: Point;
      properties: {
        color: string;
        name: string;
        codigo: string;
        estado: number;
      };
    }

    const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: "FeatureCollection",
      features: neveras
        .map((nevera): Feature<Point, GeoJsonProperties> => ({
          type: "Feature",
          properties: {
            codigo: nevera.cod_nevera,
            distribuidor: nevera.distribuidor,
            estado: nevera.estado_alarma,
            color: ESTADO_NEVERA_COLORS[nevera.estado_alarma] ?? "#22c55e",
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
        | mapboxgl.GeoJSONSource
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

      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "sensors",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#95d76a",
          "circle-radius": 18,
          "circle-opacity": 0.8,
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "sensors",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 12,
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "black",
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
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("click", "clusters", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });

        if (!features.length) return;

        const clusterId = (features[0].properties as any)?.cluster_id;
        const sourceGeo = map.getSource("sensors") as mapboxgl.GeoJSONSource;

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
        if (!e.features?.length) return;
        const feature = e.features[0] as unknown as NeveraFeature;
        const geometry = feature.geometry as Point;
        const props = feature.properties;
        if (!props) return;
        const container = document.createElement("div");
        const root = createRoot(container);
        root.render(
          <Provider store={store}>
            <PopupLayer codigo={props.codigo} />
          </Provider>
        );

        const popup = new mapboxgl.Popup({
          maxWidth: "350px",
        })
          .setLngLat(geometry.coordinates as [number, number])
          .setDOMContent(container)
          .addTo(map);

        popup.on("close", () => root.unmount());
      });

      map.on("mouseenter", "sensor-points", () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", "sensor-points", () => {
        map.getCanvas().style.cursor = "";
      });
    }
    if (map.getLayer("talleres-layer")) {
      map.moveLayer("clusters");
      map.moveLayer("cluster-count");
      map.moveLayer("sensor-points");
    }
  }, [map, neveras]);

  return null;
}