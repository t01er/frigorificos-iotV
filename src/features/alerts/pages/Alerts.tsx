import { useState } from "react";
import PageContainer from "../../../layouts/PageContainer";
import AlertasActivasTabla from "../components/AlertasActivasTabla";
import HistorialAlertasTabla from "../components/HistorialAlertasTabla";
import CorreosNestleTabla from "../components/CorreosNestleTabla";

import { Accordion, AccordionItem } from "@heroui/react";

export default function Alerts() {
  const [totalHistorial, setTotalHistorial] = useState(0);
  return (
    <PageContainer>
      <Accordion
        defaultExpandedKeys={["1", "2", "3"]}
        selectionMode="multiple"
        variant="splitted"
        className="gap-3"
      >
        <AccordionItem
          key="1"
          aria-label="Alertas Activas"
          title="Alertas Activas"
          className=""
          classNames={{
            base: "p-0 overflow-hidden",
            heading: "p-0 ",
            trigger: "bg-primary text-white px-4 py-3 rounded-none ",
            title: "text-white",
          }}
        >
          <AlertasActivasTabla />
        </AccordionItem>

        <AccordionItem
          key="2"
          aria-label="Historial de eventos de los últimos 3 meses"
          title={
            <div className="flex items-center gap-2">
              <span>Historial de eventos de los últimos 3 meses</span>

              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {totalHistorial}
              </span>
            </div>
          }
          classNames={{
            base: "p-0 overflow-hidden",
            heading: "p-0",
            trigger: "bg-primary px-4 py-3 rounded-none",
            title: "text-white",
          }}
        >
          <HistorialAlertasTabla onTotalChange={setTotalHistorial} />
        </AccordionItem>

        <AccordionItem
          key="3"
          aria-label="Contactos para Alertas"
          title="Contactos para Alertas"
          classNames={{
            base: "p-0 overflow-hidden",
            heading: "p-0",
            trigger: "bg-primary px-4 py-3 rounded-none",
            title: "text-white",
          }}
        >
          <CorreosNestleTabla />
        </AccordionItem>
      </Accordion>
    </PageContainer>
  );
}