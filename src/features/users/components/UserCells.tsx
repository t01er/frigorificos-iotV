const AVATAR_TONES = [
    "bg-nx-purple/10 text-nx-purple",
    "bg-nx-info-soft text-nx-blue",
    "bg-nx-ok-soft text-nx-ok-ink",
    "bg-nx-warn-soft text-nx-warn-ink",
    "bg-nx-err-soft text-nx-err-ink",
    "bg-nx-surface-2 text-nx-text-2",
];

const hash = (text: string) =>
    [...text].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);

export const initialsOf = (name?: string) =>
    (name ?? "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("") || "?";

export function UserAvatar({
    name,
    size = "size-9",
    seed,
}: {
    name: string;
    size?: string;
    seed?: string;
}) {
    const tone = AVATAR_TONES[hash(seed ?? name) % AVATAR_TONES.length];
    return (
        <span
            className={`${size} shrink-0 rounded-full flex items-center justify-center text-xs font-semibold ${tone}`}
        >
            {initialsOf(name)}
        </span>
    );
}

export function PerfilTag({ tipo }: { tipo?: string }) {
    if (!tipo) return null;
    const admin = tipo.toLowerCase().startsWith("admin");
    return (
        <span
            className={`inline-flex w-fit rounded-md px-1.5 py-0.5 text-[10px] font-medium ${
                admin ? "bg-nx-ink text-nx-surface" : "bg-nx-surface-2 text-nx-text-2"
            }`}
        >
            {tipo}
        </span>
    );
}

/** Nombre de la organización según el dominio del correo */
export const organizacionDe = (correo?: string): string => {
    const domain = correo?.split("@")[1]?.toLowerCase();
    if (!domain) return "Otros";
    const label = domain
        .split(".")
        .filter((p) => !["com", "pe", "net", "org", "gob", "edu", "co"].includes(p))
        .pop();
    if (!label) return "Otros";
    return label.charAt(0).toUpperCase() + label.slice(1);
};
