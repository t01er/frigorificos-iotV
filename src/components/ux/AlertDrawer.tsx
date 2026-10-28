import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Drawer,
  DrawerContent,
  Button,
  Input,
  Spinner,
} from "@heroui/react";
import { useGetAlertsHistoricalQuery } from "../../features/alerts/services/alertsApi";
import type { AlertsItem } from "../../features/alerts/services/alertsApi";
import MapModal from "../../features/dashboard/components/MapModal";
import {
  ArrowRight,
  Bell,
  Bolt,
  CheckCircle,
  CloseCircle,
  Delivery,
  Magnifier,
  MapPoint,
  Radar,
  Restart,
} from "@solar-icons/react";
import { useNavigate } from "react-router-dom";
import { formatFechaHora, parseFecha } from "../../utils/fecha";

interface AlertDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAlertClick?: (alert: AlertsItem) => void;
  onAlertsRead?: () => void;
}

type Filtro = "todas" | "energia" | "zona";

const FILTROS: { key: Filtro; label: string; dot?: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "energia", label: "Sin energía", dot: "bg-nx-warn" },
  { key: "zona", label: "Fuera de zona", dot: "bg-nx-err" },
];

const READ_STORAGE_KEY = "alertas-revisadas";
const MAX_READ_KEYS = 500;

const norm = (value?: string | null) =>
  (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const tipoDe = (alert: AlertsItem): Exclude<Filtro, "todas"> | "otro" => {
  const e = norm(alert.alert_evento);
  if (e.includes("energ")) return "energia";
  if (e.includes("zona")) return "zona";
  return "otro";
};

const alertKey = (a: AlertsItem) =>
  `${a.alert_dis_cod_nevera}_${a.alert_dis_fechahora}_${a.alert_evento}`;

const readStored = (): string[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const hoyEtiqueta = (date: Date | null) => {
  if (!date) return "Sin fecha";
  const hoy = new Date();
  const esHoy = date.toDateString() === hoy.toDateString();
  const texto = date
    .toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })
    .replace(/\./g, "");
  return esHoy ? `Hoy · ${texto}` : texto;
};

const iconBtn =
  "size-10 shrink-0 rounded-full bg-nx-surface-2 flex items-center justify-center text-nx-text-2 hover:text-nx-text transition-colors";

export default function AlertDrawer({
  isOpen,
  onClose,
  onAlertsRead,
}: AlertDrawerProps) {
  const [alerts, setAlerts] = useState<AlertsItem[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [busqueda, setBusqueda] = useState("");
  const [revisadas, setRevisadas] = useState<Set<string>>(
    () => new Set(readStored()),
  );
  const [expanded, setExpanded] = useState<string | null>(null);
  const [mapAlert, setMapAlert] = useState<AlertsItem | null>(null);
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
      pollingInterval: 30000,
      refetchOnMountOrArgChange: true,
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

  const persistRevisadas = (next: Set<string>) => {
    setRevisadas(next);
    try {
      localStorage.setItem(
        READ_STORAGE_KEY,
        JSON.stringify([...next].slice(-MAX_READ_KEYS)),
      );
    } catch {
      /* almacenamiento no disponible */
    }
  };

  const marcarRevisada = (alert: AlertsItem) => {
    persistRevisadas(new Set(revisadas).add(alertKey(alert)));
    setExpanded(null);
  };

  const marcarTodas = () =>
    persistRevisadas(new Set([...revisadas, ...alerts.map(alertKey)]));

  const filtradas = useMemo(() => {
    const q = norm(busqueda.trim());
    return alerts.filter((a) => {
      if (filtro !== "todas" && tipoDe(a) !== filtro) return false;
      if (!q) return true;
      return [a.alert_dis_cod_nevera, a.alert_dis_imei, a.alert_dis_distribuidor]
        .map(norm)
        .some((v) => v.includes(q));
    });
  }, [alerts, filtro, busqueda]);

  const grupos = useMemo(() => {
    const map = new Map<string, AlertsItem[]>();
    filtradas.forEach((a) => {
      const label = hoyEtiqueta(parseFecha(a.alert_dis_fechahora));
      map.set(label, [...(map.get(label) ?? []), a]);
    });
    return [...map.entries()];
  }, [filtradas]);

  const sinLeer = alerts.some((a) => !revisadas.has(alertKey(a)));

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="right"
        size="sm"
        hideCloseButton
        classNames={{
          base: "!m-3 !h-[calc(100dvh-1.5rem)] !rounded-3xl bg-nx-surface overflow-hidden",
        }}
      >
        <DrawerContent>
          {(close) => (
            <div className="flex flex-col h-full min-h-0 text-nx-text">
              <div className="flex flex-col gap-4 p-5 pb-4">
                <div className="flex items-center gap-3">
                  <span className="size-11 shrink-0 rounded-2xl bg-nx-purple/10 text-nx-purple flex items-center justify-center">
                    <Bell size={22} />
                  </span>
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <h2 className="text-lg font-bold leading-none">Alertas</h2>
                      {alerts.length > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-nx-purple text-white text-[11px] font-semibold">
                          {alerts.length} recientes
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-nx-text-3">
                      <span className="size-1.5 rounded-full bg-nx-ok" />
                      En vivo · actualizado{" "}
                      <span className="font-mono text-nx-text-2">
                        {lastUpdate.toLocaleTimeString("es-PE", { hour12: false })}
                      </span>
                    </span>
                  </div>
                  <Button
                    isIconOnly
                    radius="full"
                    aria-label="Actualizar"
                    isLoading={isFetching}
                    className="bg-nx-surface-2 text-nx-text-2 size-10 min-w-10"
                    onPress={handleRefresh}
                  >
                    <Restart size={18} />
                  </Button>
                  <button
                    type="button"
                    aria-label="Cerrar"
                    onClick={close}
                    className={iconBtn}
                  >
                    <CloseCircle size={18} />
                  </button>
                </div>

                <div className="flex gap-1 rounded-full bg-nx-surface-2 p-1">
                  {FILTROS.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      aria-pressed={filtro === f.key}
                      onClick={() => setFiltro(f.key)}
                      className={`flex-1 h-9 rounded-full flex items-center justify-center gap-1.5 text-xs transition-colors ${
                        filtro === f.key
                          ? "bg-nx-surface text-nx-text font-semibold"
                          : "text-nx-text-2 hover:text-nx-text"
                      }`}
                    >
                      {f.dot && <span className={`size-1.5 rounded-full ${f.dot}`} />}
                      {f.label}
                    </button>
                  ))}
                </div>

                <Input
                  aria-label="Buscar alertas"
                  placeholder="Buscar por código, IMEI o distribuidor"
                  value={busqueda}
                  onValueChange={setBusqueda}
                  isClearable
                  radius="full"
                  variant="flat"
                  startContent={<Magnifier size={16} className="text-nx-text-3" />}
                  classNames={{
                    inputWrapper: "bg-nx-surface-2 shadow-none h-11",
                    input: "text-sm",
                  }}
                />
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto border-t border-nx-line">
                {isLoading && !alerts.length ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Spinner size="lg" />
                    <p className="text-nx-text-3">Cargando alertas...</p>
                  </div>
                ) : filtradas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-6">
                    <Bell size={44} className="text-nx-line" />
                    <p className="text-nx-text-2">
                      {alerts.length === 0
                        ? "No hay alertas recientes"
                        : "Ninguna alerta coincide con tu búsqueda"}
                    </p>
                    {alerts.length === 0 && (
                      <p className="text-sm text-nx-text-3">
                        Las alertas aparecerán aquí en tiempo real
                      </p>
                    )}
                  </div>
                ) : (
                  grupos.map(([fecha, items], gi) => (
                    <section key={fecha}>
                      <div className="flex items-center justify-between px-5 pt-4 pb-2 text-xs">
                        <span className="text-nx-text-3">{fecha}</span>
                        {gi === 0 && sinLeer && (
                          <button
                            type="button"
                            onClick={marcarTodas}
                            className="font-medium text-nx-purple hover:underline"
                          >
                            Marcar todo como leído
                          </button>
                        )}
                      </div>

                      <ul>
                        {items.map((alert, i) => {
                          const key = alertKey(alert);
                          const unread = !revisadas.has(key);
                          const tipo = tipoDe(alert);
                          const open = expanded === key;
                          const hora = formatFechaHora(alert.alert_dis_fechahora)?.hora.slice(0, 5);

                          return (
                            <li
                              key={`${key}_${i}`}
                              className={
                                open
                                  ? "mx-3 my-1 rounded-2xl bg-nx-purple/5 border border-nx-purple/20"
                                  : "border-b border-nx-line/70 last:border-b-0"
                              }
                            >
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => setExpanded(open ? null : key)}
                                onKeyDown={(e) =>
                                  (e.key === "Enter" || e.key === " ") &&
                                  setExpanded(open ? null : key)
                                }
                                className="flex items-start gap-3 px-4 py-3.5 cursor-pointer"
                              >
                                <span
                                  className={`size-11 shrink-0 rounded-2xl flex items-center justify-center ${
                                    tipo === "zona"
                                      ? "bg-nx-err-soft text-nx-err-ink"
                                      : "bg-nx-warn-soft text-nx-warn-ink"
                                  }`}
                                >
                                  {tipo === "zona" ? <Radar size={20} /> : <Bolt size={20} />}
                                </span>

                                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="flex items-center gap-1.5 min-w-0">
                                      <span className="font-mono font-bold text-[15px] truncate">
                                        {alert.alert_dis_cod_nevera}
                                      </span>
                                      {unread && (
                                        <span className="size-1.5 rounded-full bg-nx-purple shrink-0" />
                                      )}
                                    </span>
                                    <span className="font-mono text-xs text-nx-text-3 shrink-0">
                                      {hora}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-sm font-semibold ${
                                      tipo === "zona" ? "text-nx-err-ink" : "text-nx-warn-ink"
                                    }`}
                                  >
                                    {alert.alert_evento}
                                  </span>
                                  <span className="flex flex-wrap items-center gap-x-3 text-xs text-nx-text-2">
                                    {alert.alert_loc_nom && (
                                      <span className="flex items-center gap-1">
                                        <MapPoint size={12} className="text-nx-text-3" />
                                        {alert.alert_loc_nom}
                                      </span>
                                    )}
                                    {alert.alert_dis_distribuidor && (
                                      <span className="flex items-center gap-1">
                                        <Delivery size={12} className="text-nx-text-3" />
                                        {alert.alert_dis_distribuidor}
                                      </span>
                                    )}
                                  </span>
                                  <span className="font-mono text-[11px] text-nx-text-3">
                                    IMEI {alert.alert_dis_imei}
                                  </span>
                                </div>
                              </div>

                              {open && (
                                <div className="flex gap-2 px-4 pb-4">
                                  <Button
                                    radius="full"
                                    variant="flat"
                                    className="flex-1 bg-nx-surface text-nx-text font-medium border border-nx-line"
                                    startContent={<MapPoint size={16} />}
                                    onPress={() => setMapAlert(alert)}
                                  >
                                    Ver en mapa
                                  </Button>
                                  <Button
                                    radius="full"
                                    className="flex-1 bg-nx-purple text-white font-medium"
                                    startContent={<CheckCircle size={16} />}
                                    onPress={() => marcarRevisada(alert)}
                                    isDisabled={!unread}
                                  >
                                    Marcar revisada
                                  </Button>
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  ))
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-nx-line p-4">
                <div className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">
                    {filtradas.length} de {alerts.length} alertas
                  </span>
                  <span className="text-xs text-nx-text-3">
                    {filtradas.length > 6 ? "Desplázate para ver más" : "Actualizadas cada 30 s"}
                  </span>
                </div>
                <Button
                  radius="full"
                  className="bg-nx-gradient text-white font-semibold"
                  endContent={<ArrowRight size={16} />}
                  onPress={() => {
                    close();
                    navigate("/alertas");
                  }}
                >
                  Ver todas las alertas
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <MapModal
        isOpen={!!mapAlert}
        onClose={() => setMapAlert(null)}
        nevera={
          mapAlert
            ? {
                cod_nevera: mapAlert.alert_dis_cod_nevera,
                imei: mapAlert.alert_dis_imei,
                latitud: mapAlert.alert_dis_lat,
                longitud: mapAlert.alert_dis_lon,
                alert_evento: mapAlert.alert_evento,
              }
            : null
        }
      />
    </>
  );
}
