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

export type Metrica = "temperatura" | "puerta" | "energia" | "desconexion";

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
    // Temperatura del motor (compresor)
    motor: {
      actual: 46,
      promedio: 47,
      maxima: 58,
      horaMaxima: "11:15",
      limite: 65,
    },
  },
  puerta: {
    estado: "Cerrada",
    aperturas: 18,
    ultima: "14:22",
    tiempoAbierta: "6 min",
    promedioDiario: 21,
    serie: [1, 0, 1, 1, 0, 2, 1, 3, 2, 4, 3, 5, 4, 3, 5, 4, 2, 3, 1, 0],
  },
  energia: {
    consumoHoy: 6.8,
    consumoMes: 214,
    variacionMes: -4,
    voltaje: 221,
    amperaje: 1.38,
    potencia: 0.3,
    eventosTension30d: 2,
  },
  desconexion: {
    hace: "Hace 3 días",
    duracion: "12 min",
    eventos30d: 2,
    disponibilidad: 99.9,
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

const ETIQUETAS: Record<RangoTemperatura, string[]> = {
  "24h": TEMPERATURA_MOCK["24h"].etiquetas,
  "7d": TEMPERATURA_MOCK["7d"].etiquetas,
  "30d": TEMPERATURA_MOCK["30d"].etiquetas,
};

const serie = (rango: RangoTemperatura, valores: number[]): SerieTemperatura => ({
  valores,
  etiquetas: ETIQUETAS[rango],
});

// Historial de las demás métricas, con los mismos tramos que la temperatura.
type SerieHistorica = "motor" | "puerta" | "energia" | "voltaje" | "desconexion";

export const HISTORICO_MOCK: Record<SerieHistorica, Record<RangoTemperatura, SerieTemperatura>> = {
  // Temperatura del motor (°C) por tramo
  motor: {
    "24h": serie("24h", [44, 43, 42, 42, 41, 41, 43, 44, 45, 46, 48, 47, 50, 49, 48, 47, 51, 53, 58, 52, 48, 46]),
    "7d": serie("7d", [45, 47, 44, 46, 49, 52, 45, 44, 46, 48, 53, 46, 45, 46, 47, 55, 48, 46, 45, 49, 47, 46]),
    "30d": serie("30d", [46, 45, 48, 46, 45, 47, 54, 46, 45, 46, 49, 47, 46, 45, 47, 46, 56, 48, 47, 46, 47, 46]),
  },
  // Aperturas de puerta por tramo
  puerta: {
    "24h": serie("24h", [0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 2, 1, 3, 2, 1, 0, 2, 3, 1, 0, 1, 0]),
    "7d": serie("7d", [4, 9, 2, 6, 11, 3, 5, 10, 2, 7, 12, 4, 6, 9, 3, 5, 11, 2, 6, 10, 4, 7]),
    "30d": serie("30d", [19, 22, 17, 24, 21, 18, 26, 20, 23, 15, 22, 25, 19, 21, 24, 18, 27, 20, 22, 19, 23, 18]),
  },
  // Consumo de energía (kWh) por tramo
  energia: {
    "24h": serie("24h", [0.24, 0.22, 0.21, 0.21, 0.2, 0.19, 0.23, 0.25, 0.27, 0.3, 0.34, 0.33, 0.38, 0.36, 0.35, 0.31, 0.37, 0.41, 0.45, 0.39, 0.36, 0.33]),
    "7d": serie("7d", [2.1, 2.6, 1.9, 2.3, 2.8, 2.0, 2.2, 2.7, 1.9, 2.4, 2.9, 2.1, 2.3, 2.6, 1.8, 2.2, 2.8, 2.0, 2.3, 2.7, 2.1, 2.4]),
    "30d": serie("30d", [9.1, 9.6, 8.8, 9.9, 9.4, 8.9, 10.3, 9.2, 9.7, 8.6, 9.5, 10.1, 9.0, 9.4, 9.8, 9.1, 10.6, 9.3, 9.6, 9.0, 9.8, 9.3]),
  },
  // Voltaje promedio (V) por tramo
  voltaje: {
    "24h": serie("24h", [221, 222, 222, 223, 223, 208, 219, 221, 220, 221, 220, 219, 220, 221, 222, 221, 220, 221, 222, 221, 221, 221]),
    "7d": serie("7d", [221, 220, 222, 221, 219, 221, 222, 220, 221, 222, 221, 220, 221, 222, 220, 221, 219, 221, 222, 221, 220, 221]),
    "30d": serie("30d", [221, 222, 220, 221, 236, 221, 220, 222, 221, 220, 221, 222, 221, 220, 221, 222, 221, 220, 221, 222, 220, 221]),
  },
  // Minutos desconectado por tramo
  desconexion: {
    "24h": serie("24h", Array(22).fill(0)),
    "7d": serie("7d", [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    "30d": serie("30d", [0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0]),
  },
};

export const PRODUCTOS_MOCK: ProductoPlanograma[] = [
  { nombre: "Coca-Cola 500 ml", sku: "77501001", estante: 1, cantidad: 8, planograma: 8, color: "var(--color-nx-purple)" },
  { nombre: "Inca Kola 500 ml", sku: "77501002", estante: 1, cantidad: 6, planograma: 8, color: "var(--color-nx-blue)" },
  { nombre: "Sprite 500 ml", sku: "77501014", estante: 2, cantidad: 2, planograma: 8, color: "var(--color-nx-violet)" },
  { nombre: "San Luis Agua 625 ml", sku: "77502210", estante: 3, cantidad: 7, planograma: 6, color: "var(--color-nx-cyan)" },
  { nombre: "Frugos Durazno 300 ml", sku: "77503051", estante: 3, cantidad: 0, planograma: 6, color: "var(--color-nx-text-2)" },
  { nombre: "Powerade Mora 473 ml", sku: "77504120", estante: 4, cantidad: 5, planograma: 6, color: "var(--color-nx-purple)" },
  { nombre: "Fanta Naranja 500 ml", sku: "77501020", estante: 2, cantidad: 8, planograma: 8, color: "var(--color-nx-blue)" },
  { nombre: "Red Bull 250 ml", sku: "77505001", estante: 4, cantidad: 3, planograma: 6, color: "var(--color-nx-violet)" },
  { nombre: "Monster Energy 473 ml", sku: "77505010", estante: 4, cantidad: 6, planograma: 6, color: "var(--color-nx-cyan)" },
  { nombre: "Cielo Agua 625 ml", sku: "77502230", estante: 3, cantidad: 6, planograma: 6, color: "var(--color-nx-text-2)" },
  { nombre: "Pepsi 1 L", sku: "77506001", estante: 2, cantidad: 1, planograma: 4, color: "var(--color-nx-purple)" },
  { nombre: "Gatorade Tropical 500 ml", sku: "77504210", estante: 4, cantidad: 4, planograma: 6, color: "var(--color-nx-blue)" },
  { nombre: "Coca-Cola Zero 500 ml", sku: "77501005", estante: 1, cantidad: 5, planograma: 4, color: "var(--color-nx-violet)" },
  { nombre: "Guaraná 500 ml", sku: "77501030", estante: 2, cantidad: 4, planograma: 4, color: "var(--color-nx-cyan)" },
  { nombre: "Pulp Durazno 315 ml", sku: "77503060", estante: 3, cantidad: 0, planograma: 4, color: "var(--color-nx-text-2)" },
  { nombre: "Free Tea 500 ml", sku: "77507001", estante: 3, cantidad: 4, planograma: 4, color: "var(--color-nx-purple)" },
  { nombre: "Volt 300 ml", sku: "77505030", estante: 4, cantidad: 2, planograma: 4, color: "var(--color-nx-blue)" },
  { nombre: "Cifrut 500 ml", sku: "77503080", estante: 2, cantidad: 4, planograma: 4, color: "var(--color-nx-violet)" },
];

export const NO_DESEADOS_MOCK: ProductoNoDeseado[] = [
  { nombre: "Pepsi 500 ml", motivo: "Competencia", estante: 2, hora: "14:36", color: "var(--color-nx-cyan)" },
  { nombre: "Bolsa de hielo 3 kg", motivo: "No autorizado", estante: 4, hora: "14:36", color: "var(--color-nx-text-2)" },
];

export const estadoProducto = (p: ProductoPlanograma): EstadoProducto => {
  if (p.cantidad === 0) return "agotado";
  if (p.cantidad > p.planograma) return "exceso";
  if (p.cantidad === p.planograma) return "completo";
  return p.cantidad / p.planograma >= 0.5 ? "reponer" : "bajo";
};
