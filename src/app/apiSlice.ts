import { createApi, fetchBaseQuery, type BaseQueryApi, type FetchArgs } from '@reduxjs/toolkit/query/react';
import { jwtDecode } from 'jwt-decode';
import { API_ENTEL_CORE } from '../config/env';
import { logout } from '../features/auth/authSlice';

interface JWTPayload {
  exp: number;
}

const baseQuery = fetchBaseQuery({
  baseUrl: API_ENTEL_CORE,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithInterceptor = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: {}) => {
  const token = localStorage.getItem('token');

  if (token) {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        console.warn("El token ha expirado. Limpiando sesión proactivamente...");

        api.dispatch(logout());
        window.location.href = '/login';

        return { error: { status: 401, data: { message: "Sesión expirada por inactividad" } } };
      }
    } catch (e) {
      console.error("Token corrupto detectado.");
      api.dispatch(logout());
      window.location.href = '/login';
      return { error: { status: 401, data: { message: "Token inválido" } } };
    }
  }

  let result = await baseQuery(args, api, extraOptions);

  if (result.error) {
    const status = result.error.status;
    const backendError = result.error.data;

    if (status === 401) {
      console.warn("Servidor rechazó el token (401). Forzando logout...");

      api.dispatch(logout());

      window.location.href = '/login';
      return result;
    }

    if (backendError) {
      api.dispatch({
        type: 'error/setError',
        payload: backendError,
      });
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithInterceptor,
  tagTypes: [
    'User',
    'Users',
    'Product',
    'Products',
    'Device',
    'Devices',
    'CorreosNestle'
  ],
  endpoints: () => ({}),
});