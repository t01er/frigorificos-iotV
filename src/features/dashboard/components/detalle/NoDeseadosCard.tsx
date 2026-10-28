import { ArrowRight, ShieldWarning } from "@solar-icons/react";

import { NO_DESEADOS_MOCK } from "../../mocks/neveraDetalleMock";

export default function NoDeseadosCard() {
  return (
    <section className="rounded-[1.5rem] bg-nx-surface border border-nx-line/60 shadow-sm p-5 flex flex-col gap-3">
      <header className="flex items-center gap-2.5">
        <span className="size-8 rounded-lg bg-nx-err-soft text-nx-err flex items-center justify-center">
          <ShieldWarning size={16} />
        </span>
        <h2 className="flex-1 text-sm font-semibold text-nx-text">Productos no deseados</h2>
        <span className="min-w-6 h-6 px-1.5 rounded-full bg-nx-err text-white text-xs font-semibold flex items-center justify-center">
          {NO_DESEADOS_MOCK.length}
        </span>
      </header>

      <ul className="flex flex-col gap-2">
        {NO_DESEADOS_MOCK.map((p) => (
          <li
            key={p.nombre}
            className="flex items-center gap-3 rounded-xl bg-nx-err-soft/70 border border-nx-err/15 px-3 py-2.5"
          >
            <span className="size-8 shrink-0 rounded-lg bg-nx-surface flex items-center justify-center">
              <span className="w-2.5 h-4 rounded-[3px]" style={{ background: p.color }} />
            </span>
            <div className="flex-1 min-w-0 leading-tight">
              <p className="text-sm font-medium text-nx-text truncate">{p.nombre}</p>
              <p className="text-[11px] text-nx-err-ink">
                {p.motivo} · Estante {p.estante}
              </p>
            </div>
            <span className="text-[11px] font-mono text-nx-text-3">{p.hora}</span>
          </li>
        ))}
      </ul>

      <footer className="flex items-center justify-between text-[11px] text-nx-text-3">
        <span>Se notificó al distribuidor</span>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-nx-purple hover:underline"
        >
          Ver evidencia <ArrowRight size={13} />
        </button>
      </footer>
    </section>
  );
}
