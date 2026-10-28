import { useState } from "react";
import PageContainer from "../../../layouts/PageContainer";
import AlertasActivasTabla from "../components/AlertasActivasTabla";
import HistorialAlertasTabla from "../components/HistorialAlertasTabla";
import CorreosNestleTabla from "../components/CorreosNestleTabla";
import AlertsStatsRow from "../components/AlertsStatsRow";
import ExportAlertsButton from "../components/ExportAlertsButton";

import { Accordion, AccordionItem } from "@heroui/react";
import EventosForzados from "../components/EventosForzados";

const accordionClassNames = {
  base: "p-0 bg-transparent shadow-none",
  heading: "p-0",
  trigger: "px-1 py-2",
  title: "text-lg font-bold text-nx-text",
  content: "p-0 pb-4",
};

const formatHora = (ts: number | null) =>
  ts
    ? new Date(ts).toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : "--:--:--";

export default function Alerts() {
  const [totalHistorial, setTotalHistorial] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-nx-text">Alertas activas</h1>
            <p className="text-sm text-nx-text-3">
              Eventos en vivo de energía y geocerca reportados por las neveras
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-2 h-11 px-4 rounded-full bg-nx-surface text-sm text-nx-text-2">
              <span className="size-2 rounded-full bg-nx-err animate-pulse" />
              En vivo · última {formatHora(lastUpdate)}
            </span>
            <ExportAlertsButton />
          </div>
        </header>

        <AlertsStatsRow />

        <AlertasActivasTabla onLastUpdate={setLastUpdate} />

        <Accordion
          selectionMode="multiple"
          variant="light"
          className="px-0 gap-1"
          itemClasses={accordionClassNames}
        >
          <AccordionItem
            key="2"
            aria-label="Historial de eventos de los últimos 3 meses"
            title={
              <div className="flex items-center gap-2">
                <span>Historial de eventos de los últimos 3 meses</span>
                <span className="text-xs bg-nx-surface-2 text-nx-text-2 px-2.5 py-0.5 rounded-full font-medium">
                  {totalHistorial}
                </span>
              </div>
            }
          >
            <HistorialAlertasTabla onTotalChange={setTotalHistorial} />
          </AccordionItem>

          <AccordionItem key="4" aria-label="Eventos" title="Eventos">
            <EventosForzados />
          </AccordionItem>

          <AccordionItem
            key="3"
            aria-label="Contactos para Alertas"
            title="Contactos para Alertas"
          >
            <CorreosNestleTabla />
          </AccordionItem>
        </Accordion>
      </div>
    </PageContainer>
  );
}
