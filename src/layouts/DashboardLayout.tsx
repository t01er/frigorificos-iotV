import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { NeveraFilterProvider } from "../features/dashboard/contexts/NeveraFilterContext";
import { apiSlice } from "../app/apiSlice";

export default function DashboardLayout() {
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(() => {
    try {
      return JSON.parse(localStorage.getItem("sidebar-expanded") ?? "false");
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("sidebar-expanded", JSON.stringify(sidebarExpanded));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [sidebarExpanded]);

  // Limpia la caché de RTK Query y remonta la página para forzar una nueva carga
  const handleRefresh = () => {
    dispatch(apiSlice.util.resetApiState());
    setRefreshKey((k) => k + 1);
  };

  return (
    <NeveraFilterProvider>
      <div className="relative isolate flex flex-col h-screen overflow-hidden gap-3 p-3 bg-nx-shell text-nx-text">
        <div className="nx-glow" aria-hidden="true" />
        <div className="relative z-10">
          <Navbar
            sidebarExpanded={sidebarExpanded}
            onOpenMenu={() => setMobileMenuOpen(true)}
            onRefresh={handleRefresh}
          />
        </div>
        <div className="relative z-10 flex flex-1 min-h-0 gap-3">
          <Sidebar
            isExpanded={sidebarExpanded}
            onToggleExpanded={() => setSidebarExpanded((v) => !v)}
            mobileOpen={mobileMenuOpen}
            onMobileClose={() => setMobileMenuOpen(false)}
          />
          <main className="flex-1 min-w-0 min-h-0 overflow-auto">
            <Outlet key={refreshKey} />
          </main>
        </div>
      </div>
    </NeveraFilterProvider>
  );
}
