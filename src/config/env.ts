// Valores fijos para la demo en Vercel (sin variables de entorno). Si existe la variable VITE_*, tiene prioridad.
// TODO: volver a usar solo variables de entorno después de la presentación.
export const API_ENTEL_CORE = import.meta.env.VITE_API_ENTEL_CORE || "https://entel-iot.pe/API_ENTEL";
export const API_NESTLE = import.meta.env.VITE_API_NESTLE || "https://phuyu-iot.com/NESTLE-API";
export const API_MEGALAB = import.meta.env.VITE_API_MEGALAB || "https://entel-iot.pe/API_ENTEL_MEGALAB";
export const API_ALMACENES = import.meta.env.VITE_API_ALMACENES || "https://phuyu-iot.com/almacenes-back";
export const API_CONDOMINIOS = import.meta.env.VITE_API_CONDOMINIOS || "https://phuyu-iot.com/entel-rest/condominios";
export const RECAPTCHA_TOKEN = import.meta.env.VITE_RECAPTCHA_TOKEN || "6Ldj5nEqAAAAAJt1d0_NhhSayi1hBgC4dHS-PAMv";
export const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_TOKEN; // configurar en Vercel: GitHub bloquea el token en el repo
export const POWERBI_URL = import.meta.env.VITE_POWERBI_URL || "https://app.powerbi.com/view?r=eyJrIjoiNmFjYjFhZjAtYjc3ZC00OWQ0LWEzZTktYzgyZTgxMzg0YWRiIiwidCI6ImM3ZDI3ZjQwLTk4ODAtNGRmMS1hMDliLTQwYzY0NDM3NTljYSIsImMiOjR9";
