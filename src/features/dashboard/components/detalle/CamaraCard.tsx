import { useState } from "react";
import { AltArrowLeft, AltArrowRight, Camera } from "@solar-icons/react";

import { NEVERA_MOCK } from "../../mocks/neveraDetalleMock";

const CAMARAS = [
  { nombre: "CAM 01 · Interior", imagen: "/ImagenPanel.png" },
  { nombre: "CAM 02 · Puerta", imagen: "/ImagenPanel2.png" },
];

export default function CamaraCard() {
  const [camara, setCamara] = useState(0);
  const mover = (delta: number) =>
    setCamara((c) => (c + delta + CAMARAS.length) % CAMARAS.length);

  return (
    <section className="relative min-h-[17rem] rounded-[1.5rem] overflow-hidden bg-slate-800 shadow-sm">
      <img
        src={CAMARAS[camara].imagen}
        alt={CAMARAS[camara].nombre}
        className="absolute inset-0 size-full object-cover"
      />

      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-white">
        <span className="size-1.5 rounded-full bg-nx-err animate-pulse" />
        {CAMARAS[camara].nombre}
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
