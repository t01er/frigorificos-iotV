import PageContainer from "../../../layouts/PageContainer";
import AlertasActivasTabla from "../components/AlertasActivasTabla";
import HistorialAlertasTabla from "../components/HistorialAlertasTabla";
import CorreosNestleTabla from "../components/CorreosNestleTabla";

import { Accordion, AccordionItem } from "@heroui/react";

export default function Alerts() {
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
          aria-label="Alertas Históricas"
          title="Alertas Históricas"
          classNames={{
            base: "p-0 overflow-hidden",
            heading: "p-0",
            trigger: "bg-primary px-4 py-3 rounded-none",
            title: "text-white",
          }}
        >
          <HistorialAlertasTabla />
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