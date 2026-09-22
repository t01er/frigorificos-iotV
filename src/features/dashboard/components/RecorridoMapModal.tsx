import { useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Modal, ModalContent, ModalHeader, Spinner } from "@heroui/react";
import mapboxgl from "mapbox-gl";
import BigMap from "./BigMap";
import MapPopupContent from "./MapPopupContent";
import { BatteryFull, Bus, ClockCircle, Fridge, MapPoint, Radar, WalkingRound, WiFiRouter } from "@solar-icons/react";
import {
  useGetMovimientosDispositivoQuery,
  type CoordenadaMovimiento,
  type PuntoControl,
} from "../services/mapApi";

interface RecorridoMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  imei: string | null;
  codNevera: string | null;
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

function createGeoJSONCircle(
  center: [number, number],
  radiusInMeters: number,
  points = 32
): GeoJSON.Polygon {
  const [lng, lat] = center;
  const coords = [];
  const km = radiusInMeters / 1000;
  const distanceX = km / (111.32 * Math.cos((lat * Math.PI) / 180));
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

function calculateBearing(start: [number, number], end: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const [lng1, lat1] = [toRad(start[0]), toRad(start[1])];
  const [lng2, lat2] = [toRad(end[0]), toRad(end[1])];

  const y = Math.sin(lng2 - lng1) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(lng2 - lng1);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

interface CoordenadaPointProps {
  tipo: "inicio" | "fin" | "normal";
  color: string;
  etiqueta: string;
  movCodNevera: string;
  movDistribuidor: string;
  movBateria: number | string;
  movSignal: string | number;
  lat: string;
  lng: string;
  fechaRegistroDis: string;
  bearing: number;
}

interface PuntoControlFeatureProps {
  codigo: string;
  punto_control: string;
  color: string;
  radio: number;
  latitud: string;
  longitud: string;
  fecha_ultima_actualizacion: string;
  tipo: "control";
  popupData: string;
}

function RecorridoLayers({ map, coordenadas, puntosControl }: RecorridoLayersProps) {
  useEffect(() => {
    if (!map) return;

    const roots: Root[] = [];
    let activePopup: mapboxgl.Popup | null = null;

    const puntosControlSourceId = "puntos-control-source";
    const puntosControlLayerId = "puntos-control-layer";

    const puntosControlFeatures: GeoJSON.Feature[] = puntosControl
      .map((pc) => {
        const lng = parseFloat(pc.longitud);
        const lat = parseFloat(pc.latitud);
        if (isNaN(lng) || isNaN(lat)) return null;

        const color = getColorForPuntoDeControl(pc.punto_control);

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          properties: {
            codigo: pc.codigo,
            punto_control: pc.punto_control,
            color: color,
            radio: pc.radio || 0,
            latitud: pc.latitud,
            longitud: pc.longitud,
            fecha_ultima_actualizacion: pc.fecha_ultima_actualizacion,
            tipo: "control",
            popupData: JSON.stringify({
              codigo: pc.codigo,
              punto_control: pc.punto_control,
              radio: pc.radio,
              fecha_ultima_actualizacion: pc.fecha_ultima_actualizacion,
              latitud: pc.latitud,
              longitud: pc.longitud,
              color: color,
            }),
          },
        } as GeoJSON.Feature;
      })
      .filter((f): f is GeoJSON.Feature => f !== null);

    const puntosControlGeojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: puntosControlFeatures,
    };

    const controlCirclesSourceId = "control-circles-source";
    const controlCirclesFillLayerId = "control-circles-fill";
    const controlCirclesLineLayerId = "control-circles-line";

    const circleFeatures: GeoJSON.Feature[] = puntosControl
      .map((pc) => {
        const lng = parseFloat(pc.longitud);
        const lat = parseFloat(pc.latitud);
        if (isNaN(lng) || isNaN(lat) || !pc.radio || pc.radio <= 0) return null;

        const color = getColorForPuntoDeControl(pc.punto_control);

        return {
          type: "Feature",
          properties: {
            color,
            radio: pc.radio,
          },
          geometry: createGeoJSONCircle([lng, lat], pc.radio),
        } as GeoJSON.Feature;
      })
      .filter((f): f is GeoJSON.Feature => f !== null);

    const circlesGeojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: circleFeatures,
    };

    const coordenadasSourceId = "coordenadas-source";
    const coordenadasNormalLayerId = "coordenadas-normal-layer";
    const coordenadasFinLayerId = "coordenadas-fin-layer";
    const coordenadasInicioLayerId = "coordenadas-inicio-layer";
    const coordenadasLayerIds = [
      coordenadasNormalLayerId,
      coordenadasFinLayerId,
      coordenadasInicioLayerId,
    ];

    const coordenadasFeatures: GeoJSON.Feature[] = coordenadas
      .map((c, idx) => {
        const lng = parseFloat(c.lng);
        const lat = parseFloat(c.lat);
        if (isNaN(lng) || isNaN(lat)) return null;

        let tipo: CoordenadaPointProps["tipo"] = "normal";
        let color = "#1C258F";
        let etiqueta = `Punto #${idx + 1}`;
        let bearing = 0;

        if (idx === 0) {
          tipo = "inicio";
          color = "#0CDDEE";
          etiqueta += " (Inicio)";
        } else if (idx === coordenadas.length - 1) {
          tipo = "fin";
          color = "#62EF20";
          etiqueta += " (Fin)";

          const prev = coordenadas[idx - 1];
          if (prev) {
            const prevLng = parseFloat(prev.lng);
            const prevLat = parseFloat(prev.lat);
            if (!isNaN(prevLng) && !isNaN(prevLat)) {
              bearing = calculateBearing([prevLng, prevLat], [lng, lat]);
            }
          }
        }

        const props: CoordenadaPointProps = {
          tipo,
          color,
          etiqueta,
          movCodNevera: c.movCodNevera || "N/A",
          movDistribuidor: c.movDistribuidor || "N/A",
          movBateria: c.movBateria,
          movSignal: c.movSignal,
          lat: c.lat,
          lng: c.lng,
          fechaRegistroDis: c.fechaRegistroDis,
          bearing,
        };

        return {
          type: "Feature",
          properties: props,
          geometry: { type: "Point", coordinates: [lng, lat] },
        } as GeoJSON.Feature;
      })
      .filter((f): f is GeoJSON.Feature => f !== null);

    const coordenadasGeojson: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: coordenadasFeatures,
    };

    if (map.getSource(puntosControlSourceId)) {
      (map.getSource(puntosControlSourceId) as mapboxgl.GeoJSONSource).setData(puntosControlGeojson);
    } else {
      map.addSource(puntosControlSourceId, {
        type: "geojson",
        data: puntosControlGeojson,
      });
      map.addLayer({
        id: puntosControlLayerId,
        type: "circle",
        source: puntosControlSourceId,
        paint: {
          "circle-radius": 10,
          "circle-color": ["get", "color"],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-opacity": 0.9,
        },
      });
    }

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
          "fill-opacity": 0.15,
        },
      });

      map.addLayer({
        id: controlCirclesLineLayerId,
        type: "line",
        source: controlCirclesSourceId,
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2,
          "line-opacity": 0.6,
          "line-dasharray": [4, 4],
        },
      });
    }

    if (map.getSource(coordenadasSourceId)) {
      (map.getSource(coordenadasSourceId) as mapboxgl.GeoJSONSource).setData(coordenadasGeojson);
    } else {
      map.addSource(coordenadasSourceId, {
        type: "geojson",
        data: coordenadasGeojson,
      });

      map.addLayer({
        id: coordenadasNormalLayerId,
        type: "circle",
        source: coordenadasSourceId,
        filter: ["==", ["get", "tipo"], "normal"],
        paint: {
          "circle-radius": 1,
          "circle-color": ["get", "color"],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-opacity": 0.8,
        },
      });

      map.addLayer({
        id: coordenadasFinLayerId,
        type: "symbol",
        source: coordenadasSourceId,
        filter: ["==", ["get", "tipo"], "fin"],
        layout: {
          "text-field": "▲",
          "text-size": 20,
          "text-rotate": ["get", "bearing"],
          "text-rotation-alignment": "map",
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#62EF20",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      });

      map.addLayer({
        id: coordenadasInicioLayerId,
        type: "circle",
        source: coordenadasSourceId,
        filter: ["==", ["get", "tipo"], "inicio"],
        paint: {
          "circle-radius": 5,
          "circle-color": ["get", "color"],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
          "circle-stroke-opacity": 0.8,
        },
      });
    }

    const handlePuntoControlClick = (
      e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }
    ) => {
      if (!e.features?.length) return;
      const feature = e.features[0];
      const props = feature.properties as unknown as PuntoControlFeatureProps;
      const geometry = feature.geometry as GeoJSON.Point;
      const coords = geometry.coordinates.slice() as [number, number];

      while (Math.abs(e.lngLat.lng - coords[0]) > 180) {
        coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;
      }

      if (activePopup) {
        activePopup.remove();
        activePopup = null;
      }

      const popupData = JSON.parse(props.popupData);

      const container = document.createElement("div");
      const root = createRoot(container);
      roots.push(root);

      root.render(
        <MapPopupContent
          title={popupData.punto_control}
          headerIcon={<MapPoint className="w-5 h-5" />}
          accentColor={popupData.color}
          fields={[
            { label: "Código", value: popupData.codigo, icon: <Fridge />, bold: true },
            { label: "Radio", value: `${popupData.radio}m`, icon: <Radar /> },
            { label: "Última Transmisión", value: popupData.fecha_ultima_actualizacion, icon: <ClockCircle /> },
            {
              label: "Ubicación",
              value: `${popupData.latitud}, ${popupData.longitud}`,
              icon: <MapPoint />,
            },
          ]}
        />
      );

      activePopup = new mapboxgl.Popup({ offset: 25, closeButton: true })
        .setLngLat(coords)
        .setDOMContent(container)
        .addTo(map);

      const popupElem = activePopup.getElement();
      if (popupElem) {
        popupElem.style.zIndex = "9999";
      }
    };

    const handleCoordenadaClick = (
      e: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }
    ) => {
      if (!e.features?.length) return;
      const feature = e.features[0];
      const props = feature.properties as unknown as CoordenadaPointProps;
      const geometry = feature.geometry as GeoJSON.Point;
      const coords = geometry.coordinates.slice() as [number, number];

      while (Math.abs(e.lngLat.lng - coords[0]) > 180) {
        coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;
      }

      if (activePopup) {
        activePopup.remove();
        activePopup = null;
      }

      const container = document.createElement("div");
      const root = createRoot(container);
      roots.push(root);

      root.render(
        <MapPopupContent
          title={props.etiqueta}
          headerIcon={<Bus className="w-5 h-5" />}
          accentColor={props.color}
          fields={[
            { label: "Cód. Nevera", value: props.movCodNevera, icon: <Fridge />, bold: true },
            { label: "Distribuidor", value: props.movDistribuidor, icon: <WalkingRound /> },
            { label: "Batería", value: `${props.movBateria}`, icon: <BatteryFull /> },
            { label: "Señal", value: props.movSignal, icon: <WiFiRouter /> },
            {
              label: "Ubicación",
              value: `${props.lat}, ${props.lng}`,
              icon: <MapPoint />,
            },
            { label: "Fecha", value: props.fechaRegistroDis, icon: <ClockCircle /> },
          ]}
        />
      );

      activePopup = new mapboxgl.Popup({ offset: 15, closeButton: true })
        .setLngLat(coords)
        .setDOMContent(container)
        .addTo(map);

      const popupElem = activePopup.getElement();
      if (popupElem) {
        popupElem.style.zIndex = "9999";
      }
    };

    map.on("click", puntosControlLayerId, handlePuntoControlClick);
    map.on("mouseenter", puntosControlLayerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", puntosControlLayerId, () => {
      map.getCanvas().style.cursor = "";
    });

    coordenadasLayerIds.forEach((id) => {
      map.on("click", id, handleCoordenadaClick);
      map.on("mouseenter", id, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", id, () => {
        map.getCanvas().style.cursor = "";
      });
    });

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
          "text-size": 30,
          "text-keep-upright": false,
          "text-rotation-alignment": "map",
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#FF0000",
        },
      });
    }

    if (map.getLayer(puntosControlLayerId)) {
      map.moveLayer(puntosControlLayerId);
    }
    if (map.getLayer(coordenadasFinLayerId)) {
      map.moveLayer(coordenadasFinLayerId);
    }
    if (map.getLayer(coordenadasInicioLayerId)) {
      map.moveLayer(coordenadasInicioLayerId);
    }
    if (map.getLayer(coordenadasNormalLayerId)) {
      map.moveLayer(coordenadasNormalLayerId);
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
      if (activePopup) activePopup.remove();
      roots.forEach((r) => r.unmount());

      map.off("click", puntosControlLayerId, handlePuntoControlClick);

      coordenadasLayerIds.forEach((id) => {
        map.off("click", id, handleCoordenadaClick);
      });

      try {
        if (map && map.getStyle()) {
          if (map.getLayer(puntosControlLayerId)) map.removeLayer(puntosControlLayerId);
          if (map.getSource(puntosControlSourceId)) map.removeSource(puntosControlSourceId);

          if (map.getLayer(controlCirclesLineLayerId)) map.removeLayer(controlCirclesLineLayerId);
          if (map.getLayer(controlCirclesFillLayerId)) map.removeLayer(controlCirclesFillLayerId);
          if (map.getSource(controlCirclesSourceId)) map.removeSource(controlCirclesSourceId);

          coordenadasLayerIds.forEach((id) => {
            if (map.getLayer(id)) map.removeLayer(id);
          });
          if (map.getSource(coordenadasSourceId)) map.removeSource(coordenadasSourceId);

          if (map.getLayer(arrowLayerId)) map.removeLayer(arrowLayerId);
          if (map.getLayer(layerId)) map.removeLayer(layerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
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
  codNevera,
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
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-base font-semibold">
          <span>Recorrido del Dispositivo</span>
          {imei && (
            <span className="text-xs font-normal text-default-500">
              Código Nevera:{" "}
              <strong className="text-primary">
                {codNevera}
              </strong>{" "}
              | IMEI:{" "}
              <strong className="text-primary">
                {imei}
              </strong>{" "}
              | Locación:{" "}
              <strong>
                {data?.data?.locacion ?? "Cargando..."}
              </strong>
            </span>
          )}

        </ModalHeader>

        <div className="relative p-0 h-175 overflow-hidden rounded-b-lg bg-gray-100">
          {(isLoading || isFetching) && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/75 gap-2">
              <Spinner size="lg" color="primary" />
              <span className="text-xs text-gray-500">Cargando recorrido del dispositivo...</span>
            </div>
          )}

          <BigMap center={defaultCenter} zoom={14} mapStyle={mapStyle}>
            {(map) => (
              <RecorridoLayers map={map} coordenadas={coordenadas} puntosControl={puntosControl} />
            )}
          </BigMap>
        </div>
      </ModalContent>
    </Modal>
  );
}