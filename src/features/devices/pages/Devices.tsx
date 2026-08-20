import { Accordion, AccordionItem } from "@heroui/react";
import PageContainer from "../../../layouts/PageContainer";
import DeviceTabla from "../components/DeviceTabla";

export default function Devices() {
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
          aria-label="Configurar dispositivos registrados"
          title="Configurar dispositivos registrados"
          className=""
          classNames={{
            base: "p-0 overflow-hidden",
            heading: "p-0 ",
            trigger: "bg-primary text-white px-4 py-3 rounded-none ",
            title: "text-white",
          }}
        >
          <DeviceTabla />
        </AccordionItem>
      </Accordion>
    </PageContainer>
  );
}