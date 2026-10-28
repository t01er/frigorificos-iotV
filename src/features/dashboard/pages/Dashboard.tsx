import NeverasMapa from "../components/NeverasMapa";
import StatsPanel from "../components/StatsPanel";
import ExportReportButton from "../components/ExportReportButton";
import { useResumenNeveras } from "../hooks/useResumenNeveras";

const formatCorte = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (isNaN(date.getTime())) return value.replaceAll("-", "/");
  return date
    .toLocaleDateString("es-PE", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    .replace(/\./g, "");
};

export default function Dashboard() {
  const { resumen } = useResumenNeveras();
  const corte = formatCorte(resumen?.corte);


  return (
    <div className="flex flex-col gap-4 min-h-full lg:h-full">
      <header className="flex flex-wrap items-end justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-nx-text">Inicio</h1>
          <p className="text-sm text-nx-text-3">
            Monitorea tus neveras en tiempo real en todo el Perú
          </p>
        </div>

        <div className="flex items-center gap-3">
          {corte && (
            <span className="hidden sm:flex items-center gap-2 h-11 px-4 rounded-full bg-nx-surface text-sm text-nx-text-2">
              <span className="size-2 rounded-full bg-nx-ok" />
              Última actualización · {corte}
            </span>
          )}
          <ExportReportButton />
        </div>
      </header>

      <div className="grid gap-4 flex-1 min-h-0 lg:grid-cols-[minmax(340px,400px)_minmax(0,1fr)]">
        <NeverasMapa
          renderSide={(handlers) => <StatsPanel {...handlers} />}
        />
      </div>
    </div>
  );
}
