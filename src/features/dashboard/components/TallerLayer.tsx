import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapPopupContent from "./MapPopupContent";
import { Bus, MapPoint, ShockAbsorber, UserCheck, UserId, UserRounded, WalkingRound } from "@solar-icons/react";


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

interface Props {
  map: mapboxgl.Map;
  talleres: Taller[];
}

export default function TallerLayer({ map, talleres }: Props) {
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
      (map.getSource("talleres") as mapboxgl.GeoJSONSource).setData(
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
      if (!e.features?.length) return;

      const feature = e.features[0];
      const taller = feature.properties as unknown as Taller;

      const container = document.createElement("div");
      const root = createRoot(container);
      root.render(
        <MapPopupContent
          title={taller.nombre}
          headerIcon={
            taller.tipo === 1 ? (
              <WalkingRound className="w-5 h-5" />
            ) : (
              <ShockAbsorber className="w-5 h-5" />
            )
          }
          fields={[
            {
              label: taller.tipo === 1 ? "Distribuidor" : "Taller",
              value: taller.nombre,
              icon: <Bus />,
              bold: true,
            },
            { label: "Dirección", value: taller.direccion, icon: <MapPoint /> },
            { label: "Supervisor", value: taller.supervisor, icon: <UserRounded /> },
            { label: "Coordinador", value: taller.coordinador, icon: <UserCheck /> },
            { label: "Razón Social", value: taller.razon_social, icon: <UserId /> },
          ]}
        />
      );

      const popup = new mapboxgl.Popup({ closeButton: true })
        .setLngLat(
          (feature.geometry as GeoJSON.Point).coordinates as [number, number]
        )
        .setDOMContent(container)
        .addTo(map);

      popup.on("close", () => {
        root.unmount();
      });
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