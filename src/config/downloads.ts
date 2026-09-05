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
    bitacora: {
        url: `${API_NESTLE}/api/Consultas/descargarBitacoraCompletaExcelEntel`,
        label: "Bitacora",
        tooltip: "Descargar Bitacora",
        color: "success" as const,
        rolesPermitidos: ["adminnestle", "usuarionestle2", "adminentel"],
    },
    neverasDashboard: {
        url: `${API_NESTLE}/api/Consultas/listaGeneralNeverasDashboardV2Excel`,
        label: "Neveras",
        tooltip: "Descargar lista general de neveras",
        color: "primary" as const,
        rolesPermitidos: ["adminnestle", "usuarionestle2", "adminentel"],
        fileName: "NeverasDashboard.xlsx",
        method: "POST" as const,
    }
};

export type DownloadKey = keyof typeof DOWNLOAD_CONFIGS;