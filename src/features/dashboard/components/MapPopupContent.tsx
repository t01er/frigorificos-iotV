import type { ReactNode } from "react";

export interface PopupField {
  label: string;
  value: string | number | null | undefined;
  icon?: ReactNode;
  bold?: boolean;
}

export interface MapPopupContentProps {
  title: string;
  headerIcon: ReactNode;
  fields: PopupField[];
  accentColor?: string;
  widthClassName?: string;
}

function Info({ label, value, icon, bold, accentColor }: PopupField & { accentColor: string }) {
  const displayValue =
    value === null || value === undefined || value === ""
      ? `SIN ${label.toUpperCase()}`
      : String(value);

  return (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="text-lg" style={{ color: accentColor }}>
          {icon}
        </div>
      )}
      <div className="flex flex-col leading-tight">
        <span className="text-xs text-zinc-400">{label}</span>
        <span
          className={bold ? "font-semibold" : "text-zinc-700"}
          style={bold ? { color: accentColor } : undefined}
        >
          {displayValue}
        </span>
      </div>
    </div>
  );
}
export default function MapPopupContent({
  title,
  headerIcon,
  fields,
  widthClassName = "w-56",
}: MapPopupContentProps) {
  return (
    <div className={`bg-white text-sm font-inter text-zinc-800 p-1 ${widthClassName}`}>
      <div className="flex items-center gap-3 mb-3">
        <div
          className="rounded-full p-2"
          style={{ backgroundColor: `#1E187B1A`, color: "#1E187B" }}
        >
          {headerIcon}
        </div>
        <div className="font-semibold text-base">{title}</div>
      </div>

      <div className="flex flex-col gap-2">
        {fields.map((field, i) => (
          <Info key={i} {...field} accentColor="#1E187B" />
        ))}
      </div>
    </div>
  );
}