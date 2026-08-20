import { apiSlice } from "../../../app/apiSlice";
import { API_NESTLE } from "../../../config/env";
import type { PaginacionResponse } from "../../../config/types";

export interface DeviceItem {
    dis_id: number;
    dis_cod_nevera: string;
    dis_imei: string;
    dis_iccid: string;
    dis_version: string;
    dis_distribuidor: string;
    dis_cliente: string;
    dis_loc_nom: string;
    dis_latitud: string;
    dis_longitud: string;
    dis_geozona: string;
    dis_movimiento: string;
    dis_energia: string;
    dis_bateria: string;
    dis_estado: string;
    dis_ubigeo: string;
    dis_imei_chip?: string; // Agregar este campo
    dis_radio?: string; // Agregar este campo
}

export interface NeveraFilters {
    _cod_nevera?: string;
    _page?: number;
    _size?: number;
}

export interface NeveraResponse {
    status: boolean;
    message?: string;
    totalRegistros?: number;
    data: DeviceItem[];
}

export interface PaginacionFilters {
  _cod_nevera?: string;
  _page?: number;
  _size?: number;
}

export interface Cliente {
    cliente: string;
}

export interface Distribuidor {
    nombre: string;
}

export interface Locacion {
    id: number;
    nombre?: string;
}

export interface NuevoDispositivoRequest {
    _empresa: string;
    _locacion: string;
    _imei: string;
    _latitud: string;
    _longitud: string;
    _estado: number;
    _cod_nevera: string;
    _imei_chip: string;
    _distribuidor: string;
    _cliente: string;
    _radio: number;
}

// Nueva interfaz para actualizar dispositivo
export interface ActualizarDispositivoRequest {
    _id: number;
    _cliente: string;
    _cod_nevera: string;
    _distribuidor: string;
    _estado: number;
    _imei: string;
    _imei_chip: string;
    _latitud: string;
    _locacion: string;
    _longitud: string;
    _radio: number;
}

export interface NuevoDispositivoResponse {
    status: boolean;
    message?: string;
    data?: any;
}

export interface ClientesResponse {
    status: boolean;
    data: Cliente[];
}

export interface DistribuidoresResponse {
    status: boolean;
    data: Distribuidor[];
}

export interface LocacionesResponse {
    status: boolean;
    data: Locacion[];
}

export const deviceApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        
        getDevice: builder.query<NeveraResponse, NeveraFilters>({
            query: (filters) => ({
                url: `${API_NESTLE}/api/Consultas/listaDispositivosNeverasV2`,
                method: "POST",
                body: {
                    _cod_nevera: filters._cod_nevera,
                    _page: filters._page,
                    _size: filters._size,
                },
            }),
        }),
        
        getContadorRegistrosPaginas: builder.query<PaginacionResponse, NeveraFilters>({
            query: (filters) => ({
                url: `${API_NESTLE}/api/Consultas/contadorRegistrosPaginasDispositivosNeverasV2`,
                method: "POST",
                body: {
                    _cod_nevera: filters._cod_nevera,
                    _page: filters._page,
                    _size: filters._size,
                },
            }),
        }),

        getLocaciones: builder.query<Locacion[], string>({
            query: (empresa) => ({
                url: `${API_NESTLE}/api/Consultas/listaLocacionesPorEmpresa`,
                method: "GET",
                params: { empresa },
            }),
            transformResponse: (response: LocacionesResponse) => {
                return response.data || [];
            },
        }),
        

        getClientes: builder.query<Cliente[], string>({
            query: (termino) => ({
                url: `${API_NESTLE}/api/Consultas/listaClientesBasicos`,
                method: "GET",
                params: { _cliente: termino },
            }),
            transformResponse: (response: ClientesResponse) => {
                return response.data || [];
            },
        }),

        getTodosClientes: builder.query<Cliente[], void>({
            query: () => ({
                url: `${API_NESTLE}/api/Consultas/listaClientesNestle`,
                method: "GET",
            }),
            transformResponse: (response: ClientesResponse) => {
                return response.data || [];
            },
        }),

        registrarDispositivo: builder.mutation<NuevoDispositivoResponse, NuevoDispositivoRequest>({
            query: (data) => ({
                url: `${API_NESTLE}/api/Consultas/registrarDispositivoNeveraMQTT`,
                method: "POST",
                body: data,
            }),
        }),

        actualizarDispositivo: builder.mutation<NuevoDispositivoResponse, ActualizarDispositivoRequest>({
            query: (data) => ({
                url: `${API_NESTLE}/api/Consultas/actualizarDispositivoNeveraMQTT`,
                method: "POST", 
                body: data,
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetDeviceQuery,
    useGetContadorRegistrosPaginasQuery,
    useGetLocacionesQuery,
    useGetClientesQuery,
    useGetTodosClientesQuery,
    useRegistrarDispositivoMutation,
    useActualizarDispositivoMutation, 
} = deviceApi;