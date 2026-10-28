import { useState, type ReactNode } from "react";
import { ArrowRightUp, Lightning, Login, Thermometer, WiFiRouterMinimalistic } from "@solar-icons/react";

import {
  NEVERA_MOCK,
  TEMPERATURA_MOCK,
  type RangoTemperatura,
} from "../../mocks/neveraDetalleMock";

const RANGOS: { key: RangoTemperatura; label: string; titulo: string }[] = [
  { key: "24h", label: "24 h", titulo: "Últimas 24 horas" },
  { key: "7d", label: "7 d", titulo: "Últimos 7 días" },
  { key: "30d", label: "30 d", titulo: "Últimos 30 días" },
];

const colorBarra = (valor: number, esMax: boolean, esUltima: boolean) => {
  if (esUltima) return "bg-nx-purple";
  if (esMax) return "bg-[#d4920f]";
  if (valor >= 5.5) return "bg-nx-warn";
  if (valor >= 4.5) return "bg-nx-warn/45";
  return "bg-nx-purple/15";
};

function GraficoTemperatura({ rango }: { rango: RangoTemperatura }) {
  const { valores, etiquetas } = TEMPERATURA_MOCK[rango];
  const max = Math.max(...valores);
  const idxMax = valores.indexOf(max);
  const piso = 2;

  return (
    <div className="flex-1 flex flex-col gap-2 min-w-0">
      <div className="flex items-end gap-[3px] sm:gap-1.5 h-28">
        {valores.map((v, i) => (
          <span
            key={i}
            title={`${v.toFixed(1)} °C`}
            className={`flex-1 rounded-md transition-all ${colorBarra(v, i === idxMax, i === valores.length - 1)}`}
            style={{ height: `${((v - piso) / (max + 0.6 - piso)) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-nx-text-3">
        {etiquetas.map((e, i) => (
          <span
            key={e}
            className={i === etiquetas.length - 1 ? "text-nx-purple font-medium" : ""}
          >
            {e}
          </span>
        ))}
      </div>
    </div>
  );
}

function Indicador({
  icon,
  tono,
  titulo,
  valor,
  detalle,
  children,
}: {
  icon: ReactNode;
  tono: string;
  titulo: string;
  valor: string;
  detalle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex-1 min-w-0 flex flex-col gap-2 py-1 sm:px-4 first:pl-0 last:pr-0">
      <div className="flex items-center gap-2">
        <span className={`size-7 rounded-lg flex items-center justify-center ${tono}`}>
          {icon}
        </span>
        <span className="flex-1 text-xs text-nx-text-2">{titulo}</span>
        <ArrowRightUp size={13} className="text-nx-text-3" />
      </div>
      <p className="text-xl font-bold text-nx-text">{valor}</p>
      <p className="text-[11px] text-nx-text-3 truncate">{detalle}</p>
      <div className="flex items-end gap-[3px] h-4">{children}</div>
    </div>
  );
}

export default function TemperaturaCard() {
  const [rango, setRango] = useState<RangoTemperatura>("24h");
  const { temperatura: t, puerta, corriente, desconexion } = NEVERA_MOCK;
  const maxPuerta = Math.max(...puerta.serie);

  return (
    <section className="rounded-[1.5rem] bg-nx-surface border border-nx-line/60 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="lg:w-[38%] flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="size-7 rounded-lg bg-nx-purple/10 text-nx-purple flex items-center justify-center">
              <Thermometer size={15} />
            </span>
            <span className="text-sm text-nx-text-2">Temperatura interior</span>
          </div>
          <p className="flex items-start text-nx-text leading-none">
            <span className="text-6xl font-bold tracking-tight">{t.actual}</span>
            <span className="text-xl text-nx-text-3 mt-1 ml-1">°C</span>
          </p>
          <dl className="grid grid-cols-[1fr_auto] gap-y-1.5 text-xs">
            <dt className="text-nx-text-3">Rango objetivo</dt>
            <dd className="font-semibold text-nx-text text-right">
              {t.rangoMin} – {t.rangoMax} °C
            </dd>
            <dt className="text-nx-text-3">Promedio 24 h</dt>
            <dd className="font-semibold text-nx-text text-right">{t.promedio} °C</dd>
            <dt className="text-nx-text-3">Máxima 24 h</dt>
            <dd className="font-semibold text-nx-warn-ink text-right">
              {t.maxima} °C · {t.horaMaxima}
            </dd>
          </dl>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-nx-text">
              {RANGOS.find((r) => r.key === rango)?.titulo}
            </span>
            <div className="flex rounded-full bg-nx-surface-2 p-0.5">
              {RANGOS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRango(r.key)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    rango === r.key
                      ? "bg-nx-surface text-nx-text shadow-sm"
                      : "text-nx-text-3 hover:text-nx-text"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <GraficoTemperatura rango={rango} />
        </div>
      </div>

      <div className="border-t border-nx-line/70 pt-4 flex flex-col sm:flex-row gap-4 sm:gap-0 sm:divide-x divide-nx-line/70">
        <Indicador
          icon={<Login size={15} />}
          tono="bg-nx-info-soft text-nx-info"
          titulo="Puerta"
          valor={puerta.estado}
          detalle={`${puerta.aperturas} aperturas hoy · última ${puerta.ultima}`}
        >
          {puerta.serie.map((v, i) => (
            <span
              key={i}
              className={`flex-1 rounded-sm ${v ? "bg-nx-info" : "bg-nx-info/15"}`}
              style={{ height: `${Math.max(18, (v / maxPuerta) * 100)}%` }}
            />
          ))}
        </Indicador>
        <Indicador
          icon={<Lightning size={15} />}
          tono="bg-nx-ok-soft text-nx-ok"
          titulo="Corriente"
          valor={`${corriente.voltaje} V`}
          detalle={`${corriente.amperaje} A · ${corriente.potencia.toFixed(2)} kW · red estable`}
        >
          {Array.from({ length: 22 }, (_, i) => (
            <span key={i} className="flex-1 h-full rounded-sm bg-nx-ok/30" />
          ))}
        </Indicador>
        <Indicador
          icon={<WiFiRouterMinimalistic size={15} />}
          tono="bg-nx-err-soft text-nx-err"
          titulo="Desconexión"
          valor={desconexion.hace}
          detalle={`Duró ${desconexion.duracion} · ${desconexion.eventos30d} eventos en 30 días`}
        >
          {desconexion.serie.map((v, i) => (
            <span
              key={i}
              className={`flex-1 h-full rounded-sm ${v ? "bg-nx-err" : "bg-nx-ok/25"}`}
            />
          ))}
        </Indicador>
      </div>
    </section>
  );
}
