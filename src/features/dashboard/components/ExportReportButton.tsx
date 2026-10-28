import { Button, CircularProgress } from "@heroui/react";
import { Download } from "@solar-icons/react";

import { DOWNLOAD_CONFIGS } from "../../../config/downloads";
import { useDownload } from "../../../hooks/useDownload";
import { useNeveraFilterContext } from "../contexts/NeveraFilterContext";

const config = DOWNLOAD_CONFIGS.neverasDashboard;

export default function ExportReportButton() {
  const { codNeveraFilter, imeiFilter, locacionFilter, distribuidorFilter } =
    useNeveraFilterContext();

  const { download, loading } = useDownload({
    url: config.url,
    method: config.method,
    fileName: config.fileName,
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
  });

  let roles: string[] = [];
  try {
    roles = JSON.parse(localStorage.getItem("user") ?? "{}")?.roles ?? [];
  } catch {
    roles = [];
  }
  if (!roles.some((rol) => config.rolesPermitidos.includes(rol))) return null;

  return (
    <Button
      radius="full"
      className="bg-nx-gradient text-white font-semibold"
      startContent={!loading && <Download size={18} />}
      isDisabled={loading}
      onPress={() => {
        download().catch((err) =>
          alert(
            err instanceof Error ? err.message : "No se pudo descargar el reporte.",
          ),
        );
      }}
    >
      {loading ? (
        <CircularProgress size="sm" aria-label="Descargando" color="default" />
      ) : (
        "Exportar reporte"
      )}
    </Button>
  );
}
