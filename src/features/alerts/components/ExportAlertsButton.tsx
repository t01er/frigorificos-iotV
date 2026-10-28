import { Button, CircularProgress } from "@heroui/react";
import { Download } from "@solar-icons/react";

import { DOWNLOAD_CONFIGS } from "../../../config/downloads";
import { useDownload } from "../../../hooks/useDownload";

const config = DOWNLOAD_CONFIGS.alertasActivas;

export default function ExportAlertsButton() {
    const { download, loading } = useDownload({ url: config.url });

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
            isDisabled={loading}
            className="bg-nx-gradient text-white font-semibold"
            startContent={!loading && <Download size={18} />}
            onPress={() => {
                download().catch((err) =>
                    alert(
                        err instanceof Error
                            ? err.message
                            : "No se pudo descargar el archivo.",
                    ),
                );
            }}
        >
            {loading ? (
                <CircularProgress size="sm" aria-label="Descargando" color="default" />
            ) : (
                "Exportar"
            )}
        </Button>
    );
}
