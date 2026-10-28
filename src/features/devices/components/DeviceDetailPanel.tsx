import type { ReactNode } from "react";
import { Button } from "@heroui/react";
import { Bolt, Cpu, MapPoint, Restart, Tuning2 } from "@solar-icons/react";

import BigMap from "../../dashboard/components/BigMap";
import DeviceMapLayer from "./DeviceMapLayer";
import type { DeviceItem } from "../services/deviceApi";
import { EstadoBadge, parseBateria } from "./DeviceCells";

interface DeviceDetailPanelProps {
    device: DeviceItem;
    onConfigure: () => void;
    onRefresh: () => void;
    isRefreshing?: boolean;
}

const maskIccid = (iccid?: string) =>
    iccid && iccid.length > 9
        ? `${iccid.slice(0, 5)}${"•".repeat(iccid.length - 9)}${iccid.slice(-4)}`
        : (iccid ?? "—");

function BatteryRing({ pct }: { pct: number | null }) {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const value = pct ?? 0;
    const color =
        value < 20 ? "stroke-nx-err" : value < 50 ? "stroke-nx-warn" : "stroke-nx-ok";

    return (
        <svg viewBox="0 0 56 56" className="size-14 -rotate-90 shrink-0">
            <circle
                cx="28"
                cy="28"
                r={radius}
                fill="none"
                strokeWidth="6"
                className="stroke-nx-line"
            />
            <circle
                cx="28"
                cy="28"
                r={radius}
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                className={color}
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - value / 100)}
            />
        </svg>
    );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex items-center justify-between gap-4 py-2.5 border-b border-nx-line last:border-b-0 text-sm">
            <span className="text-nx-text-3">{label}</span>
            <span className="font-medium text-nx-text text-right truncate">
                {children || "—"}
            </span>
        </div>
    );
}

export default function DeviceDetailPanel({
    device,
    onConfigure,
    onRefresh,
    isRefreshing,
}: DeviceDetailPanelProps) {
    const lat = parseFloat(device.dis_latitud);
    const lng = parseFloat(device.dis_longitud);
    const hasCoords = !isNaN(lat) && !isNaN(lng);
    const radius = parseFloat(String(device.dis_geozona ?? "").replace(/[^d.]/g, "")) || 0;

    const pct = parseBateria(device.dis_bateria);
    const energiaOn = device.dis_energia === "Conectado";

    return (
        <aside className="rounded-[1.75rem] bg-nx-surface p-5 flex flex-col gap-4 lg:sticky lg:top-0 self-start">
            <header className="flex items-center gap-3">
                <span className="size-11 shrink-0 rounded-2xl bg-nx-gradient text-white flex items-center justify-center">
                    <Cpu size={22} />
                </span>
                <div className="flex-1 min-w-0 flex flex-col leading-tight">
                    <h3 className="text-base font-bold text-nx-text truncate">
                        {device.dis_cod_nevera}
                    </h3>
                    <span className="text-xs text-nx-text-3 truncate">
                        {[device.dis_distribuidor, device.dis_loc_nom]
                            .filter(Boolean)
                            .join(" · ")}
                    </span>
                </div>
                <EstadoBadge estado={device.dis_estado} />
            </header>

            <div className="relative h-44 rounded-2xl overflow-hidden bg-nx-surface-2">
                {hasCoords ? (
                    <BigMap
                        mapStyle="mapbox://styles/mapbox/light-v11"
                        center={[lng, lat]}
                        zoom={12}
                        controls={false}
                    >
                        {(map) => (
                            <DeviceMapLayer
                                map={map}
                                lat={lat}
                                lng={lng}
                                radius={radius}
                            />
                        )}
                    </BigMap>
                ) : (
                    <div className="size-full flex items-center justify-center text-xs text-nx-text-3">
                        Sin coordenadas
                    </div>
                )}
                {device.dis_geozona && (
                    <span className="absolute z-10 top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-nx-ink text-nx-surface text-[11px] font-medium">
                        Geozona {device.dis_geozona}
                    </span>
                )}
                {hasCoords && (
                    <span className="absolute z-10 bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-nx-surface text-[11px] font-mono text-nx-text-2">
                        <MapPoint size={13} className="text-nx-purple" />
                        {device.dis_latitud}, {device.dis_longitud}
                    </span>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-nx-surface-2 p-3 flex items-center gap-3">
                    <BatteryRing pct={pct} />
                    <div className="flex flex-col leading-tight">
                        <span className="text-[11px] text-nx-text-3">Batería</span>
                        <span className="text-xl font-bold text-nx-text tabular-nums">
                            {pct !== null ? `${Math.round(pct)}%` : "—"}
                        </span>
                    </div>
                </div>
                <div className="rounded-2xl bg-nx-surface-2 p-3 flex items-center gap-3">
                    <span
                        className={`size-14 shrink-0 rounded-full flex items-center justify-center ${
                            energiaOn
                                ? "bg-nx-warn-soft text-nx-warn-ink"
                                : "bg-nx-surface text-nx-text-3"
                        }`}
                    >
                        <Bolt size={22} />
                    </span>
                    <div className="flex flex-col leading-tight">
                        <span className="text-[11px] text-nx-text-3">Energía</span>
                        <span className="text-xl font-bold text-nx-text">
                            {energiaOn ? "ON" : "OFF"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col">
                <Row label="IMEI">{device.dis_imei}</Row>
                <Row label="ICCID">{maskIccid(device.dis_iccid)}</Row>
                <Row label="Versión">{device.dis_version}</Row>
                <Row label="Cliente">{device.dis_cliente}</Row>
                <Row label="Movimiento">{device.dis_movimiento}</Row>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    radius="full"
                    className="flex-1 bg-nx-gradient text-white font-semibold h-11"
                    startContent={<Tuning2 size={18} />}
                    onPress={onConfigure}
                >
                    Configurar
                </Button>
                <Button
                    isIconOnly
                    radius="full"
                    aria-label="Actualizar"
                    isLoading={isRefreshing}
                    className="bg-nx-surface-2 text-nx-text-2 size-11 min-w-11"
                    onPress={onRefresh}
                >
                    <Restart size={18} />
                </Button>
            </div>
        </aside>
    );
}
