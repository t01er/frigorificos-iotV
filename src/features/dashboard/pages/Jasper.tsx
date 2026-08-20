import PageContainer from "../../../layouts/PageContainer";
import JasperAlertasTabla from "../components/JasperAlertasTabla";
import JasperBitacoraTabla from "../components/JasperBitacoraTabla";
import { Accordion, AccordionItem } from "@heroui/react";

export default function Jasper() {
  return (
    <PageContainer>
      <Accordion defaultExpandedKeys={["2", "1"]} selectionMode="multiple" variant="splitted">
        <AccordionItem classNames={{
          base: "p-0 overflow-hidden",
          heading: "p-0 ",
          trigger: "bg-primary text-white px-4 py-3 rounded-none ",
          title: "text-white",
        }} key="1" aria-label="Jasper Alertas" title="Alertas Jasper">
          <JasperAlertasTabla />
        </AccordionItem>
        <AccordionItem classNames={{
          base: "p-0 overflow-hidden",
          heading: "p-0 ",
          trigger: "bg-primary text-white px-4 py-3 rounded-none ",
          title: "text-white",
        }} key="2" aria-label="Bitacora Jasper" title="Bitacora Jasper">
          <JasperBitacoraTabla />
        </AccordionItem>
      </Accordion>
    </PageContainer>
  );
}
