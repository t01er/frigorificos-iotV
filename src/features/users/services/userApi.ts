import { apiSlice } from "../../../app/apiSlice";
import { API_NESTLE, API_ENTEL_CORE } from "../../../config/env";
import type { PaginacionResponse } from "../../../config/types";

export interface UserItem {
    usu_id: number;
    usu_nombre: string;
    usu_correo: string;
    usu_telefono: string;
    usu_cargo: string;
    usu_usuario: string;
    usu_contrasena: string;
    usu_tipo: string;
    usu_estado: string;
    usu_lista_distribuidores: number[];
    usu_empresa?: number;
}

export interface UserResponse {
    status: boolean;
    message?: string;
    totalRegistros?: number;
    data: UserItem[];
}

export interface UserFilters {
    _page?: number;
    _size?: number;
    _search?: string;
    _estado?: string;
    _tipo?: string;
}

// ============ REQUEST INTERFACES ============

// Para REGISTRAR (POST)
export interface RegistrarUsuarioRequest {
    usu_empresa: number;
    usu_nombre: string;
    usu_correo: string;
    usu_telefono: string;
    usu_cargo: string;
    usu_usuario: string;
    usu_contrasena: string;
    usu_tipo: string;
    usu_estado: string;
    usu_lista_distribuidores?: number[];
}

// Para ACTUALIZAR (POST)
export interface ActualizarUsuarioRequest {
    usu_id: number;
    usu_empresa: number;
    usu_nombre: string;
    usu_correo: string;
    usu_telefono: string;
    usu_cargo: string;
    usu_usuario: string;
    usu_contrasena?: string; // Opcional en edición
    usu_tipo: string;
    usu_estado: string;
    usu_lista_distribuidores?: number[];
}

export interface RegistrarUsuarioResponse {
    status: boolean;
    message?: string;
    data?: any;
}

export interface Perfil {
    id: string;
    nombre: string;
    tipo: string;
}

export interface PerfilesResponse {
    status: boolean;
    data: Perfil[];
}

export interface Distribuidor {
    id: number;
    nombre: string;
    cod_distribuidor?: number;
    name_distribuidor?: string;
}

export interface DistribuidoresResponse {
    status: boolean;
    data: Distribuidor[];
}

export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        getUsers: builder.query<UserResponse, UserFilters | void>({
            query: (filters) => {
                const params = new URLSearchParams();
                if (filters) {
                    if (filters._page) params.append('_page', filters._page.toString());
                    if (filters._size) params.append('_size', filters._size.toString());
                    if (filters._search) params.append('_search', filters._search);
                    if (filters._estado) params.append('_estado', filters._estado);
                    if (filters._tipo) params.append('_tipo', filters._tipo);
                }
                const queryString = params.toString();
                return {
                    url: `${API_NESTLE}/api/Consultas/listaUsuariosNestle?empresa=9${queryString ? `&${queryString}` : ''}`,
                    method: "GET",
                };
            },
            providesTags: ['Users'],
        }),

        getUserById: builder.query<UserItem, number>({
            query: (id) => ({
                url: `${API_NESTLE}/api/Consultas/obtenerUsuarioNestle/${id}`,
                method: "GET",
            }),
            transformResponse: (response: { status: boolean; data: UserItem }) => {
                return response.data;
            },
        }),

        registrarUsuarioNestle: builder.mutation<RegistrarUsuarioResponse, RegistrarUsuarioRequest>({
            query: (data) => ({
                url: `${API_NESTLE}/api/Consultas/registrarUsuariosNestle`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ['Users'],
        }),

        registrarUsuarioEntel: builder.mutation<RegistrarUsuarioResponse, RegistrarUsuarioRequest>({
            query: (data) => ({
                url: `${API_ENTEL_CORE}/api/Consultas/registrarUsuariosNestle`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ['Users'],
        }),

        actualizarUsuarioNestle: builder.mutation<RegistrarUsuarioResponse, ActualizarUsuarioRequest>({
            query: (data) => ({
                url: `${API_NESTLE}/api/Consultas/actualizarUsuariosNestle`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ['Users'],
        }),

        actualizarUsuarioEntel: builder.mutation<RegistrarUsuarioResponse, ActualizarUsuarioRequest>({
            query: (data) => ({
                url: `${API_ENTEL_CORE}/api/Consultas/actualizarUsuariosNestle`,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ['Users'],
        }),

        eliminarUsuario: builder.mutation<RegistrarUsuarioResponse, number>({
            query: (id) => ({
                url: `${API_NESTLE}/api/Consultas/eliminarUsuarioNestle/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['Users'],
        }),

        cambiarEstadoUsuario: builder.mutation<RegistrarUsuarioResponse, { id: number; estado: string }>({
            query: ({ id, estado }) => ({
                url: `${API_NESTLE}/api/Consultas/cambiarEstadoUsuarioNestle`,
                method: "POST",
                body: { usu_id: id, usu_estado: estado },
            }),
            invalidatesTags: ['Users'],
        }),

        getPerfiles: builder.query<Perfil[], string>({
            query: (role) => ({
                url: `${API_NESTLE}/api/Consultas/listarPerfilesNestle?_role=${role}`,
                method: "GET",
            }),
            transformResponse: (response: PerfilesResponse) => {
                return response.data || [];
            },
        }),

        getDistribuidoresMovil: builder.query<Distribuidor[], void>({
            query: () => ({
                url: `${API_NESTLE}/api/Consultas/obtenerDistribuidoresMovil`,
                method: "GET",
            }),
            transformResponse: (response: DistribuidoresResponse) => {
                return response.data || [];
            },
        }),

        getContadorUsuarios: builder.query<PaginacionResponse, UserFilters | void>({
            query: (filters) => {
                const params = new URLSearchParams();
                if (filters) {
                    if (filters._search) params.append('_search', filters._search);
                    if (filters._estado) params.append('_estado', filters._estado);
                    if (filters._tipo) params.append('_tipo', filters._tipo);
                }
                const queryString = params.toString();
                return {
                    url: `${API_NESTLE}/api/Consultas/contadorUsuariosNestle?empresa=9${queryString ? `&${queryString}` : ''}`,
                    method: "GET",
                };
            },
        }),
    }),
    overrideExisting: false,
});

// ============ EXPORTS ============
export const {
    useGetUsersQuery,
    useGetUserByIdQuery,
    useGetPerfilesQuery,
    useGetDistribuidoresMovilQuery,
    useGetContadorUsuariosQuery,
    useRegistrarUsuarioNestleMutation,
    useRegistrarUsuarioEntelMutation,
    useActualizarUsuarioNestleMutation,
    useActualizarUsuarioEntelMutation,
    useEliminarUsuarioMutation,
    useCambiarEstadoUsuarioMutation,
} = userApi;