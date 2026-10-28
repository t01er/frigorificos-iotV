import { Bolt, Radar, Satellite } from "@solar-icons/react";

const norm = (value?: string | null) =>
    (value ?? "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "");

export function EventoChip({ evento }: { evento?: string | null }) {
    if (!evento) return <span className="text-nx-text-3">—</span>;
    const e = norm(evento);
    const energia = e.includes("energ");
    const zona = e.includes("zona");
    const tone = energia
        ? "bg-nx-warn-soft text-nx-warn-ink"
        : zona
          ? "bg-nx-err-soft text-nx-err-ink"
          : "bg-nx-surface-2 text-nx-text-2";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}
        >
            {energia ? <Bolt size={13} /> : <Radar size={13} />}
            {evento}
        </span>
    );
}

/** Barras de señal (1–4) con el valor numérico */
export function SenialCell({ value }: { value?: string | null }) {
    const n = parseFloat(String(value ?? ""));
    if (isNaN(n)) return <span className="text-nx-text-3">{value || "—"}</span>;
    const bars = n < 10 ? 1 : n < 22 ? 2 : n < 28 ? 3 : 4;

    return (
        <span className="inline-flex items-center gap-2">
            <span className="flex items-end gap-[2px] h-3.5">
                {[1, 2, 3, 4].map((i) => (
                    <span
                        key={i}
                        className={`w-[3px] rounded-sm ${
                            i <= bars ? "bg-nx-purple" : "bg-nx-line"
                        }`}
                        style={{ height: `${25 + i * 19}%` }}
                    />
                ))}
            </span>
            <span className="tabular-nums">{n}</span>
        </span>
    );
}

export function SatelitesCell({ value }: { value?: string | null }) {
    if (!value) return <span className="text-nx-text-3">—</span>;
    return (
        <span className="inline-flex items-center gap-1.5">
            <Satellite size={14} className="text-nx-text-3" />
            <span className="tabular-nums">{value}</span>
        </span>
    );
}
