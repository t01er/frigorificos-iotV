export const parseBateria = (value?: string | null): number | null => {
    const pct = parseFloat(String(value ?? "").replace("%", "").trim());
    return isNaN(pct) ? null : Math.min(100, Math.max(0, pct));
};

export function BateriaCell({ value }: { value?: string | null }) {
    const pct = parseBateria(value);
    if (pct === null) return <span className="text-nx-text-3">{value || "—"}</span>;

    const color = pct < 20 ? "bg-nx-err" : pct < 50 ? "bg-nx-warn" : "bg-nx-ok";

    return (
        <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-14 rounded-full bg-nx-line overflow-hidden">
                <span
                    className={`block h-full rounded-full ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </span>
            <span className="text-xs font-medium text-nx-text tabular-nums w-9">
                {Math.round(pct)}%
            </span>
        </span>
    );
}

export function EnergiaChip({ value }: { value?: string | null }) {
    const on = value === "Conectado";
    return (
        <span
            className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                on
                    ? "bg-nx-warn-soft text-nx-warn-ink"
                    : "bg-nx-surface-2 text-nx-text-3"
            }`}
        >
            {on ? "ON" : "OFF"}
        </span>
    );
}

const ESTADO_TONE: Record<string, string> = {
    activo: "bg-nx-ok-soft text-nx-ok-ink",
    inactivo: "bg-nx-err-soft text-nx-err-ink",
    desconocido: "bg-nx-warn-soft text-nx-warn-ink",
};

export function EstadoBadge({ estado }: { estado?: string | null }) {
    if (!estado) return <span className="text-nx-text-3">—</span>;
    const tone =
        ESTADO_TONE[estado.toLowerCase()] ?? "bg-nx-surface-2 text-nx-text-2";
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}
        >
            <span className="size-1.5 rounded-full bg-current" />
            {estado}
        </span>
    );
}
