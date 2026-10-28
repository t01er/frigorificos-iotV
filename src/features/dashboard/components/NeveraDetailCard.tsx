import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Spinner } from "@heroui/react";
import {
  BatteryFull,
  Bolt,
  CloseCircle,
  Copy,
  Fridge,
  History,
  MapArrowRight,
  MapPoint,
  ClockCircle,
  Ticket,
  UserId,
  Bus,
} from "@solar-icons/react";

import {
  useGetNeveraDetalleQuery,
  useGetNeverasDashboardQuery,
} from "../services/mapApi";
import { ESTADOS_NEVERA } from "../services/estadoNeveraConstants";
import RecorridoMapModal from "./RecorridoMapModal";

interface NeveraDetailCardProps {
  codigo: string;
  estado?: number;
  onClose: () => void;
}

const ESTADO_TONE: Record<number, string> = {
  1: "bg-nx-err-soft text-nx-err-ink",
  7: "bg-nx-warn-soft text-nx-warn-ink",
  2: "bg-nx-ok-soft text-nx-ok-ink",
  3: "bg-nx-ok-soft text-nx-ok-ink",
  4: "bg-nx-ok-soft text-nx-ok-ink",
};

const parseFecha = (value?: string | null): Date | null => {
  if (!value) return null;
  const dmy = value.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (dmy) {
    const [, d, m, y, hh = "0", mm = "0", ss = "0"] = dmy;
    return new Date(+y, +m - 1, +d, +hh, +mm, +ss);
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const haceTiempo = (date: Date | null): string | null => {
  if (!date) return null;
  const min = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
};

function Metric({
  icon,
  label,
  value,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl bg-nx-surface-2 px-3 py-2.5 flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-[11px] text-nx-text-3">
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold text-nx-text truncate">
        {value}
      </span>
      {children}
    </div>
  );
}

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
    <div className="flex items-center gap-3">
      <span className="size-9 shrink-0 rounded-full bg-nx-surface-2 flex items-center justify-center text-nx-text-2">
        {icon}
      </span>
      <div className="flex-1 min-w-0 flex flex-col leading-tight">
        <span className="text-[11px] text-nx-text-3">{label}</span>
        <span className="text-sm text-nx-text truncate">{children}</span>
      </div>
      {action}
    </div>
  );
}

const roundBtn =
  "size-9 shrink-0 rounded-full bg-nx-surface-2 flex items-center justify-center text-nx-text-2 hover:text-nx-text transition-colors";

export default function NeveraDetailCard({
  codigo,
  estado,
  onClose,
}: NeveraDetailCardProps) {
  const navigate = useNavigate();
  const [historialOpen, setHistorialOpen] = useState(false);

  const { data, isLoading } = useGetNeveraDetalleQuery(codigo);
  const nevera = data?.data;

  const { data: dashData } = useGetNeverasDashboardQuery(
    { cod_nevera: codigo, size: 1, page: 1 },
    { skip: !!nevera?.imei },
  );
  const imei: string | undefined =
    nevera?.imei ?? dashData?.data?.[0]?.dis_imei;

  const estadoLabel = ESTADOS_NEVERA.find((e) => e.value === estado)?.label;
  const transmision = parseFecha(nevera?.ultima_transmision);
  const hace = haceTiempo(transmision);

  const bateria = parseFloat(String(nevera?.bateria ?? ""));
  const bateriaPct = isNaN(bateria) ? null : Math.min(100, Math.max(0, bateria));

  const copy = (text?: string) => {
    if (text) navigator.clipboard?.writeText(text).catch(() => undefined);
  };

  const coords =
    nevera?.latitud && nevera?.longitud
      ? `${nevera.latitud}, ${nevera.longitud}`
      : nevera?.ubicacion;

  return (
    <div className="w-[22rem] max-w-[calc(100%-2rem)] max-h-[calc(100%-6.5rem)] overflow-y-auto scrollbar-hide rounded-[1.75rem] bg-nx-surface shadow-xl border border-nx-line/60 p-4 flex flex-col gap-4">
      <header className="flex items-start gap-3">
        <span className="size-11 shrink-0 rounded-2xl bg-nx-purple/10 text-nx-purple flex items-center justify-center">
          <Fridge size={22} />
        </span>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <h3 className="text-lg font-bold text-nx-text leading-tight truncate">
            {codigo}
          </h3>
          <Chip
            size="sm"
            variant="flat"
            classNames={{
              base: "bg-nx-purple/10 h-5",
              content: "text-[11px] font-medium text-nx-purple px-1",
            }}
          >
            Nevera
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

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="sm" />
        </div>
      ) : !nevera ? (
        <p className="text-sm text-nx-text-3 text-center py-6">
          No se encontró información.
        </p>
      ) : (
        <>
          {(estadoLabel || hace) && (
            <div
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                ESTADO_TONE[estado ?? -1] ?? "bg-nx-surface-2 text-nx-text-2"
              }`}
            >
              <span className="size-2 rounded-full bg-current" />
              <span className="flex-1 truncate">
                {estadoLabel?.replace(" - ", " · ") ?? nevera.status}
              </span>
              {hace && <span className="text-xs font-normal">{hace}</span>}
            </div>
          )}

          <div className="flex gap-2">
            <Metric
              icon={<BatteryFull size={13} />}
              label="Batería"
              value={bateriaPct !== null ? `${Math.round(bateriaPct)}%` : "—"}
            >
              {bateriaPct !== null && (
                <span className="h-1 w-full rounded-full bg-nx-line overflow-hidden">
                  <span
                    className="block h-full rounded-full bg-nx-ok"
                    style={{ width: `${bateriaPct}%` }}
                  />
                </span>
              )}
            </Metric>
            <Metric
              icon={<Bolt size={13} />}
              label="Energía"
              value={nevera.energia ? String(nevera.energia) : "—"}
            />
            <Metric
              icon={<Ticket size={13} />}
              label="Tickets"
              value={nevera.numero_ticket_mtto ? String(nevera.numero_ticket_mtto) : "0"}
            />
          </div>

          <div className="flex flex-col gap-3">
            {nevera.distribuidor && (
              <Row icon={<Bus size={17} />} label="Distribuidor">
                <b className="font-semibold text-nx-purple">
                  {nevera.distribuidor}
                </b>
              </Row>
            )}
            {nevera.cod_cliente && (
              <Row
                icon={<UserId size={17} />}
                label="Código cliente"
                action={
                  <button
                    type="button"
                    aria-label="Copiar código cliente"
                    onClick={() => copy(String(nevera.cod_cliente))}
                    className={roundBtn}
                  >
                    <Copy size={16} />
                  </button>
                }
              >
                <span className="font-mono text-[13px]">{nevera.cod_cliente}</span>
              </Row>
            )}
            {coords && (
              <Row
                icon={<MapPoint size={17} />}
                label="Ubicación"
                action={
                  nevera.latitud && nevera.longitud ? (
                    <a
                      aria-label="Abrir en Google Maps"
                      href={`https://www.google.com/maps?q=${nevera.latitud},${nevera.longitud}`}
                      target="_blank"
                      rel="noreferrer"
                      className={roundBtn}
                    >
                      <MapArrowRight size={16} />
                    </a>
                  ) : undefined
                }
              >
                <span className="font-mono text-[13px]">{coords}</span>
              </Row>
            )}
            {nevera.ultima_transmision && (
              <Row icon={<ClockCircle size={17} />} label="Última transmisión">
                {nevera.ultima_transmision}
              </Row>
            )}
          </div>
        </>
      )}

      <footer className="flex gap-2">
        <Button
          radius="full"
          variant="flat"
          className="flex-1 bg-nx-surface-2 text-nx-text font-medium"
          startContent={<History size={17} />}
          isDisabled={!imei}
          onPress={() => setHistorialOpen(true)}
        >
          Historial
        </Button>
        <Button
          radius="full"
          className="flex-1 bg-nx-gradient text-white font-medium shadow-md shadow-nx-purple/25"
          onPress={() => navigate(`/dashboard/neveras/${encodeURIComponent(codigo)}`)}
        >
          Ver detalle
        </Button>
      </footer>

      <RecorridoMapModal
        isOpen={historialOpen}
        onClose={() => setHistorialOpen(false)}
        imei={imei ?? null}
        codNevera={codigo}
      />
    </div>
  );
}
