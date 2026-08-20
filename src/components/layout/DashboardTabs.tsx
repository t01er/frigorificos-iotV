import { Tab, Tabs, Spinner, Button, Tooltip } from "@heroui/react";
import {
  PlugCircle,
  ServerMinimalistic,
  StreetsMapPoint,
  Restart,
} from "@solar-icons/react";
import Draggable from "react-draggable";
import {
  useState,
  useEffect,
  useRef,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

const DraggableTabs = Draggable as unknown as ComponentType<{
  children: ReactNode;
  position: { x: number; y: number };
  onStop: (event: MouseEvent, data: { x: number; y: number }) => void;
  bounds?: string | object;
  nodeRef?: React.RefObject<HTMLDivElement | null>;
}>;

export default function DashboardTabs() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();

  const nodeRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPositionLoaded, setIsPositionLoaded] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const savedPos = localStorage.getItem("tabsPosition");

    if (savedPos) {
      try {
        setPosition(JSON.parse(savedPos));
      } catch (e) {
        console.error(
          "Error al leer tabsPosition de localStorage:",
          e
        );
      }
    }

    setIsPositionLoaded(true);
  }, []);

  useEffect(() => {
    setIsNavigating(false);
  }, [location.pathname, searchParams]);

  const currentTab = (() => {
    if (location.pathname === "/dashboard") return "mapa";
    if (location.pathname === "/dashboard/neveras") return "congeladoras";
    if (location.pathname === "/dashboard/jasper") return "jasper";

    return "mapa";
  })();

  const handleSelectionChange = (key: React.Key) => {
    const targetKey = String(key);

    if (targetKey === currentTab) return;

    setIsNavigating(true);

    switch (targetKey) {
      case "mapa":
        navigate("/dashboard");
        break;

      case "congeladoras":
        navigate("/dashboard/neveras");
        break;

      case "jasper":
        navigate("/dashboard/jasper");
        break;
    }
  };
  const neverasTab =
    searchParams.get("tab") || "congeladoras";

  const handleNeverasTabChange = (key: React.Key) => {
    const tab = String(key);

    setSearchParams({
      tab,
    });
  };

  const handleResetPosition = () => {
    setPosition({ x: 0, y: 0 });
    localStorage.removeItem("tabsPosition");
  };

  if (!isPositionLoaded) {
    return (
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-xl shadow-lg border border-white/20 px-4 py-3">
        <Spinner size="sm" color="primary" />
        <span className="text-xs text-gray-500 font-medium">
          Cargando posición...
        </span>
      </div>
    );
  }

  return (
    <DraggableTabs
      nodeRef={nodeRef}
      position={position}
      bounds="body"
      onStop={(_, data) => {
        const newPos = {
          x: data.x,
          y: data.y,
        };

        setPosition(newPos);

        localStorage.setItem(
          "tabsPosition",
          JSON.stringify(newPos)
        );
      }}
    >
      <div
        ref={nodeRef}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 touch-none cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/20 px-2 py-2">

          <div className="flex flex-col">

            <Tabs
              selectedKey={currentTab}
              onSelectionChange={handleSelectionChange}
              color="primary"
              variant="solid"
              isDisabled={isNavigating}
            >
              <Tab
                key="mapa"
                title={
                  <div className="flex items-center gap-2">
                    <StreetsMapPoint size={18} />
                    <span>Mapa</span>
                  </div>
                }
              />

              <Tab
                key="congeladoras"
                title={
                  <div className="flex items-center gap-2">
                    <ServerMinimalistic size={18} />
                    <span>Congeladoras</span>
                  </div>
                }
              />

              <Tab
                key="jasper"
                title={
                  <div className="flex items-center gap-2">
                    <PlugCircle size={18} />
                    <span>Jasper</span>
                  </div>
                }
              />
            </Tabs>

            {location.pathname === "/dashboard/neveras" && (
              <div
                className="flex justify-center mt-1"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <Tabs
                  aria-label="Opciones de congeladoras"
                  selectedKey={neverasTab}
                  onSelectionChange={handleNeverasTabChange}
                  size="sm"
                  variant="underlined"
                  color="primary"
                >
                  <Tab
                    key="congeladoras"
                    title="Por Congeladoras"
                  />

                  <Tab
                    key="distribuidores"
                    title="Por Distribuidores"
                  />
                </Tabs>
              </div>
            )}

          </div>

          <Tooltip
            content="Restablecer posición inicial"
            placement="bottom"
            delay={300}
          >
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="bg-gray-100/80 hover:bg-gray-200/80 text-gray-600 min-w-[32px] w-8 h-8 rounded-xl shrink-0"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onPress={handleResetPosition}
            >
              <Restart size={16} />
            </Button>
          </Tooltip>

        </div>
      </div>
    </DraggableTabs>
  );
}