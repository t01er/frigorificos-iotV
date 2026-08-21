import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import PageContainer from "../../../layouts/PageContainer";
import NeverasTabla from "../components/NeverasTabla";
import GraphicsCountNeveras from "../components/GraphicsCountNeveras";
import GraficoDistribuidor from "../components/GraficoDistribuidor";
import { useNeveraFilterContext } from "../contexts/NeveraFilterContext";
import { Accordion, AccordionItem } from "@heroui/react";

export default function Neveras() {
  const [activeFilter, setActiveFilter] = useState<string>("");

  const [searchParams] = useSearchParams();

  const activeTab =
    searchParams.get("tab") || "congeladoras";

  const { clearAllFilters } = useNeveraFilterContext();

  const handleFilterByEstado = useCallback(
    (estadoLabel: string) => {
      setActiveFilter(estadoLabel);
    },
    []
  );

  const handleClearAllFilters = useCallback(() => {
    setActiveFilter("");
    clearAllFilters();
  }, [clearAllFilters]);

  const handleDistribuidorClick = useCallback(() => {
    setActiveFilter("");
  }, []);

  const handleEstadoFromGrafico = useCallback(
    (estado: string) => {
      setActiveFilter(estado);
    },
    []
  );

  return (
    <PageContainer>


      {activeTab === "congeladoras" && (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-2">
          <GraphicsCountNeveras
            layout="grid"
            onFilterByEstado={handleFilterByEstado}
            onClearFilters={handleClearAllFilters}
          />
        </div>
      )}


      {activeTab === "distribuidores" && (

        <Accordion
          defaultExpandedKeys={["1", "2", "3"]}
          selectionMode="multiple"
          variant="splitted"
          className="gap-3"
        >
          <AccordionItem
            key="3"
            aria-label="Grafico por Distribuidor"
            title="Grafico por Distribuidor"
            classNames={{
              base: "p-0 overflow-hidden",
              heading: "p-0",
              trigger: "bg-primary px-4 py-3 rounded-none",
              title: "text-white",
            }}
          >
            <GraficoDistribuidor
              onDistribuidorClick={handleDistribuidorClick}
              onEstadoClick={handleEstadoFromGrafico}
              onClearFilters={handleClearAllFilters}
            />
          </AccordionItem>
        </Accordion>
      )}

      <NeverasTabla
        externalFilter={activeFilter}
        onClearExternalFilter={handleClearAllFilters}
      />

    </PageContainer>
  );
}