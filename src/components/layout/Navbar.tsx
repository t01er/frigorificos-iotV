import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Avatar,
  Badge,
  BreadcrumbItem,
  Breadcrumbs,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Tab,
  Tabs,
} from "@heroui/react";
import {
  AltArrowDown,
  Bell,
  Delivery,
  HamburgerMenu,
  Home2,
  Logout3,
  Magnifier,
  Restart,
  Routing2,
  ServerMinimalistic,
  StreetsMapPoint,
} from "@solar-icons/react";

import AlertDrawer from "../../components/ux/AlertDrawer";
import type { AlertsItem } from "../../features/alerts/services/alertsApi";
import { useAlertCounter } from "../../hooks/useAlertCounter";
import { useNeveraFilterContext } from "../../features/dashboard/contexts/NeveraFilterContext";
import { logout } from "../../features/auth/authSlice";

const routeInfoMap = [
  { keyword: "/dashboard/location", title: "Ubicación" },
  { keyword: "/dashboard/device", title: "Detalle de dispositivo" },
  { keyword: "/dashboard", title: "Inicio" },
  { keyword: "/devices", title: "Dispositivos" },
  { keyword: "/graphics", title: "Gráficos" },
  { keyword: "/alerts", title: "Alertas" },
  { keyword: "/users", title: "Usuarios" },
  { keyword: "/client", title: "Clientes" },
  { keyword: "/command", title: "Línea de comandos" },
];

const DASHBOARD_ROUTES = [
  "/dashboard",
  "/dashboard/neveras",
  "/dashboard/jasper",
];

const pill =
  "flex items-center h-12 rounded-full bg-nx-surface";

const iconBtn =
  "size-9 rounded-full flex items-center justify-center text-nx-text-2 hover:text-nx-text hover:bg-nx-surface-2 transition-colors";

interface NavbarProps {
  sidebarExpanded: boolean;
  onOpenMenu: () => void;
  onRefresh: () => void;
}

function DashboardTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const currentTab = (() => {
    if (location.pathname === "/dashboard/jasper") return "jasper";
    if (location.pathname.startsWith("/dashboard/neveras/")) return "congeladoras";
    if (location.pathname === "/dashboard/neveras") {
      return searchParams.get("tab") === "distribuidores"
        ? "distribuidores"
        : "congeladoras";
    }
    return "mapa";
  })();

  const go = (key: React.Key) => {
    switch (String(key)) {
      case "mapa":
        return navigate("/dashboard");
      case "congeladoras":
        return navigate("/dashboard/neveras?tab=congeladoras");
      case "distribuidores":
        return navigate("/dashboard/neveras?tab=distribuidores");
      case "jasper":
        return navigate("/dashboard/jasper");
    }
  };

  const title = (icon: React.ReactNode, label: string) => (
    <div className="flex items-center gap-2">
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </div>
  );

  return (
    <div className={`${pill} px-1.5`}>
      <Tabs
        aria-label="Secciones del dashboard"
        selectedKey={currentTab}
        onSelectionChange={go}
        radius="full"
        classNames={{
          tabList: "bg-transparent p-0 gap-1",
          cursor: "bg-nx-ink shadow-none",
          tab: "h-9 px-3.5",
          tabContent:
            "text-nx-text-2 group-data-[selected=true]:text-nx-surface font-medium",
        }}
      >
        <Tab key="mapa" title={title(<StreetsMapPoint size={17} />, "Mapa")} />
        <Tab
          key="congeladoras"
          title={title(<ServerMinimalistic size={17} />, "Congeladoras")}
        />
        <Tab
          key="distribuidores"
          title={title(<Delivery size={17} />, "Distribuidores")}
        />
        {/* <Tab key="jasper" title={title(<Routing2 size={17} />, "Jasper")} /> */}
      </Tabs>
    </div>
  );
}

export default function Navbar({
  sidebarExpanded,
  onOpenMenu,
  onRefresh,
}: NavbarProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  const user = useSelector((state: any) => state.auth.user);
  const location = useLocation();

  const { unreadCount, refreshCount } = useAlertCounter();
  const { codNeveraFilter, setCodNeveraFilter } = useNeveraFilterContext();

  const isDashboard =
    DASHBOARD_ROUTES.includes(location.pathname) ||
    location.pathname.startsWith("/dashboard/neveras/");

  const pageTitle = useMemo(() => {
    const matched = routeInfoMap.find((route) =>
      location.pathname.startsWith(route.keyword),
    );
    return matched?.title ?? "Inicio";
  }, [location.pathname]);

  const role = String(user?.roles?.[0] ?? "")
    .replace(/^ROLE_/i, "")
    .toLowerCase();

  const handleAlertClick = (alert: AlertsItem) => {
    console.log("Alerta seleccionada:", alert);
    setIsAlertDrawerOpen(false);
  };

  return (
    <>
      <header className="flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={onOpenMenu}
            className={`${pill} md:hidden size-12 shrink-0 justify-center text-nx-text`}
          >
            <HamburgerMenu size={20} />
          </button>

          <Link
            to="/dashboard"
            className={`${pill} hidden md:flex gap-2.5 px-2 shrink-0 overflow-hidden transition-[width] duration-300 ${
              sidebarExpanded ? "w-[232px]" : "w-[58px] justify-center"
            }`}
          >
            <img
              src="/logolabotec.png"
              alt="Labotec"
              className="size-10 rounded-full"
            />
            {sidebarExpanded && (
              <span className="font-bold text-nx-text">Labotec</span>
            )}
          </Link>
          {isDashboard ? (
            <DashboardTabs />
          ) : (
            <div className={`${pill} pl-2 pr-5 min-w-0`}>
              <Link
                to="/dashboard"
                aria-label="Ir al inicio"
                className="size-8 shrink-0 rounded-full bg-nx-surface-2 flex items-center justify-center text-nx-text-2 hover:text-nx-text transition-colors"
              >
                <Home2 size={16} />
              </Link>
              <Breadcrumbs
                size="sm"
                className="pl-3 min-w-0"
                itemClasses={{
                  item: "text-nx-text-3 data-[current=true]:text-nx-text data-[current=true]:font-semibold",
                  separator: "text-nx-text-3 px-1.5",
                }}
              >
                <BreadcrumbItem>Panel</BreadcrumbItem>
                <BreadcrumbItem isCurrent>{pageTitle}</BreadcrumbItem>
              </Breadcrumbs>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isDashboard && (
            <div className={`${pill} hidden lg:flex w-64 xl:w-72 px-4`}>
              <Input
                aria-label="Buscar código de nevera"
                placeholder="Buscar código de nevera..."
                value={codNeveraFilter}
                onValueChange={setCodNeveraFilter}
                isClearable
                size="sm"
                variant="flat"
                startContent={<Magnifier size={18} className="text-nx-text-3" />}
                classNames={{
                  inputWrapper:
                    "bg-transparent shadow-none data-[hover=true]:bg-transparent group-data-[focus=true]:bg-transparent px-0",
                  input: "text-sm text-nx-text placeholder:text-nx-text-3",
                }}
              />
            </div>
          )}

          <div className={`${pill} gap-1 px-1.5`}>
            {isDashboard && (
              <button
                type="button"
                aria-label="Actualizar datos"
                onClick={onRefresh}
                className={iconBtn}
              >
                <Restart size={18} />
              </button>
            )}
            <Badge
              content={unreadCount > 99 ? "99+" : unreadCount}
              isInvisible={unreadCount === 0}
              color="danger"
              size="sm"
              shape="circle"
            >
              <button
                type="button"
                aria-label="Ver alertas"
                onClick={() => setIsAlertDrawerOpen(true)}
                className={iconBtn}
              >
                <Bell size={18} />
              </button>
            </Badge>
          </div>

          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <button
                type="button"
                aria-label="Menú de usuario"
                className={`${pill} gap-2.5 pl-1.5 pr-3`}
              >
                <Avatar
                  name={(user?.username || "A").slice(0, 2).toUpperCase()}
                  className="size-9 bg-nx-gradient text-white text-xs font-semibold"
                />
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-semibold text-nx-text">
                    {user?.username || "Usuario IoT"}
                  </span>
                  {role && (
                    <span className="text-xs text-nx-text-3 capitalize">
                      {role}
                    </span>
                  )}
                </div>
                <AltArrowDown
                  size={14}
                  className="hidden sm:block text-nx-text-3"
                />
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Usuario">
              <DropdownItem
                key="logout"
                color="danger"
                className="text-danger"
                startContent={<Logout3 size={18} />}
                onPress={() => {
                  dispatch(logout());
                  navigate("/login");
                }}
              >
                Cerrar sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </header>

      <AlertDrawer
        isOpen={isAlertDrawerOpen}
        onClose={() => setIsAlertDrawerOpen(false)}
        onAlertClick={handleAlertClick}
        onAlertsRead={refreshCount}
      />
    </>
  );
}
