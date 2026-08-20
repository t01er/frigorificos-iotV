import { useEffect } from "react";
import { Modal, ModalContent, ModalHeader, Spinner } from "@heroui/react";
import mapboxgl from "mapbox-gl";
import BigMap from "./BigMap";
import {
  useGetMovimientosDispositivoQuery,
  type CoordenadaMovimiento,
  type PuntoControl,
} from "../services/mapApi";

interface RecorridoMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  imei: string | null;
  mapStyle?: string;
}

interface RecorridoLayersProps {
  map: mapboxgl.Map;
  coordenadas: CoordenadaMovimiento[];
  puntosControl: PuntoControl[];
}

const TIPO_PUNTO_COLORES = {
  cartera: "#003595",
  censo: "#4E95D9",
  instalacion: "#00A5E8",
  zona: "#F28B00",
  energia: "#FFD200",
  linea: "#000000",
  taller: "#7F7F7F",
  distribuidor: "#A7A7A7",
  otro_estado: "#D9D9D9",
  default: "#808080",
} as const;

const getColorForPuntoDeControl = (nombre: string): string => {
  const lower = nombre.toLowerCase();

  if (lower.includes("censo")) return TIPO_PUNTO_COLORES.censo;
  if (lower.includes("cartera")) return TIPO_PUNTO_COLORES.cartera;
  if (lower.includes("instalacion")) return TIPO_PUNTO_COLORES.instalacion;
  if (lower.includes("zona")) return TIPO_PUNTO_COLORES.zona;
  if (lower.includes("energia")) return TIPO_PUNTO_COLORES.energia;
  if (lower.includes("linea")) return TIPO_PUNTO_COLORES.linea;
  if (lower.includes("taller")) return TIPO_PUNTO_COLORES.taller;
  if (lower.includes("distribuidor")) return TIPO_PUNTO_COLORES.distribuidor;
  if (lower.includes("otro")) return TIPO_PUNTO_COLORES.otro_estado;

  return TIPO_PUNTO_COLORES.default;
};

function createGeoJSONCircle(center: [number, number], radiusInMeters: number, points = 32): GeoJSON.Polygon {
  const [lng, lat] = center;
  const coords = [];
  const km = radiusInMeters / 1000;
  const distanceX = km / (111.320 * Math.cos((lat * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    coords.push([lng + x, lat + y]);
  }
  coords.push(coords[0]);

  return {
    type: "Polygon",
    coordinates: [coords],
  };
}

function RecorridoLayers({ map, coordenadas, puntosControl }: RecorridoLayersProps) {
  useEffect(() => {
    if (!map) return;

    const markers: mapboxgl.Marker[] = [];

    coordenadas.forEach((c, idx) => {
      const lng = parseFloat(c.lng);
      const lat = parseFloat(c.lat);
      if (isNaN(lng) || isNaN(lat)) return;

      let fillColor = "#1C258F"; 
      let etiquetaPunto = `Punto #${idx + 1}`;

      if (idx === 0) {
        fillColor = "#0CDDEE"; 
        etiquetaPunto += " (Inicio)";
      } else if (idx === coordenadas.length - 1) {
        fillColor = "#62EF20"; 
        etiquetaPunto += " (Fin)";
      }

      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; color: #333;">
          <p style="margin: 0 0 4px 0; font-weight: bold; color: ${fillColor}; font-size: 13px;">
            ${etiquetaPunto}
          </p>
          <b>Cód. Nevera:</b> ${c.movCodNevera || "N/A"}<br/>
          <b>Distribuidor:</b> ${c.movDistribuidor || "N/A"}<br/>
          <b>Batería:</b> ${c.movBateria}%<br/>
          <b>Señal:</b> ${c.movSignal}<br/>
          <b>Latitud:</b> ${c.lat}<br/>
          <b>Longitud:</b> ${c.lng}<br/>
          <b>Fecha:</b> ${c.fechaRegistroDis}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml);
      const marker = new mapboxgl.Marker({ color: fillColor })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markers.push(marker);
    });

    const circleFeatures: GeoJSON.Feature[] = [];

    puntosControl.forEach((pc) => {
      const lng = parseFloat(pc.longitud);
      const lat = parseFloat(pc.latitud);
      if (isNaN(lng) || isNaN(lat)) return;

      const color = getColorForPuntoDeControl(pc.punto_control);

      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; line-height: 1.4; color: #333;">
          <p style="margin: 0 0 4px 0; font-weight: bold; color: ${color}; font-size: 13px;">
            Punto de Control: ${pc.punto_control}
          </p>
          <b>Código:</b> ${pc.codigo}<br/>
          <b>Radio:</b> ${pc.radio}m<br/>
          <b>Última Act.:</b> ${pc.fecha_ultima_actualizacion}<br/>
          <b>Latitud:</b> ${pc.latitud}<br/>
          <b>Longitud:</b> ${pc.longitud}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml);
      const marker = new mapboxgl.Marker({ color })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markers.push(marker);

      if (pc.radio && pc.radio > 0) {
        circleFeatures.push({
          type: "Feature",
          properties: { color },
          geometry: createGeoJSONCircle([lng, lat], pc.radio),
        });
      }
    });

    const controlCirclesSourceId = "control-circles-source";
    const controlCirclesFillLayerId = "control-circles-fill";
    const controlCirclesLineLayerId = "control-circles-line";

    const circlesGeojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: circleFeatures,
    };

    if (map.getSource(controlCirclesSourceId)) {
      (map.getSource(controlCirclesSourceId) as mapboxgl.GeoJSONSource).setData(circlesGeojson);
    } else {
      map.addSource(controlCirclesSourceId, {
        type: "geojson",
        data: circlesGeojson,
      });

      map.addLayer({
        id: controlCirclesFillLayerId,
        type: "fill",
        source: controlCirclesSourceId,
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": 0.2,
        },
      });

      map.addLayer({
        id: controlCirclesLineLayerId,
        type: "line",
        source: controlCirclesSourceId,
        paint: {
          "line-color": "#4285F4",
          "line-width": 2,
          "line-opacity": 0.5,
        },
      });
    }

    const lineCoords = coordenadas
      .map((c) => [parseFloat(c.lng), parseFloat(c.lat)])
      .filter((coord) => !isNaN(coord[0]) && !isNaN(coord[1]));

    const sourceId = "recorrido-source";
    const layerId = "recorrido-layer";
    const arrowLayerId = "recorrido-arrows";

    const lineGeojson: GeoJSON.Feature = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: lineCoords,
      },
    };

    if (map.getSource(sourceId)) {
      (map.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(lineGeojson);
    } else {
      map.addSource(sourceId, {
        type: "geojson",
        data: lineGeojson,
      });

      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#FF0000",
          "line-width": 3,
          "line-opacity": 1,
        },
      });

      map.addLayer({
        id: arrowLayerId,
        type: "symbol",
        source: sourceId,
        layout: {
          "symbol-placement": "line",
          "symbol-spacing": 60,
          "text-field": "▶",
          "text-size": 11,
          "text-keep-upright": false,
          "text-rotation-alignment": "map",
        },
        paint: {
          "text-color": "#FF0000",
        },
      });
    }

    const allPoints = [
      ...lineCoords,
      ...puntosControl.map((pc) => [parseFloat(pc.longitud), parseFloat(pc.latitud)]),
    ].filter((pt) => !isNaN(pt[0]) && !isNaN(pt[1]));

    if (allPoints.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      allPoints.forEach((pt) => bounds.extend(pt as [number, number]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 16 });
    }

    return () => {
      markers.forEach((m) => m.remove());

      try {
        if (map && map.getStyle()) {
          if (map.getLayer(arrowLayerId)) map.removeLayer(arrowLayerId);
          if (map.getLayer(layerId)) map.removeLayer(layerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);

          if (map.getLayer(controlCirclesLineLayerId)) map.removeLayer(controlCirclesLineLayerId);
          if (map.getLayer(controlCirclesFillLayerId)) map.removeLayer(controlCirclesFillLayerId);
          if (map.getSource(controlCirclesSourceId)) map.removeSource(controlCirclesSourceId);
        }
      } catch {
      }
    };
  }, [map, coordenadas, puntosControl]);

  return null;
}

export default function RecorridoMapModal({
  isOpen,
  onClose,
  imei,
  mapStyle = "mapbox://styles/mapbox/streets-v12",
}: RecorridoMapModalProps) {
  const { data, isLoading, isFetching } = useGetMovimientosDispositivoQuery(imei ?? "", {
    skip: !imei || !isOpen,
  });

  const coordenadas = data?.data?.coordenadas ?? [];
  const puntosControl = data?.control ?? [];

  const defaultCenter: [number, number] =
    coordenadas.length > 0
      ? [parseFloat(coordenadas[0].lng), parseFloat(coordenadas[0].lat)]
      : [-75.21298, -12.04233];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-base font-semibold">
          <span>Recorrido del Dispositivo</span>
          {imei && (
            <span className="text-xs font-normal text-default-500">
              IMEI: <strong className="text-primary">{imei}</strong> | Locación:{" "}
              <strong>{data?.data?.locacion ?? "Cargando..."}</strong>
            </span>
          )}
        </ModalHeader>

        <div className="relative p-0 h-[500px] overflow-hidden rounded-b-lg bg-gray-100">
          {(isLoading || isFetching) && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/75 gap-2">
              <Spinner size="lg" color="primary" />
              <span className="text-xs text-gray-500">Cargando recorrido del dispositivo...</span>
            </div>
          )}

          <BigMap center={defaultCenter} zoom={14} mapStyle={mapStyle}>
            {(map) => (
              <RecorridoLayers
                map={map}
                coordenadas={coordenadas}
                puntosControl={puntosControl}
              />
            )}
          </BigMap>
        </div>
      </ModalContent>
    </Modal>
  );
}