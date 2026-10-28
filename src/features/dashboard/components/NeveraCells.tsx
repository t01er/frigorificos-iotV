import {
  Delivery,
  DangerTriangle,
  Pause,
  Play,
  ShockAbsorber,
  Bolt,
  CheckCircle,
  Radar,
} from "@solar-icons/react";

const norm = (value?: string | null) =>
  (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

interface ChipStyle {
  className: string;
  icon: React.ReactNode;
}

const estadoStyle = (estado?: string | null): ChipStyle => {
  const e = norm(estado);
  if (e.includes("energ"))
    return { className: "bg-nx-warn-soft text-nx-warn-ink", icon: <Bolt size={13} /> };
  if (e.includes("zona"))
    return { className: "bg-nx-err-soft text-nx-err-ink", icon: <DangerTriangle size={13} /> };
  if (e.includes("taller"))
    return { className: "bg-nx-info-soft text-nx-blue", icon: <ShockAbsorber size={13} /> };
  if (e.includes("distribuidor"))
    return { className: "bg-nx-purple/10 text-nx-purple", icon: <Delivery size={13} /> };
  if (e.includes("operativo") || e.includes("cartera") || e.includes("censo") || e.includes("instal"))
    return { className: "bg-nx-ok-soft text-nx-ok-ink", icon: <CheckCircle size={13} /> };
  return { className: "bg-nx-surface-2 text-nx-text-2", icon: <Radar size={13} /> };
};

export function EstadoChip({ estado }: { estado?: string | null }) {
  if (!estado) return <span className="text-nx-text-3">—</span>;
  const { className, icon } = estadoStyle(estado);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${className}`}
    >
      {icon}
      {estado}
    </span>
  );
}

export function MovimientoCell({ movimiento }: { movimiento?: string | null }) {
  if (!movimiento) return <span className="text-nx-text-3">—</span>;
  const moving = norm(movimiento).includes("movimiento");
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${
        moving ? "text-nx-ok-ink" : "text-nx-text-2"
      }`}
    >
      {moving ? <Play size={13} /> : <Pause size={13} />}
      {movimiento}
    </span>
  );
}

export function BatteryCell({ value }: { value?: string | number | null }) {
  const pct = parseFloat(String(value ?? "").replace("%", ""));
  if (isNaN(pct)) return <span className="text-nx-text-3">—</span>;
  const clamped = Math.min(100, Math.max(0, pct));
  const color =
    clamped < 20 ? "bg-nx-err" : clamped < 50 ? "bg-nx-warn" : "bg-nx-ok";
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-14 rounded-full bg-nx-line overflow-hidden">
        <span
          className={`block h-full rounded-full ${color}`}
          style={{ width: `${clamped}%` }}
        />
      </span>
      <span className="text-xs font-medium text-nx-text tabular-nums w-9">
        {Math.round(clamped)}%
      </span>
    </span>
  );
}

export function EnergiaCell({ value }: { value?: string | null }) {
  if (!value) return <span className="text-nx-text-3">—</span>;
  const connected = norm(value).includes("conectado") && !norm(value).includes("des");
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${
        connected ? "text-nx-ok-ink font-medium" : "text-nx-text-3"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${connected ? "bg-nx-ok" : "bg-nx-text-3/60"}`}
      />
      {value}
    </span>
  );
}
