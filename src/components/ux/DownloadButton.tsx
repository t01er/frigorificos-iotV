import { Download, DownloadMinimalistic, DownloadSquare } from "@solar-icons/react";
import { Button, CircularProgress, Tooltip } from "@heroui/react";
import { useDownload } from "../../hooks/useDownload";

interface DownloadButtonProps {
    url: string;
    label: string;
    tooltip?: string;
    color?: "primary" | "secondary" | "success" | "error" | "warning" | "info";
    variant?: "text" | "outlined" | "contained";
    size?: "small" | "medium" | "large";
    icon?: React.ReactNode;
    fileName?: string;
    method?: "GET" | "POST";
    body?: any;
    rolesPermitidos?: string[];
    showIcon?: boolean;
    className?: string;
    onDownloadStart?: () => void;
    onDownloadComplete?: () => void;
    onError?: (error: string) => void;
    showConfirmDialog?: boolean;
    confirmMessage?: string;
}

const DownloadButton = ({
    url,
    label,
    tooltip = label,
    icon,
    fileName,
    method = "GET",
    body,
    rolesPermitidos = [],
    showIcon = true,
    className = "",
    onDownloadStart,
    onDownloadComplete,
    onError,
    showConfirmDialog = false,
    confirmMessage = "¿Está seguro de descargar este archivo?",
}: DownloadButtonProps) => {

    if (rolesPermitidos.length > 0) {
        const userDataString = localStorage.getItem("user") ?? "{}";
        const userData = JSON.parse(userDataString);
        const roles = userData?.roles || [];
        const tienePermiso = roles.some((rol: any) => rolesPermitidos.includes(rol));

        if (!tienePermiso) {
            return null;
        }
    }

    const { download, loading } = useDownload({
        url,
        method,
        body,
        fileName,
    });

    const getIcon = () => {
        if (icon) return icon;
        if (showIcon) {
            if (url.includes(".zip") || url.includes("zip")) {
                return <Download size={18} />;
            }
            if (url.includes(".pdf")) {
                return <DownloadMinimalistic size={18} />;
            }
            return <DownloadSquare size={18} />;
        }
        return null;
    };

    const handleDownload = async () => {
        try {
            if (showConfirmDialog) {
                const confirmed = window.confirm(confirmMessage);
                if (!confirmed) return;
            }

            onDownloadStart?.();
            await download();
            onDownloadComplete?.();
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "Error al descargar";
            onError?.(errorMsg);

            if (err instanceof Error) {
                alert(err.message || "No se pudo descargar el archivo. Por favor, intente de nuevo.");
            }
        }
    };

    return (
        <Tooltip content={tooltip}>
            <Button
                onPress={handleDownload}
                startContent={!loading && getIcon()}
                size="sm"
                color="primary"
                disabled={loading}
                className={className}
            >
                {loading ? <CircularProgress size="sm" color="primary" /> : label}
            </Button>
        </Tooltip>
    );
};

export default DownloadButton;