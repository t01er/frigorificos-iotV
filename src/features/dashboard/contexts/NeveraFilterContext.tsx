import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface NeveraFilterContextType {
  distribuidorFilter: string;
  codNeveraFilter: string;
  imeiFilter: string;
  locacionFilter: string;
  estadoFilter: string;
  setDistribuidorFilter: (distribuidor: string) => void;
  setCodNeveraFilter: (cod: string) => void;
  setImeiFilter: (imei: string) => void;
  setLocacionFilter: (loc: string) => void;
  setEstadoFilter: (estado: string) => void;
  clearAllFilters: () => void;
  getDistribuidoresForApi: () => string;
}

const NeveraFilterContext = createContext<NeveraFilterContextType | undefined>(undefined);

export function NeveraFilterProvider({ children }: { children: ReactNode }) {
  const [distribuidorFilter, setDistribuidorFilter] = useState<string>("");
  const [codNeveraFilter, setCodNeveraFilter] = useState<string>("");
  const [imeiFilter, setImeiFilter] = useState<string>("");
  const [locacionFilter, setLocacionFilter] = useState<string>("");
  const [estadoFilter, setEstadoFilter] = useState<string>("");

  const clearAllFilters = useCallback(() => {
    setDistribuidorFilter("");
    setCodNeveraFilter("");
    setImeiFilter("");
    setLocacionFilter("");
    setEstadoFilter("");
  }, []);

  const getDistribuidoresForApi = useCallback(() => {
    if (!distribuidorFilter) return "";

    if (distribuidorFilter.includes(',')) {
      return distribuidorFilter;
    }

    return distribuidorFilter;
  }, [distribuidorFilter]);

  const value = {
    distribuidorFilter,
    codNeveraFilter,
    imeiFilter,
    locacionFilter,
    estadoFilter,
    setDistribuidorFilter,
    setCodNeveraFilter,
    setImeiFilter,
    setLocacionFilter,
    setEstadoFilter,
    clearAllFilters,
    getDistribuidoresForApi,
  };

  return (
    <NeveraFilterContext.Provider value={value}>
      {children}
    </NeveraFilterContext.Provider>
  );
}

export function useNeveraFilterContext() {
  const context = useContext(NeveraFilterContext);
  if (context === undefined) {
    throw new Error('useNeveraFilterContext debe usarse dentro de NeveraFilterProvider');
  }
  return context;
}