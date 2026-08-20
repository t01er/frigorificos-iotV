import { API_NESTLE } from "./env";

export const DOWNLOAD_CONFIGS = {
    censo: {
        url: `${API_NESTLE}/api/Consultas/descargarCensoActualizadoExcelEntel`,
        label: "Censo",
        tooltip: "Descargar Censo Actualizado",
        color: "success" as const,
        rolesPermitidos: ["adminnestle", "usuarionestle2", "adminentel"],
    },
    cartera: {
        url: `${API_NESTLE}/api/Consultas/descargarCarteraActualizadaExcel`,
        label: "Cartera",
        tooltip: "Descargar Cartera",
        color: "primary" as const,
        rolesPermitidos: ["adminnestle", "usuarionestle2", "adminentel"],
    },
    alertasActivas: {
        url: `${API_NESTLE}/api/Consultas/listaAlertasActivasV2Excel`,
        label: "Alertas Activas",
        tooltip: "Descargar Alertas Activas",
        color: "warning" as const,
        rolesPermitidos: ["adminnestle", "usuarionestle2", "adminentel"],
    },
    alertasHistorial: {
        url: `${API_NESTLE}/api/Consultas/listaAlertasHistorialV2Excel`,
        label: "Historial Alertas",
        tooltip: "Descargar Historial de Alertas (ZIP)",
        color: "info" as const,
        rolesPermitidos: ["adminnestle", "usuarionestle2", "adminentel"],
        fileName: "HistorialAlertas.zip",
    },
};

export type DownloadKey = keyof typeof DOWNLOAD_CONFIGS;