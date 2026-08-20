import { apiSlice } from "../../../app/apiSlice";
import { API_NESTLE } from "../../../config/env";
import type { PaginacionResponse, PaginationParams } from "../../../config/types";

export interface ApiResponse<T> {
  status: boolean;
  message?: string;
  totalRegistros?: number;
  data: T;
}

export interface PaginacionFilters {
  cod_nevera?: string;
  distribuidor?: string;
  estado?: string;
  imei?: string;
  locacion?: string;
  movimiento?: string;
  or?: "asc" | "desc";
  order?: string;
  page?: number;
  size?: number;
}

export interface DashboardContadoresFilters {
  distribuidor?: string;
  estado?: number;
}


export interface NeveraFilters {
  empresa?: string;
  tipo?: string;
  cod_nevera?: string;
  estado?: number;
  distribuidor?: string[];
  departamento?: string;
}

export interface TallerFilters {
  departamento?: string;
}

export interface NeveraDashboardFilters {
  cod_nevera?: string;
  distribuidor?: string;
  estado?: string;
  imei?: string;
  locacion?: string;
  movimiento?: string;
  or?: "asc" | "desc";
  order?: string;
  page?: number;
  size?: number;
}

export interface NeveraDashboardItem {
  dis_cod_nevera: string;
  dis_imei: string;
  loc_nombre: string;
  dis_distribuidor: string;
  dis_sincronizado: string;
  dis_ult_conex: string;
  dis_latitud_actual: string;
  dis_longitud_actual: string;
  dis_estado: string;
  dis_movimiento: string;
  dis_bateria: string;
  dis_energia: string;
  dis_desconexiones: string;
  dis_senial_celular: string;
  dis_senial_gps: string;
  dis_fecha_instalacion: string;
  dis_latitud_inst: string;
  dis_longitud_inst: string;
  dis_distancia_km_instalacion: string;
  dis_cliente_codigo: string;
  dis_cliente_nombre: string;
  dis_fecha_cartera: string;
  dis_latitud_cartera: string;
  dis_longitud_cartera: string;
  dis_distancia_km_cartera: string;
  dis_fecha_censo: string;
  dis_latitud_censo: string;
  dis_longitud_censo: string;
  dis_distancia_km_censo: string;
  distancia_fuera_de_zona: string;
  dis_iccid: string;
}

export interface JasperReportItem {
  smsId: string;
  status: string;
  messageText: string;
  senderLogin: string;
  iccid: string;
  codigoNevera: string;
  sentTo: string;
  sentFrom: string;
  msgType: string;
  dateSent: string;
  dateReceived: string;
  dateModified: string;
  dateDispositivo: string;
}

export interface EventoDistribuidor {
  operativo_cartera: number;
  operativo_censo: number;
  operativo_instalacion: number;
  taller: number;
  estado_distribuidor: number;
  fuera_de_zona: number;
  desconexion_de_energia: number;
  fuera_de_linea: number;
  movimiento_fuera_de_zona: number;
  detenido_fuera_de_zona: number;
  traslado: number;
  nestle: number;
  mtto: number;
}

export interface RegionDistribuidores {
  [distribuidor: string]: EventoDistribuidor;
}

export interface RegionesData {
  regiones: {
    [region: string]: RegionDistribuidores;
  };
}

export interface EventosDashboardResponse {
  status: boolean;
  message: string;
  data: RegionesData[];
}

export interface DashboardContadores {
  traslado: number;
  desconexion_DE_ENERGIA: number;
  fuera_DE_LINEA: number;
  movimiento_FUERA_DE_ZONA: number;
  operativo_CENSO: number;
  registro_CORTE: string;
  mtto: number;
  operativo_CARTERA: number;
  operativo_INSTALACION: number;
  taller: number;
  distribuidor: number;
  fuera_DE_ZONA: number;
  detenido_FUERA_DE_ZONA: number;
  nestle: number;
}

export interface Distribuidor {
  nombre: string;
}

export interface Departamento {
  departamento: string;
  latitud: string;
  longitud: string;
  conteo: number;
}

export interface CoordenadaMovimiento {
  lat: string;
  lng: string;
  fechaRegistro: string;
  fechaRegistroDis: string;
  movCodNevera: string;
  movDistribuidor: string;
  movBateria: string;
  movSignal: string;
}

export interface MovimientoData {
  imei: string;
  locacion: string;
  coordenadas: CoordenadaMovimiento[];
}

export interface PuntoControl {
  punto_control: string;
  codigo: string;
  latitud: string;
  longitud: string;
  radio: number;
  fecha_ultima_actualizacion: string;
}

export interface MovimientosDispositivoResponse {
  status: boolean;
  message: string;
  totalRegistros: number;
  data: MovimientoData;
  control: PuntoControl[];
}

export type NeveraResponse = ApiResponse<any[]>;
export type TallerResponse = ApiResponse<any[]>;
export type NeveraDetalleResponse = ApiResponse<any | null>;
export type DistribuidoresResponse = ApiResponse<Distribuidor[]>;
export type DashboardContadoresResponse = ApiResponse<DashboardContadores>;
export type DepartamentosResponse = ApiResponse<Departamento[]>;
export type NeveraDashboardResponse = ApiResponse<NeveraDashboardItem[]>;
export type AlertasFallitasJasperReportResponse = ApiResponse<JasperReportItem[]>;
export type BitacoraJasperReportResponse = ApiResponse<JasperReportItem[]>;

export const mapApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNeverasMapa: builder.query<NeveraResponse, NeveraFilters>({
      query: (filters) => ({
        url: `${API_NESTLE}/api/Consultas/listaNeverasMapa1`,
        method: "POST",
        body: {
          empresa: filters.empresa ?? "9",
          tipo: filters.tipo ?? "congeladora",
          cod_nevera: filters.cod_nevera ?? "",
          estado: filters.estado ?? 0,
          distribuidor: filters.distribuidor ?? [],
          departamento: filters.departamento ?? "",
        },
      }),
    }),
    getTalleresNestle: builder.query<TallerResponse, TallerFilters>({
      query: (filters) => ({
        url: `${API_NESTLE}/api/Consultas/listaTalleresNestle`,
        params: {
          departamento: filters.departamento ?? "Lima",
        },
      }),
    }),
    getNeveraDetalle: builder.query<NeveraDetalleResponse, string>({
      query: (codigo) => ({
        url: `${API_NESTLE}/api/Consultas/listaNeverasMapa2`,
        params: {
          _cod_nevera: codigo,
        },
      }),
    }),
    getDistribuidores: builder.query<DistribuidoresResponse, void>({
      query: () => ({
        url: `${API_NESTLE}/api/Consultas/listaDistribuidoresBasicos`,
      }),
    }),
    getDashboardContadores: builder.query<DashboardContadoresResponse, DashboardContadoresFilters>({
      query: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.distribuidor) {
          params.append('distribuidor', filters.distribuidor);
        }
        return {
          url: `${API_NESTLE}/api/Consultas/nestleContadoresDashboardv2`,
          params: params.toString() ? params : undefined,
        };
      },
    }),
    getDepartamentos: builder.query<DepartamentosResponse, void>({
      query: () => ({
        url: `${API_NESTLE}/api/Consultas/contarNeverasDepartamento`,
        params: {
          _departamento: "",
          _distribuidor: "",
        },
      }),
    }),
    getNeverasDashboard: builder.query<NeveraDashboardResponse, NeveraDashboardFilters>({
      query: (filters) => ({
        url: `${API_NESTLE}/api/Consultas/listaGeneralNeverasDashboardV2`,
        method: "POST",
        body: {
          _cod_nevera: filters.cod_nevera ?? "",
          _distribuidor: filters.distribuidor ?? "",
          _estado: filters.estado ?? "",
          _imei: filters.imei ?? "",
          _locacion: filters.locacion ?? "",
          _movimiento: filters.movimiento ?? "",
          _or: filters.or ?? "desc",
          _order: filters.order ?? "dis_ult_conex",
          _page: filters.page ?? 1,
          _size: filters.size ?? 15,
        },
      }),
    }),
    getContadorRegistrosPaginas: builder.query<PaginacionResponse, PaginacionFilters>({
      query: (filters) => ({
        url: `${API_NESTLE}/api/Consultas/contadorRegistrosPaginaslistaGeneralNeverasDashboardV2`,
        method: "POST",
        body: {
          _cod_nevera: filters.cod_nevera ?? "",
          _distribuidor: filters.distribuidor ?? "",
          _estado: filters.estado ?? "",
          _imei: filters.imei ?? "",
          _locacion: filters.locacion ?? "",
          _movimiento: filters.movimiento ?? "",
        },
      }),
    }),
    getAlertasFallitasJasperReport: builder.query<
      AlertasFallitasJasperReportResponse,
      { cod_nevera?: string } & PaginationParams
    >({
      query: ({ cod_nevera = "", page = 1, size = 9999 }) => ({
        url: `${API_NESTLE}/api/Consultas/spListaAlertasYFallidosJasperREport`,
        params: {
          _cod_nevera: cod_nevera,
          _page: page,
          _size: size,
        },
      }),
    }),
    getBitacoraJasperReport: builder.query<
      BitacoraJasperReportResponse,
      { cod_nevera?: string } & PaginationParams
    >({
      query: ({ cod_nevera = "", page = 1, size = 9999 }) => ({
        url: `${API_NESTLE}/api/Consultas/spListaBitacoraJasperREport`,
        params: {
          _cod_nevera: cod_nevera,
          _page: page,
          _size: size,
        },
      }),
    }),
    getEventosDashboardPorDistribuidor: builder.query<EventosDashboardResponse, void>({
      query: () => ({
        url: `${API_NESTLE}/api/Consultas/eventosDashboardPorDistribuidor`,
      }),
    }),
    getMovimientosDispositivo: builder.query<MovimientosDispositivoResponse, string>({
      query: (imei) => ({
        url: `${API_NESTLE}/api/Consultas/movimientosDispositivo`,
        params: { imei },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetNeverasMapaQuery,
  useGetNeveraDetalleQuery,
  useGetTalleresNestleQuery,
  useGetDistribuidoresQuery,
  useGetDashboardContadoresQuery,
  useGetDepartamentosQuery,
  useGetNeverasDashboardQuery,
  useGetAlertasFallitasJasperReportQuery,
  useGetBitacoraJasperReportQuery,
  useGetEventosDashboardPorDistribuidorQuery,
  useGetContadorRegistrosPaginasQuery,
  useGetMovimientosDispositivoQuery,
} = mapApi;



