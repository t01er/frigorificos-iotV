import { useMemo } from "react";
import { UsersGroupRounded } from "@solar-icons/react";

import type { UserItem } from "../services/userApi";
import { UserAvatar, organizacionDe } from "./UserCells";

const ORG_COLORS = ["#7b2ff2", "#2f6bff", "#22c7ee", "#a35cff", "#5f5d7a"];
const OTROS_COLOR = "#c6c4d8";
const MAX_ORGS = 5;
const MAX_AVATARS = 5;

const fmt = (n: number) =>
    n.toLocaleString("es-ES", { useGrouping: "always" });

export default function UsersSidePanel({ users }: { users: UserItem[] }) {
    const { activos, organizaciones, perfiles } = useMemo(() => {
        const activos = users.filter(
            (u) => u.usu_estado?.toLowerCase() === "activo",
        );

        const porOrg = new Map<string, number>();
        users.forEach((u) => {
            const org = organizacionDe(u.usu_correo);
            porOrg.set(org, (porOrg.get(org) ?? 0) + 1);
        });
        const ordenadas = [...porOrg.entries()]
            .filter(([nombre]) => nombre !== "Otros")
            .sort((a, b) => b[1] - a[1]);
        const top = ordenadas.slice(0, MAX_ORGS);
        const resto =
            ordenadas.slice(MAX_ORGS).reduce((acc, [, n]) => acc + n, 0) +
            (porOrg.get("Otros") ?? 0);
        const organizaciones = [
            ...top.map(([nombre, total], i) => ({
                nombre,
                total,
                color: ORG_COLORS[i % ORG_COLORS.length],
            })),
            ...(resto > 0
                ? [{ nombre: "Otros", total: resto, color: OTROS_COLOR }]
                : []),
        ];

        const porPerfil = new Map<string, number>();
        users.forEach((u) => {
            const tipo = u.usu_tipo || "—";
            porPerfil.set(tipo, (porPerfil.get(tipo) ?? 0) + 1);
        });
        const perfiles = [...porPerfil.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2);

        return { activos, organizaciones, perfiles };
    }, [users]);

    const totalOrg = organizaciones.reduce((acc, o) => acc + o.total, 0);
    const muestra = activos.slice(0, MAX_AVATARS);
    const restantes = activos.length - muestra.length;

    return (
        <aside className="flex flex-col gap-4 lg:sticky lg:top-0 self-start">
            <div className="rounded-[1.75rem] bg-nx-gradient text-white p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-white/85">Usuarios activos</span>
                    <span className="size-9 rounded-full bg-white/20 flex items-center justify-center">
                        <UsersGroupRounded size={18} />
                    </span>
                </div>
                <span className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tracking-tight tabular-nums">
                        {fmt(activos.length)}
                    </span>
                    <span className="text-sm text-white/75">/ {fmt(users.length)}</span>
                </span>
                {muestra.length > 0 && (
                    <div className="flex items-center -space-x-2">
                        {muestra.map((u) => (
                            <span
                                key={u.usu_id}
                                className="rounded-full ring-2 ring-nx-purple"
                            >
                                <UserAvatar name={u.usu_nombre} size="size-8" />
                            </span>
                        ))}
                        {restantes > 0 && (
                            <span className="size-8 rounded-full bg-white/25 ring-2 ring-nx-purple text-[11px] font-semibold flex items-center justify-center px-1">
                                +{fmt(restantes)}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="rounded-[1.75rem] bg-nx-surface p-5 flex flex-col gap-4">
                <h3 className="text-base font-bold text-nx-text">Por organización</h3>

                <div className="flex gap-[3px] h-2.5">
                    {organizaciones.map((o) => (
                        <span
                            key={o.nombre}
                            className="h-full rounded-full min-w-[4px]"
                            style={{
                                backgroundColor: o.color,
                                flexGrow: o.total,
                                flexBasis: 0,
                            }}
                        />
                    ))}
                </div>

                <ul className="flex flex-col gap-2">
                    {organizaciones.map((o) => (
                        <li key={o.nombre} className="flex items-center gap-2.5 text-sm">
                            <span
                                className="size-2.5 rounded-sm shrink-0"
                                style={{ backgroundColor: o.color }}
                            />
                            <span className="flex-1 truncate text-nx-text-2">
                                {o.nombre}
                            </span>
                            <span className="font-semibold text-nx-text tabular-nums">
                                {fmt(o.total)}
                            </span>
                        </li>
                    ))}
                    {totalOrg === 0 && (
                        <li className="text-sm text-nx-text-3">Sin datos</li>
                    )}
                </ul>

                {perfiles.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                        {perfiles.map(([tipo, total]) => (
                            <div
                                key={tipo}
                                className="rounded-2xl bg-nx-surface-2 p-3 flex flex-col leading-tight min-w-0"
                            >
                                <span className="text-[11px] text-nx-text-3 truncate">
                                    {tipo}
                                </span>
                                <span className="text-2xl font-bold text-nx-text tabular-nums">
                                    {fmt(total)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
