import { useState, useEffect, useCallback } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  Chip,
  Spinner,
} from "@heroui/react";
import { useGetAlertsHistoricalQuery } from "../../features/alerts/services/alertsApi";
import type { AlertsItem } from "../../features/alerts/services/alertsApi";
import { Bell, Clapperboard } from "@solar-icons/react";
import { useNavigate } from "react-router-dom";

interface AlertDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertClick?: (alert: AlertsItem) => void;
  onAlertsRead?: () => void;
}

const formatDate = (date: string) => {
  if (!date) return "";
  return new Date(date).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getEstadoColor = (estado: string) => {
  const map: Record<string, "secondary" | "danger" | "warning" | "default"> = {
    "desconexión por energía": "warning",
    "detenido fuera de zona": "danger",
    "movimiento fuera de zona": "secondary",
  };
  return map[estado?.toLowerCase()] ?? "default";
};

export default function AlertDrawer({ isOpen, onClose, onAlertsRead }: AlertDrawerProps) {
  const [alerts, setAlerts] = useState<AlertsItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const navigate = useNavigate();

  const getFilterParams = useCallback(() => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const year = oneHourAgo.getFullYear();
    const month = String(oneHourAgo.getMonth() + 1).padStart(2, '0');
    const day = String(oneHourAgo.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    return {
      _fecha_hora: dateStr,
      _or: "desc",
      _order: "alert_dis_fechahora",
      _page: 1,
      _size: 50,
    };
  }, []);

  const { data, isLoading, isFetching, refetch } = useGetAlertsHistoricalQuery(
    getFilterParams(),
    {
      skip: !isOpen,
      pollingInterval: 30000,
    }
  );


  useEffect(() => {
    if (data?.data) {
      setAlerts(data.data);
      setLastUpdate(new Date());
    }
  }, [data]);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (isOpen && onAlertsRead) {
      const timer = setTimeout(() => {
        onAlertsRead();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onAlertsRead]);



  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      placement="right"
      size="md"
    >
      <DrawerContent>
        {(onClose) => (
          <>
            <DrawerHeader className="flex flex-col gap-1 border-b border-gray-200">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold">Alertas</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    isLoading={isFetching}
                    onClick={handleRefresh}
                  >
                    Actualizar
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={onClose}
                  >
                    <Clapperboard className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Última actualización: {lastUpdate.toLocaleTimeString("es-ES")}
              </div>
            </DrawerHeader>

            <DrawerBody className="p-0 overflow-y-auto">
              {isLoading && !alerts.length ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Spinner size="lg" />
                  <p className="text-gray-500">Cargando alertas...</p>
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Bell className="w-12 h-12 text-gray-300" />
                  <p className="text-gray-500">No hay alertas recientes</p>
                  <p className="text-sm text-gray-400">Las alertas aparecerán aquí en tiempo real</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {alerts.map((alert, index) => (
                    <div
                      key={`${alert.alert_dis_cod_nevera}_${alert.alert_dis_fechahora}_${index}`}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        onClose();
                        navigate("/alertas");
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Chip
                              size="sm"
                              variant="flat"
                              color={getEstadoColor(alert.alert_evento)}
                            >
                              {alert.alert_evento}
                            </Chip>
                            
                          </div>

                          <p className="text-sm font-medium text-gray-900 truncate">
                            {alert.alert_dis_cod_nevera}
                          </p>

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                            <span>IMEI: {alert.alert_dis_imei}</span>
                            <span>•</span>
                            <span>{alert.alert_loc_nom}</span>
                            {alert.alert_dis_distribuidor && (
                              <>
                                <span>•</span>
                                <span>{alert.alert_dis_distribuidor}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {formatDate(alert.alert_dis_fechahora)}
                            </span>
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DrawerBody>

            <DrawerFooter className="border-t border-gray-200">
              <div className="flex items-center justify-between w-full text-xs text-gray-500">
                <span>{alerts.length} alertas mostradas</span>
                {isFetching && <Spinner size="sm" />}
                <Button
                  size="sm"
                  variant="light"
                  onPress={() => {
                    onClose();
                    navigate("/alertas");
                  }}
                >
                  Ver todas
                </Button>
              </div>
            </DrawerFooter>
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}