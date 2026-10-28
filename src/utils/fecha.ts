/** Interpreta fechas "dd/mm/aaaa hh:mm:ss", "aaaa-mm-dd hh:mm:ss" o ISO */
export const parseFecha = (value?: string | null): Date | null => {
  if (!value) return null;
  const dmy = value.match(
    /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (dmy) {
    const [, d, m, y, hh = "0", mm = "0", ss = "0"] = dmy;
    return new Date(+y, +m - 1, +d, +hh, +mm, +ss);
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** { fecha: "24 oct 2026", hora: "19:01:25" } o null si no se puede interpretar */
export const formatFechaHora = (value?: string | null) => {
  const date = parseFecha(value);
  if (!date) return null;
  return {
    fecha: date
      .toLocaleDateString("es-PE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
      .replace(/\./g, ""),
    hora: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  };
};
