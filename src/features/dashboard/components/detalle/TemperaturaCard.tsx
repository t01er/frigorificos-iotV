import { useState, type ReactNode } from "react";
import { ArrowRightUp } from "@solar-icons/react";

import {
  HISTORICO_MOCK,
  NEVERA_MOCK,
  TEMPERATURA_MOCK,
  type Metrica,
  type RangoTemperatura,
  type SerieTemperatura,
} from "../../mocks/neveraDetalleMock";
import { METRICAS } from "./metricas";

const RANGOS: { key: RangoTemperatura; label: string; titulo: string }[] = [
  { key: "24h", label: "24 h", titulo: "Últimas 24 horas" },
  { key: "7d", label: "7 d", titulo: "Últimos 7 días" },
  { key: "30d", label: "30 d", titulo: "Últimos 30 días" },
];

const { temperatura: t, puerta, energia, desconexion } = NEVERA_MOCK;
const motor = t.motor;

// Momento de la última lectura del mock; las barras se reparten hacia atrás desde aquí.
const AHORA = new Date(2026, 9, 28, 14, 36);
const HORAS_RANGO: Record<RangoTemperatura, number> = { "24h": 24, "7d": 24 * 7, "30d": 24 * 30 };

const fechaBarra = (rango: RangoTemperatura, i: number, total: number) => {
  const horasAtras = ((total - 1 - i) * HORAS_RANGO[rango]) / (total - 1);
  const d = new Date(AHORA.getTime() - horasAtras * 3_600_000);
  const dia = d.toLocaleDateString("es-PE", { day: "2-digit", month: "short" }).replace(".", "");
  if (rango === "30d") return dia;
  const hora = `${String(d.getHours()).padStart(2, "0")}:00`;
  if (rango === "7d") return `${dia} · ${hora}`;
  const esHoy = d.getDate() === AHORA.getDate();
  return `${esHoy ? "Hoy" : "Ayer"} ${hora}`;
};

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

const tensionFuera = (v: number) => v < 212 || v > 230;

interface InfoBarra {
  esMax: boolean;
  esUltima: boolean;
  i: number;
  rango: RangoTemperatura;
}

interface ConfigSerie {
  nombre: string;
  serie: (rango: RangoTemperatura) => SerieTemperatura;
  // Escala de las barras: valor mínimo visible y aire sobre el máximo.
  piso: number;
  margen: number;
  alturaMin?: number;
  color: (valor: number, info: InfoBarra) => string;
  tooltip: (valor: number, info: InfoBarra) => { valor: string; nota: string; tono: string };
}

interface ConfigMetrica {
  titulo: string;
  valores: { label?: string; valor: string; unidad: string }[];
  datos: [string, ReactNode, string?][];
  series: ConfigSerie[];
  leyenda: { color: string; label: string }[];
}

const CONFIG: Record<Metrica, ConfigMetrica> = {
  temperatura: {
    titulo: "Temperatura",
    valores: [
      { label: "Interior", valor: String(t.actual), unidad: "°C" },
      { label: "Motor", valor: String(motor.actual), unidad: "°C" },
    ],
    datos: [
      ["Rango interior", `${t.rangoMin} – ${t.rangoMax} °C`],
      ["Interior prom. · máx. 24 h", `${t.promedio} · ${t.maxima} °C`, "text-nx-warn-ink"],
      ["Motor prom. · máx. 24 h", `${motor.promedio} · ${motor.maxima} °C`, "text-nx-warn-ink"],
      ["Límite del motor", `${motor.limite} °C`],
    ],
    series: [
      {
        nombre: "Interior",
        serie: (r) => TEMPERATURA_MOCK[r],
        piso: 2,
        margen: 0.6,
        color: (v, { esMax, esUltima }) => {
          if (esUltima) return "bg-nx-purple";
          if (esMax) return "bg-[#d4920f]";
          if (v >= 5.5) return "bg-nx-warn";
          if (v >= 4.5) return "bg-nx-warn/45";
          return "bg-nx-purple/15";
        },
        tooltip: (v, { esMax }) => ({
          valor: `${v.toFixed(1)} °C`,
          nota:
            v > t.rangoMax
              ? "Fuera de rango"
              : esMax
                ? "Más alta del periodo"
                : v >= 5.5
                  ? "Cerca del límite"
                  : "Dentro del rango",
          tono: v > t.rangoMax ? "bg-nx-err" : esMax || v >= 5.5 ? "bg-nx-warn" : "bg-nx-ok",
        }),
      },
      {
        nombre: "Motor",
        serie: (r) => HISTORICO_MOCK.motor[r],
        piso: 30,
        margen: 3,
        color: (v, { esMax, esUltima }) => {
          if (esUltima) return "bg-nx-cyan";
          if (v >= motor.limite) return "bg-nx-err";
          if (esMax) return "bg-[#d4920f]";
          if (v >= 55) return "bg-nx-warn";
          return "bg-nx-cyan/25";
        },
        tooltip: (v, { esMax }) => ({
          valor: `${v} °C`,
          nota:
            v >= motor.limite
              ? "Sobrecalentamiento"
              : esMax
                ? "Más alta del periodo"
                : v >= 55
                  ? "Motor exigido"
                  : "Operación normal",
          tono: v >= motor.limite ? "bg-nx-err" : esMax || v >= 55 ? "bg-nx-warn" : "bg-nx-ok",
        }),
      },
    ],
    leyenda: [
      { color: "bg-nx-purple", label: "Interior" },
      { color: "bg-nx-cyan", label: "Motor" },
      { color: "bg-nx-warn", label: "Cerca del límite" },
    ],
  },
  puerta: {
    titulo: "Aperturas de puerta",
    valores: [{ valor: String(puerta.aperturas), unidad: "hoy" }],
    datos: [
      ["Estado", puerta.estado],
      ["Última apertura", puerta.ultima],
      ["Tiempo abierta hoy", puerta.tiempoAbierta],
      ["Promedio diario", `${puerta.promedioDiario} aperturas`],
    ],
    series: [
      {
        nombre: "Aperturas",
        serie: (r) => HISTORICO_MOCK.puerta[r],
        piso: 0,
        margen: 0.5,
        alturaMin: 6,
        color: (v, { esUltima }) => {
          if (esUltima) return "bg-nx-purple";
          if (v === 0) return "bg-nx-info/15";
          return v >= 3 ? "bg-nx-info" : "bg-nx-info/50";
        },
        tooltip: (v, { esMax }) => ({
          valor: plural(v, "apertura", "aperturas"),
          nota:
            v === 0 ? "Sin aperturas" : esMax ? "Mayor uso del periodo" : v >= 3 ? "Uso intenso" : "Uso normal",
          tono: v === 0 ? "bg-nx-text-3" : "bg-nx-info",
        }),
      },
    ],
    leyenda: [
      { color: "bg-nx-info/50", label: "Pocas aperturas" },
      { color: "bg-nx-info", label: "Uso intenso" },
      { color: "bg-nx-purple", label: "Actual" },
    ],
  },
  energia: {
    titulo: "Consumo de energía",
    valores: [{ valor: String(energia.consumoHoy), unidad: "kWh hoy" }],
    datos: [
      ["Consumo del mes", `${energia.consumoMes} kWh`],
      [
        "vs. mes anterior",
        `${energia.variacionMes > 0 ? "+" : ""}${energia.variacionMes} %`,
        energia.variacionMes > 0 ? "text-nx-warn-ink" : "text-nx-ok-ink",
      ],
      ["Voltaje · amperaje", `${energia.voltaje} V · ${energia.amperaje} A`],
      ["Potencia actual", `${energia.potencia.toFixed(2)} kW`],
      ["Eventos de tensión 30 d", energia.eventosTension30d, "text-nx-warn-ink"],
    ],
    series: [
      {
        nombre: "Consumo",
        serie: (r) => HISTORICO_MOCK.energia[r],
        piso: 0,
        margen: 0.05,
        color: (_v, { esMax, esUltima, i, rango }) => {
          if (esUltima) return "bg-nx-purple";
          if (tensionFuera(HISTORICO_MOCK.voltaje[rango].valores[i])) return "bg-nx-warn";
          return esMax ? "bg-nx-ok" : "bg-nx-ok/35";
        },
        tooltip: (v, { esMax, i, rango }) => {
          const volt = HISTORICO_MOCK.voltaje[rango].valores[i];
          const fuera = tensionFuera(volt);
          return {
            valor: `${v.toFixed(2)} kWh`,
            nota: fuera
              ? `${volt} V · ${volt < 212 ? "caída" : "pico"} de tensión`
              : esMax
                ? `Mayor consumo del periodo · ${volt} V`
                : `${volt} V · red estable`,
            tono: fuera ? "bg-nx-warn" : "bg-nx-ok",
          };
        },
      },
    ],
    leyenda: [
      { color: "bg-nx-ok/35", label: "Consumo (kWh)" },
      { color: "bg-nx-warn", label: "Caída o pico de tensión" },
      { color: "bg-nx-purple", label: "Actual" },
    ],
  },
  desconexion: {
    titulo: "Desconexiones",
    valores: [{ valor: String(desconexion.eventos30d), unidad: "en 30 días" }],
    datos: [
      ["Última", desconexion.hace],
      ["Duración", desconexion.duracion],
      ["Disponibilidad 30 d", `${desconexion.disponibilidad} %`, "text-nx-ok-ink"],
    ],
    series: [
      {
        nombre: "Desconexión",
        serie: (r) => HISTORICO_MOCK.desconexion[r],
        piso: 0,
        margen: 2,
        alturaMin: 6,
        color: (v) => (v > 0 ? "bg-nx-err" : "bg-nx-ok/25"),
        tooltip: (v) => ({
          valor: v > 0 ? `${v} min sin conexión` : "En línea",
          nota: v > 0 ? "Desconexión registrada" : "Sin desconexiones",
          tono: v > 0 ? "bg-nx-err" : "bg-nx-ok",
        }),
      },
    ],
    leyenda: [
      { color: "bg-nx-ok/25", label: "En línea" },
      { color: "bg-nx-err", label: "Desconectado (min)" },
    ],
  },
};

function Grafico({
  series,
  leyenda,
  rango,
}: {
  series: ConfigSerie[];
  leyenda: ConfigMetrica["leyenda"];
  rango: RangoTemperatura;
}) {
  const [activa, setActiva] = useState<number | null>(null);
  const multiple = series.length > 1;

  const filas = series.map((cfg) => {
    const { valores, etiquetas } = cfg.serie(rango);
    const max = Math.max(...valores);
    const escala = max + cfg.margen - cfg.piso;
    const altura = (v: number) => Math.max(cfg.alturaMin ?? 0, ((v - cfg.piso) / escala) * 100);
    return { cfg, valores, etiquetas, idxMax: valores.indexOf(max), altura };
  });

  const { etiquetas } = filas[0];
  const total = filas[0].valores.length;
  const info = (fila: (typeof filas)[number], i: number): InfoBarra => ({
    esMax: i === fila.idxMax,
    esUltima: i === total - 1,
    i,
    rango,
  });

  // Pegar el tooltip al borde en las primeras y últimas barras para que no se salga.
  const anclaje =
    activa === null || activa < 3
      ? "translate-x-0"
      : activa > total - 4
        ? "-translate-x-full"
        : "-translate-x-1/2";
  const izquierda =
    activa === null
      ? 0
      : activa < 3
        ? (activa / total) * 100
        : activa > total - 4
          ? ((activa + 1) / total) * 100
          : ((activa + 0.5) / total) * 100;

  return (
    <div className="flex-1 flex flex-col gap-2 min-w-0">
      <div className="flex flex-col gap-2" onMouseLeave={() => setActiva(null)}>
        {filas.map((fila, f) => (
          <div key={fila.cfg.nombre} className="flex flex-col gap-1">
            {multiple && (
              <span className="text-[10px] font-medium text-nx-text-3">{fila.cfg.nombre}</span>
            )}
            <div
              className={`relative flex items-end gap-[3px] sm:gap-1.5 ${multiple ? "h-14" : "h-28"}`}
            >
              {fila.valores.map((v, i) => (
                <span
                  key={i}
                  onMouseEnter={() => setActiva(i)}
                  onClick={() => setActiva(i)}
                  className={`flex-1 rounded-md transition-all cursor-pointer ${fila.cfg.color(v, info(fila, i))} ${
                    activa !== null && activa !== i ? "opacity-40" : ""
                  }`}
                  style={{ height: `${fila.altura(v)}%` }}
                />
              ))}

              {f === 0 && activa !== null && (
                <div
                  role="tooltip"
                  className={`pointer-events-none absolute z-10 ${anclaje} whitespace-nowrap rounded-xl bg-nx-ink-card px-3 py-2 text-white shadow-lg flex flex-col gap-1`}
                  style={{
                    left: `${izquierda}%`,
                    bottom: `calc(${fila.altura(fila.valores[activa])}% + 8px)`,
                  }}
                >
                  <p className="text-[10px] text-white/60">{fechaBarra(rango, activa, total)}</p>
                  {filas.map((fl) => {
                    const tip = fl.cfg.tooltip(fl.valores[activa], info(fl, activa));
                    return (
                      <div key={fl.cfg.nombre} className="leading-tight">
                        <p className="text-sm font-semibold">
                          {multiple && (
                            <span className="text-[11px] font-normal text-white/60 mr-1.5">
                              {fl.cfg.nombre}
                            </span>
                          )}
                          {tip.valor}
                        </p>
                        <p className="flex items-center gap-1.5 text-[11px] text-white/80">
                          <span className={`size-1.5 rounded-full ${tip.tono}`} />
                          {tip.nota}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
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
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-nx-text-3">
        {leyenda.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5">
            <span className={`w-3 h-1.5 rounded-full ${l.color}`} /> {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Indicador({
  metrica,
  activo,
  onClick,
  valor,
  detalle,
  children,
}: {
  metrica: Metrica;
  activo: boolean;
  onClick: () => void;
  valor: string;
  detalle: string;
  children: ReactNode;
}) {
  const { label, Icon, tono } = METRICAS[metrica];
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`min-w-0 flex flex-col gap-2 rounded-2xl p-3 text-left transition-colors ${
        activo ? "bg-nx-surface-2 ring-1 ring-nx-line" : "hover:bg-nx-surface-2/60"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`size-7 rounded-lg flex items-center justify-center ${tono}`}>
          <Icon size={15} />
        </span>
        <span className="flex-1 text-xs text-nx-text-2">{label}</span>
        <ArrowRightUp
          size={13}
          className={activo ? "text-nx-purple" : "text-nx-text-3"}
        />
      </div>
      <p className="text-xl font-bold text-nx-text truncate">{valor}</p>
      <p className="text-[11px] text-nx-text-3 truncate">{detalle}</p>
      <div className="flex items-end gap-[3px] h-4">{children}</div>
    </button>
  );
}

export default function TemperaturaCard() {
  const [rango, setRango] = useState<RangoTemperatura>("24h");
  const [metrica, setMetrica] = useState<Metrica>("temperatura");

  const config = CONFIG[metrica];
  const { Icon, tono } = METRICAS[metrica];
  const tempHoy = TEMPERATURA_MOCK["24h"].valores;
  const maxTemp = Math.max(...tempHoy);
  const maxPuerta = Math.max(...puerta.serie);
  const energiaHoy = HISTORICO_MOCK.energia["24h"].valores;
  const maxEnergia = Math.max(...energiaHoy);

  return (
    <section className="rounded-[1.5rem] bg-nx-surface border border-nx-line/60 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-5">
        <div className="lg:w-[38%] flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className={`size-7 rounded-lg flex items-center justify-center ${tono}`}>
              <Icon size={15} />
            </span>
            <span className="text-sm text-nx-text-2">{config.titulo}</span>
          </div>
          <div className="flex items-end gap-6">
            {config.valores.map((v) => (
              <div key={v.label ?? v.valor} className="flex flex-col gap-1">
                {v.label && <span className="text-[11px] text-nx-text-3">{v.label}</span>}
                <p className="flex items-start text-nx-text leading-none">
                  <span
                    className={`font-bold tracking-tight ${config.valores.length > 1 ? "text-5xl" : "text-6xl"}`}
                  >
                    {v.valor}
                  </span>
                  <span className="text-xl text-nx-text-3 mt-1 ml-1">{v.unidad}</span>
                </p>
              </div>
            ))}
          </div>
          <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1.5 text-xs">
            {config.datos.map(([label, valor, clase]) => (
              <div key={label} className="contents">
                <dt className="text-nx-text-3">{label}</dt>
                <dd className={`font-semibold text-right ${clase ?? "text-nx-text"}`}>{valor}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-nx-text">
              Historial · {RANGOS.find((r) => r.key === rango)?.titulo}
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
          <Grafico
            key={`${metrica}-${rango}`}
            series={config.series}
            leyenda={config.leyenda}
            rango={rango}
          />
        </div>
      </div>

      <div className="border-t border-nx-line/70 pt-3 grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Indicador
          metrica="temperatura"
          activo={metrica === "temperatura"}
          onClick={() => setMetrica("temperatura")}
          valor={`${t.actual} °C`}
          detalle={`Motor ${motor.actual} °C · rango ${t.rangoMin} – ${t.rangoMax} °C`}
        >
          {tempHoy.map((v, i) => (
            <span
              key={i}
              className={`flex-1 rounded-sm ${v >= 5.5 ? "bg-nx-warn" : "bg-nx-purple/30"}`}
              style={{ height: `${Math.max(18, ((v - 2) / (maxTemp - 2)) * 100)}%` }}
            />
          ))}
        </Indicador>
        <Indicador
          metrica="puerta"
          activo={metrica === "puerta"}
          onClick={() => setMetrica("puerta")}
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
          metrica="energia"
          activo={metrica === "energia"}
          onClick={() => setMetrica("energia")}
          valor={`${energia.consumoHoy} kWh`}
          detalle={`Hoy · ${energia.voltaje} V · ${energia.amperaje} A`}
        >
          {energiaHoy.map((v, i) => (
            <span
              key={i}
              className={`flex-1 rounded-sm ${
                tensionFuera(HISTORICO_MOCK.voltaje["24h"].valores[i]) ? "bg-nx-warn" : "bg-nx-ok/40"
              }`}
              style={{ height: `${Math.max(18, (v / maxEnergia) * 100)}%` }}
            />
          ))}
        </Indicador>
        <Indicador
          metrica="desconexion"
          activo={metrica === "desconexion"}
          onClick={() => setMetrica("desconexion")}
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
