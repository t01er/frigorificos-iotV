import { useMemo, useState } from "react";
import { AltArrowUp, ArrowRight } from "@solar-icons/react";

import {
  PRODUCTOS_MOCK,
  estadoProducto,
  type EstadoProducto,
  type ProductoPlanograma,
} from "../../mocks/neveraDetalleMock";

type Filtro = "todos" | "faltantes" | "exceso";

const VISIBLES = 6;

const ESTADOS: Record<EstadoProducto, { label: string; chip: string; barra: string }> = {
  completo: { label: "Completo", chip: "bg-nx-ok-soft text-nx-ok-ink", barra: "bg-nx-ok" },
  reponer: { label: "Reponer", chip: "bg-nx-warn-soft text-nx-warn-ink", barra: "bg-nx-warn" },
  bajo: { label: "Bajo", chip: "bg-nx-err-soft text-nx-err-ink", barra: "bg-nx-err" },
  agotado: { label: "Agotado", chip: "bg-nx-err-soft text-nx-err-ink", barra: "bg-nx-err" },
  exceso: { label: "Exceso", chip: "bg-nx-info-soft text-nx-info", barra: "bg-nx-ok" },
};

function BarraStock({ p, estado }: { p: ProductoPlanograma; estado: EstadoProducto }) {
  const total = Math.max(p.planograma, p.cantidad);
  return (
    <div className="flex gap-1 w-full max-w-[9.5rem]">
      {Array.from({ length: total }, (_, i) => {
        const color =
          i >= p.planograma
            ? "bg-nx-info"
            : i < p.cantidad
              ? ESTADOS[estado].barra
              : "bg-nx-line";
        return <span key={i} className={`flex-1 h-1.5 rounded-full ${color}`} />;
      })}
    </div>
  );
}

function IconoProducto({ color }: { color: string }) {
  return (
    <span
      className="size-8 shrink-0 rounded-lg flex items-center justify-center"
      style={{ background: `color-mix(in srgb, ${color} 13%, transparent)` }}
    >
      <span className="w-2.5 h-4 rounded-[3px]" style={{ background: color }} />
    </span>
  );
}

export default function ProductosCard() {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [verTodos, setVerTodos] = useState(false);

  const productos = useMemo(
    () => PRODUCTOS_MOCK.map((p) => ({ ...p, estado: estadoProducto(p) })),
    [],
  );

  const faltantes = productos.filter((p) => p.estado === "bajo" || p.estado === "agotado");
  const exceso = productos.filter((p) => p.estado === "exceso");

  const filtrados =
    filtro === "faltantes" ? faltantes : filtro === "exceso" ? exceso : productos;
  const lista = verTodos ? filtrados : filtrados.slice(0, VISIBLES);

  const tabs: { key: Filtro; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: productos.length },
    { key: "faltantes", label: "Faltantes", count: faltantes.length },
    { key: "exceso", label: "Exceso", count: exceso.length },
  ];

  return (
    <section className="rounded-[1.5rem] bg-nx-surface border border-nx-line/60 shadow-sm p-5 flex flex-col gap-4 min-w-0">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-nx-text">Lista de productos</h2>
          <p className="text-xs text-nx-text-3">Inventario detectado vs. planograma asignado</p>
        </div>
        <div className="flex rounded-full border border-nx-line p-0.5">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setFiltro(t.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filtro === t.key
                  ? "bg-nx-surface-2 text-nx-text"
                  : "text-nx-text-3 hover:text-nx-text"
              }`}
            >
              {t.label} <span className="text-nx-text-3 ml-0.5">{t.count}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-nx-text-3 text-left">
              <th className="font-medium pb-2">Producto</th>
              <th className="font-medium pb-2">Estante</th>
              <th className="font-medium pb-2">Stock vs. planograma</th>
              <th className="font-medium pb-2">Cant.</th>
              <th className="font-medium pb-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((p) => (
              <tr key={p.sku} className="border-t border-nx-line/70">
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2.5">
                    <IconoProducto color={p.color} />
                    <div className="leading-tight min-w-0">
                      <p className="font-medium text-nx-text truncate">{p.nombre}</p>
                      <p className="text-[10px] font-mono text-nx-text-3">SKU {p.sku}</p>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 pr-3 text-xs text-nx-text-2 whitespace-nowrap">
                  Estante {p.estante}
                </td>
                <td className="py-2.5 pr-3">
                  <BarraStock p={p} estado={p.estado} />
                </td>
                <td className="py-2.5 pr-3 text-xs text-nx-text whitespace-nowrap">
                  {p.cantidad} / {p.planograma}
                </td>
                <td className="py-2.5">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ESTADOS[p.estado].chip}`}
                  >
                    {ESTADOS[p.estado].label}
                  </span>
                </td>
              </tr>
            ))}
            {lista.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-nx-text-3">
                  Sin productos en esta categoría.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="mt-auto border-t border-nx-line/70 pt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-nx-text-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-nx-ok" /> Completo
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-nx-warn" /> Reponer
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-nx-err" /> Bajo / agotado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full bg-nx-info" /> Exceso
          </span>
        </div>
        {filtrados.length > VISIBLES && (
          <button
            type="button"
            onClick={() => setVerTodos((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-nx-purple hover:underline"
          >
            {verTodos ? "Ver menos" : `Ver los ${filtrados.length} SKU`}
            {verTodos ? <AltArrowUp size={13} /> : <ArrowRight size={13} />}
          </button>
        )}
      </footer>
    </section>
  );
}
