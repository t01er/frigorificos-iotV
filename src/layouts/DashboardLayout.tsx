import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import DashboardTabs from "../components/layout/DashboardTabs";
import { NeveraFilterProvider } from "../features/dashboard/contexts/NeveraFilterContext";

export default function DashboardLayout() {
  const location = useLocation();

  const isDashboardHome = location.pathname === "/dashboard" || location.pathname === "/dashboard/neveras" || location.pathname === "/dashboard/jasper";

  return (
    <NeveraFilterProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        {isDashboardHome && <DashboardTabs />}
        <div className="flex flex-col flex-1 min-w-0 relative">
          <Navbar />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </NeveraFilterProvider>
  );
}