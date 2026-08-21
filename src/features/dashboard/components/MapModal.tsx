import { useEffect, useRef, useMemo } from "react";
import { Modal, ModalContent, ModalHeader } from "@heroui/react";
import mapboxgl from "mapbox-gl";
import { Provider } from "react-redux";
import { store } from "../../../app/store"; 
import BigMap from "./BigMap";
import PopupLayer from "./PopupLayer";

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


interface NeveraModalData {
  cod_nevera: string;
  imei?: string;
  latitud: string;
  longitud: string;
  alert_evento?: string;
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  nevera: NeveraModalData | null;
  mapStyle?: string;
}

const getColorForEvento = (evento?: string): string => {
  if (!evento) return TIPO_PUNTO_COLORES.default;
  
  const lowerEvento = evento.toLowerCase();
  
  if (lowerEvento.includes("cartera")) return TIPO_PUNTO_COLORES.cartera;
  if (lowerEvento.includes("censo")) return TIPO_PUNTO_COLORES.censo;
  if (lowerEvento.includes("instalacion")) return TIPO_PUNTO_COLORES.instalacion;
  if (lowerEvento.includes("zona")) return TIPO_PUNTO_COLORES.zona;
  if (lowerEvento.includes("energia") || lowerEvento.includes("energía")) return TIPO_PUNTO_COLORES.energia;
  if (lowerEvento.includes("linea") || lowerEvento.includes("línea")) return TIPO_PUNTO_COLORES.linea;
  if (lowerEvento.includes("taller")) return TIPO_PUNTO_COLORES.taller;
  if (lowerEvento.includes("distribuidor")) return TIPO_PUNTO_COLORES.distribuidor;
  if (lowerEvento.includes("otro")) return TIPO_PUNTO_COLORES.otro_estado;
  
  return TIPO_PUNTO_COLORES.default;
};

function SingleMarker({ 
  map, 
  lng, 
  lat, 
  imei,
  evento
}: { 
  map: mapboxgl.Map; 
  lng: number; 
  lat: number;
  imei?: string;
  evento?: string;
}) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const color = useMemo(() => getColorForEvento(evento), [evento]);

  useEffect(() => {
    const markerElement = document.createElement("div");
    markerElement.style.width = "20px";
    markerElement.style.height = "20px";
    markerElement.style.borderRadius = "50%";
    markerElement.style.backgroundColor = color;
    markerElement.style.border = "3px solid white";
    markerElement.style.boxShadow = `0 0 15px ${color}80`;
    markerElement.style.cursor = "pointer";
    markerElement.style.transition = "transform 0.2s ease";
    markerElement.style.position = "relative";
    markerElement.style.zIndex = "1";

    const container = document.createElement("div");
    container.style.width = "40px";
    container.style.height = "40px";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.position = "relative";
    container.style.zIndex = "1";
    container.style.cursor = "pointer";
    
    markerElement.style.position = "relative";
    container.appendChild(markerElement);

    container.addEventListener("mouseenter", () => {
      markerElement.style.transform = "scale(1.3)";
      markerElement.style.boxShadow = `0 0 25px ${color}CC`;
    });
    
    container.addEventListener("mouseleave", () => {
      markerElement.style.transform = "scale(1)";
      markerElement.style.boxShadow = `0 0 15px ${color}80`;
    });

    if (imei) {
      const popupContainer = document.createElement("div");
      popupContainer.style.minWidth = "200px";
      popupContainer.style.maxWidth = "320px";
      
      const root = document.createElement("div");
      popupContainer.appendChild(root);
      
      import("react-dom/client").then(({ createRoot }) => {
        const reactRoot = createRoot(root);
        reactRoot.render(
          <Provider store={store}>
            <PopupLayer codigo={imei} />
          </Provider>
        );
        (popupContainer as any).__reactRoot = reactRoot;
      });

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: "320px",
      })
        .setLngLat([lng, lat])
        .setDOMContent(popupContainer)
        .addTo(map);

      popupRef.current = popup;

      container.addEventListener("click", () => {
        if (popupRef.current) {
          if (popupRef.current.isOpen()) {
            popupRef.current.remove();
          } else {
            popupRef.current.addTo(map);
          }
        }
      });
    }

    const marker = new mapboxgl.Marker({ 
      element: container,
      anchor: "center" 
    })
      .setLngLat([lng, lat])
      .addTo(map);

    markerRef.current = marker;

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, [map, lng, lat, imei, color]);

  return null;
}

export default function MapModal({
  isOpen,
  onClose,
  nevera,
  mapStyle = "mapbox://styles/mapbox/streets-v12",
}: MapModalProps) {
  if (!nevera) return null;

  const lat = parseFloat(nevera.latitud);
  const lng = parseFloat(nevera.longitud);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex gap-2 text-base font-semibold">
          <div className="flex items-center gap-3">
            <span>Ubicación de Nevera : {nevera.cod_nevera}</span>
            {nevera.imei && <span className="text-sm font-normal text-zinc-500">IMEI:({nevera.imei})</span>}
            {nevera.alert_evento && (
              <span 
                className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                style={{ backgroundColor: getColorForEvento(nevera.alert_evento) }}
              >
                {nevera.alert_evento}
              </span>
            )}
          </div>
        </ModalHeader>
        <div className="p-0 h-[600px] overflow-hidden rounded-b-lg">
          <BigMap center={[lng, lat]} zoom={15} mapStyle={mapStyle}>
            {(map) => (
              <SingleMarker 
                map={map} 
                lng={lng} 
                lat={lat} 
                imei={nevera.cod_nevera}
                evento={nevera.alert_evento}
              />
            )}
          </BigMap>
        </div>
      </ModalContent>
    </Modal>
  );
}