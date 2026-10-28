import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip } from "@heroui/react";
import {
  Buildings,
  CloseCircle,
  Fridge,
  MapArrowRight,
  MapPoint,
  Shop,
  ShockAbsorber,
} from "@solar-icons/react";

import { useNeveraFilterContext } from "../contexts/NeveraFilterContext";
import type { Taller } from "./TallerLayer";

interface PlaceDetailCardProps {
  place: Taller;
  onClose: () => void;
}

const roundBtn =
  "size-9 shrink-0 rounded-full bg-nx-surface-2 flex items-center justify-center text-nx-text-2 hover:text-nx-text transition-colors";

const initials = (name?: string) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

function Row({
  icon,
  label,
  children,
  action,
}: {
  icon: ReactNode;
  label: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="size-9 shrink-0 rounded-full bg-nx-surface-2 flex items-center justify-center text-nx-text-2">
        {icon}
      </span>
      <div className="flex-1 min-w-0 flex flex-col leading-tight pt-0.5">
        <span className="text-[11px] text-nx-text-3">{label}</span>
        <span className="text-sm text-nx-text">{children}</span>
      </div>
      {action}
    </div>
  );
}

function Person({
  role,
  name,
  avatar,
}: {
  role: string;
  name: string;
  avatar: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`size-10 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold text-white ${avatar}`}
      >
        {initials(name)}
      </span>
      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-[11px] text-nx-text-3">{role}</span>
        <span className="text-sm font-semibold text-nx-text truncate">
          {name}
        </span>
      </div>
    </div>
  );
}

export default function PlaceDetailCard({
  place,
  onClose,
}: PlaceDetailCardProps) {
  const navigate = useNavigate();
  const { setDistribuidorFilter, setLocacionFilter } =
    useNeveraFilterContext();

  const isDistribuidor = place.tipo === 1;
  const tipoLabel = isDistribuidor ? "Distribuidor" : "Taller";

  const directions = `https://www.google.com/maps/dir/?api=1&destination=${place.latitud},${place.longitud}`;

  const verNeveras = () => {
    if (isDistribuidor) setDistribuidorFilter(place.nombre);
    else setLocacionFilter(place.nombre);
    navigate("/dashboard/neveras?tab=congeladoras");
  };

  const hasTeam = place.supervisor || place.coordinador;

  return (
    <div className="w-[22rem] max-w-[calc(100%-2rem)] max-h-[calc(100%-6.5rem)] overflow-y-auto scrollbar-hide rounded-[1.75rem] bg-nx-surface shadow-xl border border-nx-line/60 p-4 flex flex-col gap-4">
      <header className="flex items-start gap-3">
        <span
          className={`size-11 shrink-0 rounded-2xl text-white flex items-center justify-center ${
            isDistribuidor ? "bg-nx-gradient" : "bg-nx-ink text-nx-surface"
          }`}
        >
          {isDistribuidor ? <Shop size={22} /> : <ShockAbsorber size={22} />}
        </span>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h3 className="text-lg font-bold text-nx-text leading-tight">
            {place.nombre}
          </h3>
          <Chip
            size="sm"
            variant="flat"
            classNames={{
              base: `h-5 ${isDistribuidor ? "bg-nx-purple/10" : "bg-nx-surface-2"}`,
              content: `text-[11px] font-medium px-1 ${
                isDistribuidor ? "text-nx-purple" : "text-nx-text-2"
              }`,
            }}
          >
            {tipoLabel}
          </Chip>
        </div>
        <button
          type="button"
          aria-label="Cerrar"
          onClick={onClose}
          className={roundBtn}
        >
          <CloseCircle size={18} />
        </button>
      </header>

      <div className="flex flex-col gap-3">
        {place.direccion && (
          <Row
            icon={<MapPoint size={17} />}
            label="Dirección"
            action={
              <a
                aria-label="Cómo llegar"
                href={directions}
                target="_blank"
                rel="noreferrer"
                className={roundBtn}
              >
                <MapArrowRight size={16} />
              </a>
            }
          >
            {place.direccion}
          </Row>
        )}
        {place.razon_social && (
          <Row icon={<Buildings size={17} />} label="Razón social">
            {place.razon_social}
          </Row>
        )}
      </div>

      {hasTeam && (
        <div className="flex flex-col gap-3 border-t border-nx-line pt-3">
          <span className="text-sm font-semibold text-nx-text">
            Equipo responsable
          </span>
          {place.supervisor && (
            <Person
              role="Supervisor"
              name={place.supervisor}
              avatar={isDistribuidor ? "bg-nx-purple" : "bg-nx-ink"}
            />
          )}
          {place.coordinador && (
            <Person
              role="Coordinador"
              name={place.coordinador}
              avatar={isDistribuidor ? "bg-nx-blue" : "bg-nx-text-2"}
            />
          )}
        </div>
      )}

      <footer className="flex gap-2">
        <Button
          as="a"
          href={directions}
          target="_blank"
          rel="noreferrer"
          radius="full"
          variant="flat"
          className="flex-1 bg-nx-surface-2 text-nx-text font-medium"
          startContent={<MapArrowRight size={17} />}
        >
          Cómo llegar
        </Button>
        <Button
          radius="full"
          className="flex-1 bg-nx-gradient text-white font-medium shadow-md shadow-nx-purple/25"
          startContent={<Fridge size={17} />}
          onPress={verNeveras}
        >
          Ver neveras
        </Button>
      </footer>
    </div>
  );
}
