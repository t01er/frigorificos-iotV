// Valores fijos para la demo en Vercel (sin variables de entorno). Si existe la variable VITE_*, tiene prioridad.
// TODO: volver a usar solo variables de entorno después de la presentación.

// En Vercel las APIs pasan por el proxy de vercel.json porque los backends no permiten CORS desde *.vercel.app.
const EN_VERCEL = typeof window !== "undefined" && window.location.hostname.endsWith(".vercel.app");
const viaProxy = (url: string) =>
  EN_VERCEL
    ? url.replace("https://phuyu-iot.com", "/proxy/phuyu").replace("https://entel-iot.pe", "/proxy/entel")
    : url;

export const API_ENTEL_CORE = viaProxy(import.meta.env.VITE_API_ENTEL_CORE || "https://entel-iot.pe/API_ENTEL");
export const API_NESTLE = viaProxy(import.meta.env.VITE_API_NESTLE || "https://phuyu-iot.com/NESTLE-API");
export const API_MEGALAB = viaProxy(import.meta.env.VITE_API_MEGALAB || "https://entel-iot.pe/API_ENTEL_MEGALAB");
export const API_ALMACENES = viaProxy(import.meta.env.VITE_API_ALMACENES || "https://phuyu-iot.com/almacenes-back");
export const API_CONDOMINIOS = viaProxy(import.meta.env.VITE_API_CONDOMINIOS || "https://phuyu-iot.com/entel-rest/condominios");
export const RECAPTCHA_TOKEN = import.meta.env.VITE_RECAPTCHA_TOKEN || "6Ldj5nEqAAAAAJt1d0_NhhSayi1hBgC4dHS-PAMv";
export const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_TOKEN; // configurar en Vercel: GitHub bloquea el token en el repo
export const POWERBI_URL = import.meta.env.VITE_POWERBI_URL || "https://app.powerbi.com/view?r=eyJrIjoiNmFjYjFhZjAtYjc3ZC00OWQ0LWEzZTktYzgyZTgxMzg0YWRiIiwidCI6ImM3ZDI3ZjQwLTk4ODAtNGRmMS1hMDliLTQwYzY0NDM3NTljYSIsImMiOjR9";
