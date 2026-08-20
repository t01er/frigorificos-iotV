import { Card, CardBody, Spinner } from "@heroui/react";
import { useGetNeveraDetalleQuery } from "../services/mapApi";
import { UserRounded, BatteryFull, ClockCircle, CheckCircle, DangerTriangle, Globus, ShockAbsorber, WalkingRound, MapArrowUp, FaceScanSquare, Bolt, MapPoint, Ticket, Bus, Fridge } from "@solar-icons/react"

interface Props {
  codigo: string;
}

export default function PopupLayer({ codigo }: Props) {
  const { data, isLoading } = useGetNeveraDetalleQuery(codigo);

  if (isLoading) {
    return (
      <div className="p-3 flex justify-center">
        <Spinner />
      </div>
    );
  }

  const nevera = data?.data;


  if (!nevera) {
    return <div>No se encontró información.</div>;
  }

  const Info = ({
    label,
    value,
    icon,
    bold = false,
  }: {
    label: string;
    value: string;
    icon: React.ReactNode;
    bold?: boolean;
  }) => (
    <div className="flex items-start gap-3">
      <div className="text-[#1E187B] text-lg">
        {typeof icon === "string" ? <i className={`bi ${icon}`} /> : icon}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-xs text-zinc-400">{label}</span>
        <span
          className={`${bold ? "font-semibold text-[#1E187B]" : "text-zinc-700"}`}
        >
          {value || `SIN ${label.toUpperCase()}`}
        </span>
      </div>
    </div>
  );


  return (
    <Card shadow="none" >
      <CardBody className="text-sm">
        <div className=" bg-white text-sm font-inter text-zinc-800">
          {nevera.cliente || nevera.nombre || nevera.cod_nevera ? (
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-[#1E187B]/10 text-[#1E187B] rounded-full p-2">
                <UserRounded className="w-5 h-5" />
              </div>
              <div className="font-semibold text-lg">
                {nevera.cliente || nevera.nombre || nevera.cod_nevera}
              </div>
            </div>
          ) : null}

          <div className="mb-2 flex flex-col gap-1">
            {nevera.tipo != null && (
              <Info
                label="Tipo"
                value={nevera.tipo === 1 ? "Distribuidor" : "Taller"}
                icon={nevera.tipo === 1 ? <WalkingRound /> : <ShockAbsorber />}
                bold
              />
            )}
            {/* {nevera.color && (
        <Info label="Código Cliente" value={nevera.color} icon="bi-hash" />
      )} */}
            {nevera.departamento && (
              <Info label="Departamento" value={nevera.departamento} icon={<Globus />} />
            )}
            {nevera.direccion && (
              <Info label="Dirección" value={nevera.direccion} icon={<MapArrowUp />} />
            )}
            {nevera.supervisor && (
              <Info label="Supervisor" value={nevera.supervisor} icon={<UserRounded />} />
            )}
            {nevera.coordinador && (
              <Info label="Coordinador" value={nevera.coordinador} icon={<UserRounded />} />
            )}
            {nevera.razon_social && (
              <Info label="Razón Social" value={nevera.razon_social} icon={<UserRounded />} />
            )}
            
            {nevera.vendedor && (
              <Info label="Vendedor" value={nevera.vendedor} icon={<FaceScanSquare />} />
            )}
            {nevera.mesa && (
              <Info label="Mesa" value={nevera.mesa} icon={<UserRounded />} />
            )}
            {nevera.distribuidor && (
              <Info label="Distribuidor" value={nevera.distribuidor} icon={<Bus />} />
            )}
            {nevera.cod_nevera && (
              <Info label="Código Nevera" value={nevera.cod_nevera} icon={<Fridge />} bold />
            )}
            {nevera.cod_cliente && (
              <Info label="Código Cliente" value={nevera.cod_cliente} icon={<FaceScanSquare />} />
            )}
            {nevera.ubicacion && (
              <Info label="Ubicación" value={nevera.ubicacion} icon={<MapPoint />} />
            )}
            {nevera.bateria && (
              <Info label="Batería" value={`${nevera.bateria}`} icon={<BatteryFull />} />
            )}           
            {nevera.energia && (
              <Info label="energia" value={`${nevera.energia}`} icon={<Bolt />} />
            )}
            {nevera.ultima_transmision && (
              <Info label="Última Transmisión" value={nevera.ultima_transmision} icon={<ClockCircle />} />
            )}
            {nevera.dia_visita && (
              <Info label="Dia de Visita" value={nevera.dia_visita} icon={<ClockCircle />} />
            )}
            {nevera.numero_ticket_mtto && (
              <Info label="Numeor de Ticket" value={nevera.numero_ticket_mtto} icon={<Ticket />} />
            )}
            {nevera.status && (
              <Info
                label="Estado"
                value={nevera.status}
                icon={
                  nevera.status === "Activo"
                    ? <CheckCircle />
                    : <DangerTriangle />
                }
                bold
              />
            )}
          </div>

          {nevera.latitud && nevera.longitud && (
            <div className="flex justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-200">
              <span>
                <span className="text-[#1E187B] font-medium">Lat:</span> {nevera.latitud}
              </span>
              <span>
                <span className="text-[#1E187B] font-medium">Lng:</span> {nevera.longitud}
              </span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

//  "cod_nevera": "22A0469409",
//         "imei": "860879070699869",
//         "distribuidor": "KALLPA",
//         "ubicacion": "Lat. -11.839070 Long. -76.377405",
//         "bateria": "75%",
//         "cod_cliente": "079001017517001",
//         "energia": "Conectado",
//         "ultima_transmision": "2026-08-17 21:58:39",
//         "status": "Operativo - Cartera",
//         "numero_ticket_mtto": "0"