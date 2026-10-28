import { useMemo, useState } from "react";
import { AltArrowLeft, AltArrowRight, Camera } from "@solar-icons/react";

import { NEVERA_MOCK, PRODUCTOS_MOCK } from "../../mocks/neveraDetalleMock";

const CAMARAS = ["CAM 01 · Interior", "CAM 02 · Puerta"];

// Ilustración de los estantes mientras no exista la captura real de la cámara.
function Estantes({ seed }: { seed: number }) {
  const filas = useMemo(
    () =>
      Array.from({ length: 5 }, (_, fila) =>
        Array.from({ length: 11 }, (_, i) => {
          const p = PRODUCTOS_MOCK[(fila * 5 + i * (seed + 2)) % PRODUCTOS_MOCK.length];
          return { color: p.color, alto: 70 + ((i * 7 + fila * 3 + seed) % 4) * 8 };
        }),
      ),
    [seed],
  );

  return (
    <div className="absolute inset-0 flex flex-col justify-evenly px-4 pt-10 pb-20 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400">
      {filas.map((fila, f) => (
        <div key={f} className="relative flex items-end gap-1 h-[17%]">
          {fila.map((b, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <span
                className="w-[38%] h-[10%] rounded-t-sm"
                style={{ background: b.color, filter: "brightness(0.7)" }}
              />
              <span
                className="w-full rounded-t-[40%] rounded-b-sm relative overflow-hidden"
                style={{ height: `${b.alto}%`, background: b.color }}
              >
                <span className="absolute inset-x-0 top-[35%] h-[28%] bg-white/70" />
                <span className="absolute inset-y-0 left-[15%] w-[18%] bg-white/30" />
              </span>
            </div>
          ))}
          <span className="absolute -bottom-1.5 inset-x-[-1rem] h-1.5 bg-slate-500/70 shadow" />
        </div>
      ))}
      <span className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/25 to-white/0 pointer-events-none" />
      <span className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.45)] pointer-events-none" />
    </div>
  );
}

export default function CamaraCard() {
  const [camara, setCamara] = useState(0);
  const mover = (delta: number) =>
    setCamara((c) => (c + delta + CAMARAS.length) % CAMARAS.length);

  return (
    <section className="relative min-h-[17rem] rounded-[1.5rem] overflow-hidden bg-slate-800 shadow-sm">
      <Estantes seed={camara} />

      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-white">
        <span className="size-1.5 rounded-full bg-nx-err animate-pulse" />
        {CAMARAS[camara]}
      </div>
      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-white">
        <Camera size={13} />
        Captura {NEVERA_MOCK.captura}
      </div>

      <div className="absolute left-3 right-3 bottom-3 flex items-center gap-3 rounded-2xl bg-black/60 backdrop-blur px-3.5 py-2.5 text-white">
        <div className="flex-1 min-w-0 leading-tight">
          <p className="text-sm font-semibold">
            {NEVERA_MOCK.productosDetectados} productos detectados
          </p>
          <p className="text-[11px] text-white/70">
            Reconocimiento IA · confianza {NEVERA_MOCK.confianza}%
          </p>
        </div>
        <button
          type="button"
          aria-label="Cámara anterior"
          onClick={() => mover(-1)}
          className="size-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
        >
          <AltArrowLeft size={15} />
        </button>
        <button
          type="button"
          aria-label="Cámara siguiente"
          onClick={() => mover(1)}
          className="size-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
        >
          <AltArrowRight size={15} />
        </button>
      </div>
    </section>
  );
}
