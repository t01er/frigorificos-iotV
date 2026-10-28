import { useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import PageContainer from "../../../layouts/PageContainer";
import NeverasTabla from "../components/NeverasTabla";
import NeverasStatsRow from "../components/NeverasStatsRow";
import DownloadMenu from "../components/DownloadMenu";
import GraficoDistribuidor, { AlertasLegend } from "../components/GraficoDistribuidor";
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

  const isDistribuidores = activeTab === "distribuidores";

  return (
    <PageContainer>
      <div className="flex flex-col gap-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-nx-text">
              {isDistribuidores ? "Alertas por distribuidor" : "Congeladoras"}
            </h1>
            <p className="text-sm text-nx-text-3">
              {isDistribuidores
                ? "Neveras alertadas agrupadas por región y distribuidor"
                : "Estado, ubicación y última transmisión de cada nevera"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isDistribuidores && <AlertasLegend />}
            <DownloadMenu />
          </div>
        </header>

        {!isDistribuidores && (
          <NeverasStatsRow
            activeFilter={activeFilter}
            onFilterByEstado={handleFilterByEstado}
            onClearFilters={handleClearAllFilters}
          />
        )}

        {isDistribuidores && (
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
      </div>
    </PageContainer>
  );
}
