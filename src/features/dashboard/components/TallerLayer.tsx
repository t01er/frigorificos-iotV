import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Taller {
    codigo: number;
    nombre: string;
    direccion: string;
    latitud: string;
    longitud: string;
    supervisor: string;
    coordinador: string;
    tipo: number;
    razon_social: string;
}

interface Props {
    map: mapboxgl.Map;
    talleres: Taller[];
}


export default function TallerLayer({
    map,
    talleres,
}: Props) {
    const beforeLayer = map.getLayer("clusters") ? "clusters" : undefined;
    useEffect(() => {

        if (!map || !talleres.length) return;

        const geojson = {
            type: "FeatureCollection",
            features: talleres
                .map(t => ({
                    type: "Feature",
                    properties: {
                        ...t,
                        icon:
                            t.tipo === 1
                                ? "icon-distribuidor"
                                : "icon-taller",
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [
                            Number(t.longitud),
                            Number(t.latitud),
                        ],
                    },
                }))
                .filter(
                    f =>
                        !isNaN(f.geometry.coordinates[0]) &&
                        !isNaN(f.geometry.coordinates[1])
                ),
        };

        if (map.getSource("talleres")) {
            (map.getSource("talleres") as mapboxgl.GeoJSONSource)
                .setData(geojson as any);
            return;
        }

        map.addSource("talleres", {
            type: "geojson",
            data: geojson as any,
        });

        map.addLayer(
            {
                id: "talleres-layer",
                type: "symbol",
                source: "talleres",
                layout: {
                    "icon-image": ["get", "icon"],
                    "icon-size": 0.06,
                    "icon-allow-overlap": true,
                },
            },
            beforeLayer
        );
        map.on("click", "talleres-layer", (e) => {
            if (!e.features?.length) return;

            const feature = e.features[0];
            const props = feature.properties!;

            new mapboxgl.Popup()
                .setLngLat((feature.geometry as GeoJSON.Point).coordinates as [number, number])
                .setHTML(`
                <div>
                    <p>
                        <strong>${props.tipo === 1 ? "Distribuidor" : "Taller"}:</strong> ${props.nombre}
                    </p>
                    <p style="width: 200px;"><strong>Dirección:</strong> ${props.direccion}</p>
                    <p><strong>Supervisor:</strong> ${props.supervisor}</p>
                    <p><strong>Coordinador:</strong> ${props.coordinador}</p>
                    <p><strong>Razón Social:</strong> ${props.razon_social}</p>
                </div>
    `)
                .addTo(map);
        });


        map.loadImage("/taller.png", (err, image) => {

            if (err || !image) return;

            if (!map.hasImage("icon-taller")) {
                map.addImage("icon-taller", image);
            }

        });
        map.loadImage("/distribuidor.png", (err, image) => {

            if (err || !image) return;

            if (!map.hasImage("icon-distribuidor")) {
                map.addImage("icon-distribuidor", image);
            }

        });

    }, [map, talleres]);

    return null;
}