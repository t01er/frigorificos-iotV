// Datos de ejemplo para el detalle de nevera. Reemplazar cuando exista el servicio real.

export type EstadoProducto = "completo" | "reponer" | "bajo" | "agotado" | "exceso";

export interface ProductoPlanograma {
  nombre: string;
  sku: string;
  estante: number;
  cantidad: number;
  planograma: number;
  color: string;
}

export interface ProductoNoDeseado {
  nombre: string;
  motivo: string;
  estante: number;
  hora: string;
  color: string;
}

export type RangoTemperatura = "24h" | "7d" | "30d";

export interface SerieTemperatura {
  valores: number[];
  etiquetas: string[];
}

export const NEVERA_MOCK = {
  modelo: "Modelo VR-450 · Imbera",
  distribuidor: "CODIJISA · Cartera",
  cliente: "057001112254003",
  captura: "14:36",
  productosDetectados: 34,
  confianza: 96,
  temperatura: {
    actual: 3.8,
    rangoMin: 2,
    rangoMax: 8,
    promedio: 4.1,
    maxima: 6.9,
    horaMaxima: "11:00",
  },
  puerta: {
    estado: "Cerrada",
    aperturas: 18,
    ultima: "14:22",
    serie: [1, 0, 1, 1, 0, 2, 1, 3, 2, 4, 3, 5, 4, 3, 5, 4, 2, 3, 1, 0],
  },
  corriente: {
    voltaje: 221,
    amperaje: 1.38,
    potencia: 0.3,
  },
  desconexion: {
    hace: "Hace 3 días",
    duracion: "12 min",
    eventos30d: 2,
    // 1 = evento de desconexión en ese día
    serie: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  },
  ubicacion: {
    lat: -5.402993,
    lng: -80.742985,
    distanciaPunto: 12,
  },
};

export const TEMPERATURA_MOCK: Record<RangoTemperatura, SerieTemperatura> = {
  "24h": {
    valores: [
      3.9, 3.8, 3.7, 3.7, 3.6, 3.6, 3.7, 3.6, 3.5, 3.6, 3.7, 3.8,
      3.9, 4.0, 4.4, 4.9, 5.1, 5.6, 6.9, 5.3, 4.4, 3.8,
    ],
    etiquetas: ["15:00", "21:00", "03:00", "09:00", "Ahora"],
  },
  "7d": {
    valores: [
      4.0, 4.2, 3.9, 4.1, 4.3, 5.2, 4.0, 3.8, 3.9, 4.4, 5.6, 4.1,
      3.9, 4.0, 4.2, 6.1, 4.3, 4.0, 3.9, 4.5, 4.2, 3.8,
    ],
    etiquetas: ["Lun", "Mar", "Jue", "Sáb", "Hoy"],
  },
  "30d": {
    valores: [
      4.2, 4.1, 4.4, 4.0, 3.9, 4.3, 5.4, 4.2, 4.0, 4.1, 4.6, 4.3,
      4.0, 3.9, 4.2, 4.1, 5.8, 4.4, 4.2, 4.0, 4.1, 3.8,
    ],
    etiquetas: ["28 sep", "05 oct", "12 oct", "19 oct", "Hoy"],
  },
};

export const PRODUCTOS_MOCK: ProductoPlanograma[] = [
  { nombre: "Coca-Cola 500 ml", sku: "77501001", estante: 1, cantidad: 8, planograma: 8, color: "#e5484d" },
  { nombre: "Inca Kola 500 ml", sku: "77501002", estante: 1, cantidad: 6, planograma: 8, color: "#f5c518" },
  { nombre: "Sprite 500 ml", sku: "77501014", estante: 2, cantidad: 2, planograma: 8, color: "#16a36a" },
  { nombre: "San Luis Agua 625 ml", sku: "77502210", estante: 3, cantidad: 7, planograma: 6, color: "#4cc3f0" },
  { nombre: "Frugos Durazno 300 ml", sku: "77503051", estante: 3, cantidad: 0, planograma: 6, color: "#f59e0b" },
  { nombre: "Powerade Mora 473 ml", sku: "77504120", estante: 4, cantidad: 5, planograma: 6, color: "#2f6bff" },
  { nombre: "Fanta Naranja 500 ml", sku: "77501020", estante: 2, cantidad: 8, planograma: 8, color: "#fb923c" },
  { nombre: "Red Bull 250 ml", sku: "77505001", estante: 4, cantidad: 3, planograma: 6, color: "#1d4ed8" },
  { nombre: "Monster Energy 473 ml", sku: "77505010", estante: 4, cantidad: 6, planograma: 6, color: "#22c55e" },
  { nombre: "Cielo Agua 625 ml", sku: "77502230", estante: 3, cantidad: 6, planograma: 6, color: "#93c5fd" },
  { nombre: "Pepsi 1 L", sku: "77506001", estante: 2, cantidad: 1, planograma: 4, color: "#1e3a8a" },
  { nombre: "Gatorade Tropical 500 ml", sku: "77504210", estante: 4, cantidad: 4, planograma: 6, color: "#f97316" },
  { nombre: "Coca-Cola Zero 500 ml", sku: "77501005", estante: 1, cantidad: 5, planograma: 4, color: "#111827" },
  { nombre: "Guaraná 500 ml", sku: "77501030", estante: 2, cantidad: 4, planograma: 4, color: "#84cc16" },
  { nombre: "Pulp Durazno 315 ml", sku: "77503060", estante: 3, cantidad: 0, planograma: 4, color: "#fbbf24" },
  { nombre: "Free Tea 500 ml", sku: "77507001", estante: 3, cantidad: 4, planograma: 4, color: "#a3e635" },
  { nombre: "Volt 300 ml", sku: "77505030", estante: 4, cantidad: 2, planograma: 4, color: "#eab308" },
  { nombre: "Cifrut 500 ml", sku: "77503080", estante: 2, cantidad: 4, planograma: 4, color: "#ef4444" },
];

export const NO_DESEADOS_MOCK: ProductoNoDeseado[] = [
  { nombre: "Pepsi 500 ml", motivo: "Competencia", estante: 2, hora: "14:36", color: "#1e3a8a" },
  { nombre: "Bolsa de hielo 3 kg", motivo: "No autorizado", estante: 4, hora: "14:36", color: "#93c5fd" },
];

export const estadoProducto = (p: ProductoPlanograma): EstadoProducto => {
  if (p.cantidad === 0) return "agotado";
  if (p.cantidad > p.planograma) return "exceso";
  if (p.cantidad === p.planograma) return "completo";
  return p.cantidad / p.planograma >= 0.5 ? "reponer" : "bajo";
};
