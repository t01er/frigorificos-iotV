import { useEffect, useRef, useState, type ReactNode } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { MAPBOX_API_KEY } from "../../../config/env";

interface BaseMapProps {
  center?: [number, number];
  zoom?: number;
  mapStyle: string;
  className?: string;
  /** Controles nativos de Mapbox (zoom, pantalla completa, geolocalización) */
  controls?: boolean;
  children?: (map: mapboxgl.Map) => ReactNode;
}

export default function BigMap({
  center = [-75, -8],
  zoom = 5,
  mapStyle,
  className = "w-full h-full",
  controls = true,
  children,
}: BaseMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const isFirstStyleEffect = useRef(true);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      accessToken: MAPBOX_API_KEY,
      container: mapContainerRef.current,
      style: mapStyle,
      center,
      zoom,
      dragPan: true,
      scrollZoom: true,
      boxZoom: true,
      doubleClickZoom: true,
      touchZoomRotate: true,
      keyboard: true,
    });

    mapRef.current = map;
    if (controls) {
      const navigationControl = new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      });
  
      map.addControl(navigationControl, "bottom-right");
  
  
      const fullscreenControl = new mapboxgl.FullscreenControl();
  
      map.addControl(fullscreenControl, "bottom-right");
  
      const geolocateControl = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
          timeout: 6000,
          maximumAge: 0,
        },
        trackUserLocation: true,
        showUserHeading: true,
        showAccuracyCircle: true,
        showUserLocation: true,
        fitBoundsOptions: {
          maxZoom: 15,
          padding: { top: 50, bottom: 50, left: 50, right: 50 }
        }
      });
  
      map.addControl(geolocateControl, "bottom-right");
    }

    map.on("load", () => {
      setReady(true);
    });

    return () => {
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);


  useEffect(() => {
    if (!mapRef.current) return;

    if (isFirstStyleEffect.current) {
      isFirstStyleEffect.current = false;
      return;
    }

    setReady(false);

    const map = mapRef.current;

    map.setStyle(mapStyle);

    map.once("style.load", () => {
      setReady(true);
    });
  }, [mapStyle]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mapContainerRef}
        className="w-full h-full"
      />

      {ready && mapRef.current && children && children(mapRef.current)}
    </div>
  );
}