import { useEffect } from "react";
import type { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";

interface DeviceMapLayerProps {
    map: MapboxMap;
    lat: number;
    lng: number;
    /** Radio de la geozona en metros */
    radius: number;
}

const SOURCE_POINT = "device-point";
const SOURCE_ZONE = "device-zone";

const circlePolygon = (
    lng: number,
    lat: number,
    radiusMeters: number,
    steps = 64,
): GeoJSON.Feature<GeoJSON.Polygon> => {
    const coords: [number, number][] = [];
    const dLat = radiusMeters / 111320;
    const dLng = radiusMeters / (111320 * Math.cos((lat * Math.PI) / 180));
    for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * 2 * Math.PI;
        coords.push([lng + dLng * Math.cos(angle), lat + dLat * Math.sin(angle)]);
    }
    return {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [coords] },
    };
};

export default function DeviceMapLayer({
    map,
    lat,
    lng,
    radius,
}: DeviceMapLayerProps) {
    useEffect(() => {
        const point: GeoJSON.Feature<GeoJSON.Point> = {
            type: "Feature",
            properties: {},
            geometry: { type: "Point", coordinates: [lng, lat] },
        };
        const zone = circlePolygon(lng, lat, radius > 0 ? radius : 1);

        const pointSource = map.getSource(SOURCE_POINT) as GeoJSONSource | undefined;
        const zoneSource = map.getSource(SOURCE_ZONE) as GeoJSONSource | undefined;

        if (pointSource && zoneSource) {
            pointSource.setData(point);
            zoneSource.setData(zone);
        } else {
            map.addSource(SOURCE_ZONE, { type: "geojson", data: zone });
            map.addSource(SOURCE_POINT, { type: "geojson", data: point });

            map.addLayer({
                id: "device-zone-fill",
                type: "fill",
                source: SOURCE_ZONE,
                paint: { "fill-color": "#7b2ff2", "fill-opacity": 0.12 },
            });
            map.addLayer({
                id: "device-zone-line",
                type: "line",
                source: SOURCE_ZONE,
                paint: {
                    "line-color": "#7b2ff2",
                    "line-width": 1.5,
                    "line-dasharray": [2, 2],
                },
            });
            map.addLayer({
                id: "device-halo",
                type: "circle",
                source: SOURCE_POINT,
                paint: { "circle-color": "#7b2ff2", "circle-opacity": 0.2, "circle-radius": 16 },
            });
            map.addLayer({
                id: "device-dot",
                type: "circle",
                source: SOURCE_POINT,
                paint: {
                    "circle-color": "#7b2ff2",
                    "circle-radius": 7,
                    "circle-stroke-width": 3,
                    "circle-stroke-color": "#ffffff",
                },
            });
        }

        map.flyTo({ center: [lng, lat], zoom: radius > 0 && radius < 1000 ? 15 : 12, duration: 800 });
    }, [map, lat, lng, radius]);

    return null;
}
