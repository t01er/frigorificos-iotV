import { useMemo, type ReactNode } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Drawer,
  DrawerBody,
  DrawerContent,
  Tooltip,
} from "@heroui/react";
import {
  ChatRoundCall,
  Logout3,
  Moon,
  SidebarMinimalistic,
  Sun,
} from "@solar-icons/react";

import { getSidebarOptions } from "../ux/sidebar-options";
import { logout } from "../../features/auth/authSlice";
import { useTheme } from "../../hooks/useTheme";
import { useAlertCounter } from "../../hooks/useAlertCounter";

type SidebarOption = ReturnType<typeof getSidebarOptions>[number];

const ALERTS_CODE = 7;

const hiddenByUser: Record<string, number[]> = {
  Nestle_Admin: [3],
};

function isOptionActive(item: SidebarOption, currentPath: string) {
  if (item.path === "/dashboard") {
    return (
      currentPath === "/dashboard" ||
      currentPath.startsWith("/dashboard/location")
    );
  }

  if (item.children?.length) return currentPath.startsWith(item.path);

  const cleanPath = item.path.replace("/", "");
  const singularKeyword = cleanPath.endsWith("s")
    ? cleanPath.slice(0, -1)
    : cleanPath;

  return currentPath.includes(singularKeyword);
}

const card =
  "rounded-[1.75rem] bg-nx-surface";

/** Envuelve en Tooltip solo cuando el sidebar está contraído */
function CollapsedTip({
  label,
  expanded,
  children,
}: {
  label: string;
  expanded: boolean;
  children: ReactNode;
}) {
  if (expanded) return <>{children}</>;
  return (
    <Tooltip
      content={label}
      placement="right"
      offset={14}
      delay={200}
      closeDelay={0}
      size="sm"
    >
      <span className="inline-flex">{children}</span>
    </Tooltip>
  );
}

interface NavItemProps {
  item: SidebarOption;
  expanded: boolean;
  active: boolean;
  badge?: number;
  onNavigate?: () => void;
}

function NavItem({ item, expanded, active, badge, onNavigate }: NavItemProps) {
  const navigate = useNavigate();
  const Icon = item.icon;

  const className = `relative flex items-center h-11 rounded-full transition-colors ${
    expanded ? "w-full px-3.5 gap-3" : "size-11 justify-center"
  } ${
    active
      ? "text-white"
      : "text-nx-text-2 hover:text-nx-text hover:bg-nx-surface-2"
  }`;

  const content = (
    <>
      {active && (
        <motion.span
          layoutId={expanded ? "nav-active-expanded" : "nav-active-collapsed"}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          className="absolute inset-0 rounded-full bg-nx-gradient"
        />
      )}
      <Icon
        weight={active ? "Bold" : "Linear"}
        size={20}
        className="relative z-10 shrink-0"
      />
      {expanded && (
        <>
          <span className="relative z-10 flex-1 text-left text-sm font-medium truncate">
            {item.name}
          </span>
          {!!badge && (
            <span
              className={`relative z-10 text-[11px] font-semibold rounded-full px-2 py-0.5 ${
                active
                  ? "bg-white/25 text-white"
                  : "bg-nx-err-soft text-nx-err"
              }`}
            >
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </>
      )}
    </>
  );

  if (item.children?.length) {
    return (
      <Dropdown placement="right-start" offset={14}>
        <DropdownTrigger>
          <button type="button" aria-label={item.name} className={className}>
            {content}
          </button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label={item.name}
          onAction={(key) => {
            navigate(String(key));
            onNavigate?.();
          }}
        >
          {item.children.map((child) => {
            const ChildIcon = child.icon;
            return (
              <DropdownItem
                key={child.path}
                startContent={<ChildIcon size={18} />}
              >
                {child.name}
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </Dropdown>
    );
  }

  return (
    <CollapsedTip label={item.name} expanded={expanded}>
      <NavLink
        to={item.path}
        aria-label={item.name}
        onClick={onNavigate}
        className={className}
      >
        {content}
      </NavLink>
    </CollapsedTip>
  );
}

function ThemeSwitch({ expanded }: { expanded: boolean }) {
  const { theme, setTheme } = useTheme();

  if (!expanded) {
    const next = theme === "light" ? "dark" : "light";
    return (
      <div className={`${card} flex flex-col items-center gap-1 p-1.5`}>
        {(["light", "dark"] as const).map((mode) => {
          const Icon = mode === "light" ? Sun : Moon;
          return (
            <button
              key={mode}
              type="button"
              aria-label={mode === "light" ? "Tema claro" : "Tema oscuro"}
              aria-pressed={theme === mode}
              onClick={() => theme !== mode && setTheme(next)}
              className={`size-11 rounded-full flex items-center justify-center transition-colors ${
                theme === mode
                  ? "bg-nx-surface-2 text-nx-text"
                  : "text-nx-text-3 hover:text-nx-text"
              }`}
            >
              <Icon size={19} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`${card} flex p-1 gap-1`}>
      {(["light", "dark"] as const).map((mode) => {
        const Icon = mode === "light" ? Sun : Moon;
        return (
          <button
            key={mode}
            type="button"
            aria-pressed={theme === mode}
            onClick={() => setTheme(mode)}
            className={`flex-1 h-9 rounded-full flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${
              theme === mode
                ? "bg-nx-surface-2 text-nx-text"
                : "text-nx-text-3 hover:text-nx-text"
            }`}
          >
            <Icon size={16} />
            {mode === "light" ? "Claro" : "Oscuro"}
          </button>
        );
      })}
    </div>
  );
}

function FooterActions({ expanded }: { expanded: boolean }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const base = `flex items-center h-11 rounded-full transition-colors ${
    expanded ? "w-full px-3.5 gap-3" : "size-11 justify-center"
  }`;

  return (
    <div className={`${card} flex flex-col gap-0.5 ${expanded ? "p-2" : "p-1.5 items-center"}`}>
      <CollapsedTip label="Ayuda y soporte" expanded={expanded}>
        <button
          type="button"
          aria-label="Ayuda y soporte"
          className={`${base} text-nx-text-2 hover:text-nx-text hover:bg-nx-surface-2`}
        >
          <ChatRoundCall size={20} className="shrink-0" />
          {expanded && (
            <span className="text-sm font-medium">Ayuda y soporte</span>
          )}
        </button>
      </CollapsedTip>
      <CollapsedTip label="Cerrar sesión" expanded={expanded}>
        <button
          type="button"
          aria-label="Cerrar sesión"
          onClick={() => {
            dispatch(logout());
            navigate("/login");
          }}
          className={`${base} text-nx-err hover:bg-nx-err-soft`}
        >
          <Logout3 size={20} className="shrink-0" />
          {expanded && (
            <span className="text-sm font-medium">Cerrar sesión</span>
          )}
        </button>
      </CollapsedTip>
    </div>
  );
}

interface SidebarProps {
  isExpanded: boolean;
  onToggleExpanded: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({
  isExpanded,
  onToggleExpanded,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const user = useSelector((state: any) => state.auth.user);
  const location = useLocation();
  const { unreadCount } = useAlertCounter();

  const menu = useMemo(() => {
    const hidden = hiddenByUser[user?.username] ?? [];

    return getSidebarOptions(user?.opciones ?? [])
      .filter((item) => !hidden.includes(item.codigo))
      .filter(
        (item) =>
          item.name !== "GestionNestle" && item.name !== "Gestión Nestle",
      );
  }, [user]);

  const renderNav = (expanded: boolean, onNavigate?: () => void) => (
    <nav
      className={`${card} flex flex-col gap-1 ${
        expanded ? "p-2 pt-3" : "p-1.5 items-center"
      }`}
    >
      {expanded && (
        <span className="px-3.5 pb-1 text-xs font-semibold text-nx-text-3">
          Menú principal
        </span>
      )}
      {menu.map((item) => (
        <NavItem
          key={item.codigo}
          item={item}
          expanded={expanded}
          active={isOptionActive(item, location.pathname)}
          badge={item.codigo === ALERTS_CODE ? unreadCount : undefined}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isExpanded ? 232 : 58 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        className="hidden md:flex shrink-0 flex-col gap-3 overflow-y-auto overflow-x-hidden scrollbar-hide"
      >
        <ThemeSwitch expanded={isExpanded} />

        <button
          type="button"
          aria-label={isExpanded ? "Contraer menú" : "Expandir menú"}
          onClick={onToggleExpanded}
          className={`${card} h-11 w-full flex items-center justify-center gap-2 text-nx-text-2 hover:text-nx-text transition-colors`}
        >
          <SidebarMinimalistic size={18} />
          {isExpanded && <span className="text-sm font-medium">Contraer menú</span>}
        </button>

        {renderNav(isExpanded)}

        <div className="flex-1" />

        <FooterActions expanded={isExpanded} />

      </motion.aside>

      <Drawer
        isOpen={mobileOpen}
        onOpenChange={(open) => !open && onMobileClose()}
        placement="left"
        size="xs"
        hideCloseButton
        classNames={{
          base: "max-w-[260px] m-3 rounded-[2rem] bg-nx-shell",
        }}
      >
        <DrawerContent>
          <DrawerBody className="py-3 px-3 gap-3">
            <ThemeSwitch expanded />
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {renderNav(true, onMobileClose)}
            </div>
            <FooterActions expanded />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
