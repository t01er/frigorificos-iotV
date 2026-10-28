import { useMemo } from "react";
import {
  Button,
  CircularProgress,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { AltArrowDown, Download } from "@solar-icons/react";

import { DOWNLOAD_CONFIGS } from "../../../config/downloads";
import { useDownload } from "../../../hooks/useDownload";
import { useNeveraFilterContext } from "../contexts/NeveraFilterContext";

const pad = (n: number) => String(n).padStart(2, "0");
const fechaHora = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const fechaCorta = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default function DownloadMenu() {
  const { codNeveraFilter, imeiFilter, locacionFilter, distribuidorFilter } =
    useNeveraFilterContext();

  // Las opciones de descarga se pasan como override en cada acción
  const { download, loading } = useDownload({ url: "" });

  let roles: string[] = [];
  try {
    roles = JSON.parse(localStorage.getItem("user") ?? "{}")?.roles ?? [];
  } catch {
    roles = [];
  }

  const items = useMemo(() => {
    const hoy = new Date();
    const haceUnMes = new Date(hoy);
    haceUnMes.setMonth(haceUnMes.getMonth() - 1);

    return [
      {
        key: "censo",
        label: "Censo actualizado",
        config: DOWNLOAD_CONFIGS.censo,
        options: {},
      },
      {
        key: "cartera",
        label: "Cartera actualizada",
        config: DOWNLOAD_CONFIGS.cartera,
        options: {},
      },
      {
        key: "bitacora",
        label: "Bitácora (último mes)",
        config: DOWNLOAD_CONFIGS.bitacora,
        confirm:
          "Esta operación generará un archivo comprimido (.zip) con la bitácora del último mes y puede tardar unos minutos.\n\n¿Está seguro de proceder?",
        options: {
          method: "POST" as const,
          body: { fechaInicio: fechaHora(haceUnMes), fechaFin: fechaHora(hoy) },
          fileName: `Bitacora_${fechaCorta(haceUnMes)}_al_${fechaCorta(hoy)}.zip`,
        },
      },
      {
        key: "neverasDashboard",
        label: "Lista general de neveras",
        config: DOWNLOAD_CONFIGS.neverasDashboard,
        options: {
          method: "POST" as const,
          fileName: DOWNLOAD_CONFIGS.neverasDashboard.fileName,
          body: {
            _cod_nevera: codNeveraFilter || "",
            _imei: imeiFilter || "",
            _locacion: locacionFilter || "",
            _distribuidor: distribuidorFilter || "",
            _estado: "",
            _movimiento: "",
            _order: "dis_ult_conex",
            _or: "desc",
            _page: 1,
            _size: 9999,
          },
        },
      },
    ].filter((i) =>
      roles.some((rol) => i.config.rolesPermitidos.includes(rol)),
    );
  }, [codNeveraFilter, imeiFilter, locacionFilter, distribuidorFilter, roles.join(",")]);

  if (items.length === 0) return null;

  const run = async (key: string) => {
    const item = items.find((i) => i.key === key);
    if (!item) return;
    if (item.confirm && !window.confirm(item.confirm)) return;
    try {
      await download({ url: item.config.url, ...item.options });
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "No se pudo descargar el archivo. Intente de nuevo.",
      );
    }
  };

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Button
          radius="full"
          isDisabled={loading}
          className="bg-nx-gradient text-white font-semibold"
          startContent={
            loading ? (
              <CircularProgress size="sm" aria-label="Descargando" color="default" />
            ) : (
              <Download size={18} />
            )
          }
          endContent={<AltArrowDown size={14} />}
        >
          Descargar
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Descargas"
        onAction={(key) => run(String(key))}
      >
        {items.map((item) => (
          <DropdownItem key={item.key}>{item.label}</DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
