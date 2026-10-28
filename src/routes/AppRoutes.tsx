import { BrowserRouter, Routes, Route } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
// import TabsLayout from "../layouts/TabsLayout";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../features/auth/pages/Login";
import Dashboard from "../features/dashboard/pages/Dashboard";
import Neveras from "../features/dashboard/pages/Neveras";
import NeveraDetalle from "../features/dashboard/pages/NeveraDetalle";
import Jasper from "../features/dashboard/pages/Jasper";
import NotFound from "../features/notFound/pages/NotFound";
import Devices from "../features/devices/pages/Devices";
import Alerts from "../features/alerts/pages/Alerts";
import Users from "../features/users/page/Users";
import Indicadores from "../features/indicadores/page/Indicadores";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Login />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>

          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/neveras" element={<Neveras />} />
            <Route path="/dashboard/neveras/:codigo" element={<NeveraDetalle />} />
            <Route path="/dashboard/jasper" element={<Jasper />} />
            <Route path="/sensores" element={<Devices />} />
            <Route path="/alertas" element={<Alerts />} />
            <Route path="/usuarios" element={<Users />} />
            <Route path="/indicadores" element={<Indicadores />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
