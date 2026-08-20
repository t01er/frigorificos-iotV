import { useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import mapboxgl from "mapbox-gl";
import BigMap from "./BigMap";

interface NeveraModalData {
  cod_nevera: string;
  imei?: string;
  latitud: string;
  longitud: string;
}

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  nevera: NeveraModalData | null;
  mapStyle?: string;
}

function SingleMarker({ map, lng, lat }: { map: mapboxgl.Map; lng: number; lat: number }) {
  useEffect(() => {
    const marker = new mapboxgl.Marker({ color: "#006FEE" })
      .setLngLat([lng, lat])
      .addTo(map);

    return () => {
      marker.remove();
    };
  }, [map, lng, lat]);

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
    <Modal isOpen={isOpen} onClose={onClose} size="3xl" backdrop="blur">
      <ModalContent>
        <ModalHeader className="flex gap-2 text-base font-semibold">
          Ubicación de Nevera : {nevera.cod_nevera} {nevera.imei && `IMEI:(${nevera.imei})`}
        </ModalHeader>
        <div className="p-0 h-[450px] bf overflow-hidden rounded-b-lg">
          <BigMap center={[lng, lat]} zoom={15} mapStyle={mapStyle}>
            {(map) => <SingleMarker map={map} lng={lng} lat={lat} />}
          </BigMap>
        </div>
      </ModalContent>
    </Modal>
  );
}