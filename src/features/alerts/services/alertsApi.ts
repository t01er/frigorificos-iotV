import { apiSlice } from "../../../app/apiSlice";
import { API_NESTLE } from "../../../config/env";
import type { PaginacionResponse } from "../../../config/types";

export interface AlertsItem {
    alert_dis_cod_nevera: string;
    alert_dis_imei: string;
    alert_loc_nom: string;
    alert_dis_distribuidor: string;
    alert_dis_lat: string;
    alert_dis_lon: string;
    alert_evento: string;
    alert_dis_fechahora: string;
    alert_dis_bateria: string;
    alert_dis_energia: string;
    alert_dis_signal: string;
    alert_dis_satelite: string;
    alert_dis_cliente: string;
}

export interface EventoForzadoItem {
    id(id: any): string;
    cod_nevera: string;
    evento: string;
    estado_anterior: string;
    estado_nuevo: string;
    detalle: string;
    fecha: string;
    alertasHabilitadas: number,
    origen: string,
    estadoNuevo: string,
    estadoAnterior: string,
    estadoEvento: string,
}

export interface EventosForzadosFilters {
    cod_nevera?: string;
    evento?: string;
    estado_anterior?: string;
    estado_nuevo?: string;
    detalle?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    or?: string;
    order?: string;
    page?: number;
    size?: number;
}

export interface EventosForzadosResponse {
    status: boolean;
    message?: string;
    totalRegistros?: number;
    total_records?: number;
    data: EventoForzadoItem[];
}

export interface CorreosNestleResponse {
    status: boolean;
    message?: string;
    data: CorreoNestle[];
}

export interface CorreoNestle {
    correo_id: number;
    correo_nombre: string;
    correo_email: string;
    correo_telefono: string;
    correo_status: number;
}
export interface AlertsFilters {
    _cliente?: string;
    _cod_nevera?: string;
    _distribuidor?: string;
    _evento?: string;
    _fecha_hora?: string;
    _imei?: string;
    _locacion?: string;
    _or?: string;
    _order?: string;
    _page?: number;
    _size?: number;
}

export interface AlertsHistorialFilters {
    _cliente?: string;
    _cod_nevera?: string;
    _distribuidor?: string;
    _evento?: string;
    _fecha_inicio?: string;
    _fecha_fin?: string;
    _imei?: string;
    _locacion?: string;
    _or?: string;
    _order?: string;
    _page?: number;
    _size?: number;
}

export interface AlertsResponse {
    status: boolean;
    message?: string;
    totalRegistros?: number;
    data: AlertsItem[];
}

export interface CreateCorreoRequest {
    correo_email: string;
    correo_empresa: string;
    correo_nombre: string;
    correo_telefono: string;
}

export interface CreateCorreoResponse {
    status: boolean;
    message?: string;
    data?: any;
}


export const alertsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAlertsHistorical: builder.query<AlertsResponse, AlertsFilters>({
            query: (filters) => ({
                url: `${API_NESTLE}/api/Consultas/listaAlertasActivasV2`,
                method: "POST",
                body: {
                    _cliente: filters._cliente ?? "",
                    _cod_nevera: filters._cod_nevera ?? "",
                    _distribuidor: filters._distribuidor ?? "",
                    _evento: filters._evento ?? "",
                    _fecha_hora: filters._fecha_hora ?? "",
                    _imei: filters._imei ?? "",
                    _locacion: filters._locacion ?? "",
                    _or: filters._or ?? "desc",
                    _order: filters._order ?? "dis_ult_conex",
                    _page: filters._page ?? 1,
                    _size: filters._size ?? 15,
                },
            }),
        }),
        getAlertsHistoricalCount: builder.query<PaginacionResponse, AlertsFilters>({
            query: (filters) => ({
                url: `${API_NESTLE}/api/Consultas/contadorRegistrosPaginasAlertasActivasV2`,
                method: "POST",
                body: {
                    _cliente: filters._cliente ?? "",
                    _cod_nevera: filters._cod_nevera ?? "",
                    _distribuidor: filters._distribuidor ?? "",
                    _evento: filters._evento ?? "",
                    _fecha_hora: filters._fecha_hora ?? "",
                    _imei: filters._imei ?? "",
                    _locacion: filters._locacion ?? "",
                },
            }),
        }),
        getAlertsHistoricalV2: builder.query<AlertsResponse, AlertsHistorialFilters>({
            query: (filters) => ({
                url: `${API_NESTLE}/api/Consultas/listaAlertasHistorialV2`,
                method: "POST",
                body: {
                    _cliente: filters._cliente ?? "",
                    _cod_nevera: filters._cod_nevera ?? "",
                    _distribuidor: filters._distribuidor ?? "",
                    _evento: filters._evento ?? "",
                    _fecha_inicio: filters._fecha_inicio ?? "",
                    _fecha_fin: filters._fecha_fin ?? "",
                    _imei: filters._imei ?? "",
                    _locacion: filters._locacion ?? "",
                    _or: filters._or ?? "desc",
                    _order: filters._order ?? "dis_ult_conex",
                    _page: filters._page ?? 1,
                    _size: filters._size ?? 15,
                },
            }),
        }),
        getAlertsHistoricalCountV2: builder.query<PaginacionResponse, AlertsHistorialFilters>({
            query: (filters) => ({
                url: `${API_NESTLE}/api/Consultas/contadorRegistrosPaginasAlertasHistorialV2`,
                method: "POST",
                body: {
                    _cliente: filters._cliente ?? "",
                    _cod_nevera: filters._cod_nevera ?? "",
                    _distribuidor: filters._distribuidor ?? "",
                    _evento: filters._evento ?? "",
                    _fecha_inicio: filters._fecha_inicio ?? "",
                    _fecha_fin: filters._fecha_fin ?? "",
                    _imei: filters._imei ?? "",
                    _locacion: filters._locacion ?? "",
                },
            }),
        }),
        getCorreosNestle: builder.query<CorreosNestleResponse, void>({
            query: () => ({
                url: `${API_NESTLE}/api/Consultas/listaCorreosNestle?empresa=9`,
                method: "GET",
            }),
        }),
        createCorreoNestle: builder.mutation<CreateCorreoResponse, CreateCorreoRequest>({
            query: (data) => ({
                url: `${API_NESTLE}/api/Consultas/registrarCorreosNestle`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ['CorreosNestle'],
        }),
        getEventosForzados: builder.query<
            EventosForzadosResponse,
            EventosForzadosFilters
        >({
            query: (filters) => ({
                url: `${API_NESTLE}/api/Consultas/listaEventosForzados`,
                method: "POST",
                body: {
                    cod_nevera: filters.cod_nevera ?? "",
                    evento: filters.evento ?? "",
                    estado_anterior: filters.estado_anterior ?? "",
                    estado_nuevo: filters.estado_nuevo ?? "",
                    detalle: filters.detalle ?? "",
                    fecha_inicio: filters.fecha_inicio ?? "",
                    fecha_fin: filters.fecha_fin ?? "",
                    or: filters.or ?? "desc",
                    order: filters.order ?? "",
                    page: filters.page ?? 1,
                    size: filters.size ?? 10,
                },
            }),
        }),

    }),
    overrideExisting: false,
});

export const {
    useGetAlertsHistoricalQuery,
    useGetAlertsHistoricalCountQuery,
    useGetAlertsHistoricalV2Query,
    useGetAlertsHistoricalCountV2Query,
    useGetCorreosNestleQuery,
    useCreateCorreoNestleMutation,
    useGetEventosForzadosQuery,
} = alertsApi;


