
const MAP_STYLES = [
  {
    label: "Streets",
    value: "mapbox://styles/mapbox/streets-v12",
  },
  {
    label: "Outdoors",
    value: "mapbox://styles/mapbox/outdoors-v12",
  },
  {
    label: "Light",
    value: "mapbox://styles/mapbox/light-v11",
  },
  {
    label: "Dark",
    value: "mapbox://styles/mapbox/dark-v11",
  },
  {
    label: "Satellite",
    value: "mapbox://styles/mapbox/satellite-v9",
  },
  {
    label: "Satellite Streets",
    value: "mapbox://styles/mapbox/satellite-streets-v12",
  },
  {
    label: "Navigation Day",
    value: "mapbox://styles/mapbox/navigation-day-v1",
  },
  {
    label: "Navigation Night",
    value: "mapbox://styles/mapbox/navigation-night-v1",
  },
];
export default MAP_STYLES;
/** Mapas base del selector "Cartografía" del dashboard */
export const MAP_BASEMAPS = [
  { key: "claro", label: "Claro", value: "mapbox://styles/mapbox/light-v11" },
  { key: "calles", label: "Calles", value: "mapbox://styles/mapbox/streets-v12" },
  {
    key: "satelite",
    label: "Satélite",
    value: "mapbox://styles/mapbox/satellite-streets-v12",
  },
  { key: "oscuro", label: "Oscuro", value: "mapbox://styles/mapbox/dark-v11" },
] as const;
