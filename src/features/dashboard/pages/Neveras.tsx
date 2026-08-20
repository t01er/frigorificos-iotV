import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import PageContainer from "../../../layouts/PageContainer";
import NeverasTabla from "../components/NeverasTabla";
import GraphicsCountNeveras from "../components/GraphicsCountNeveras";
import GraficoDistribuidor from "../components/GraficoDistribuidor";
import { useNeveraFilterContext } from "../contexts/NeveraFilterContext";

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
        <GraficoDistribuidor
          onDistribuidorClick={handleDistribuidorClick}
          onEstadoClick={handleEstadoFromGrafico}
          onClearFilters={handleClearAllFilters}
        />
      )}

      <NeverasTabla
        externalFilter={activeFilter}
        onClearExternalFilter={handleClearAllFilters}
      />

    </PageContainer>
  );
}