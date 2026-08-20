import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AltArrowDown } from "@solar-icons/react";

import { getSidebarOptions } from "../ux/sidebar-options";
import { useSelector } from "react-redux";

export default function Sidebar() {
  const user = useSelector((state: any) => state.auth.user);

  const [openMenus, setOpenMenus] = useState<Record<number, boolean>>({});

  const hiddenByUser: Record<string, number[]> = {
    Nestle_Admin: [3],
  };

  const hidden = hiddenByUser[user?.username] ?? [];

const menu = getSidebarOptions(user?.opciones ?? [])
  .filter((item) => !hidden.includes(item.codigo))
  .filter((item) => item.name !== "GestionNestle" && item.name !== "Gestión Nestle");

  const location = useLocation();

  const [isExpanded, setIsExpanded] = useState(() => {
    const saved = localStorage.getItem("sidebar-expanded");
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", JSON.stringify(isExpanded));
  }, [isExpanded]);




  return (
    <motion.aside
      initial={{ width: isExpanded ? 288 : 70 }}
      animate={{ width: isExpanded ? 288 : 70 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative h-screen bg-[#1e187b] flex flex-col text-white shadow-2xl overflow-hidden"
    >
      <div
        className={`pt-5 cursor-pointer flex ${isExpanded ? "pl-6 justify-start" : "justify-center"
          }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-1 mb-5 -mt-2">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.img
                key="expanded"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                src="/logoentel.png"
                alt="Logo"
                className="h-13"
              />
            ) : (
              <motion.img
                key="collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                src="/logosimple.png"
                alt="Logo"
                className="h-13"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <nav className="flex-1 flex flex-col overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const hasChildren = !!item.children?.length;

          const isActive = (() => {
            const currentPath = location.pathname;

            if (item.path === "/dashboard") {
              return (
                currentPath === "/dashboard" ||
                currentPath.startsWith("/dashboard/location")
              );
            }

            if (hasChildren) {
              return currentPath.startsWith(item.path);
            }

            const cleanPath = item.path.replace("/", "");
            const singularKeyword = cleanPath.endsWith("s")
              ? cleanPath.slice(0, -1)
              : cleanPath;

            return currentPath.includes(singularKeyword);
          })();

          return (
            <div key={item.codigo} className="flex flex-col">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!isExpanded) {
                      setIsExpanded(true);

                      setTimeout(() => {
                        setOpenMenus((prev) => ({
                          ...prev,
                          [item.codigo]: true,
                        }));
                      }, 250);
                      return;
                    }

                    setOpenMenus((prev) => ({
                      ...prev,
                      [item.codigo]: !prev[item.codigo],
                    }));
                  }}
                  className={`relative flex items-center h-14 transition-colors duration-300 ${isExpanded
                      ? "ml-4 rounded-l-[3rem]"
                      : "mx-auto w-14 justify-center rounded-xl"
                    } ${isActive
                      ? "text-[#1e187b]"
                      : "text-[#ffffff80] hover:bg-white/5"
                    }`}
                >
                  <Icon
                    weight="Bold"
                    size={23}
                    className={isExpanded ? "ml-7 z-10" : "z-10"}
                  />

                  {isExpanded && (
                    <>
                      <span className="ml-4 flex-1 text-left text-lg font-medium z-10">
                        {item.name}
                      </span>

                      <motion.div
                        animate={{
                          rotate: openMenus[item.codigo] ? 180 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className="mr-5 z-10"
                      >
                        <AltArrowDown size={18} />
                      </motion.div>
                    </>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      transition={{ duration: 0.2 }}
                      className={`absolute inset-0 bg-white z-0 ${isExpanded ? "rounded-l-[3rem]" : "rounded-xl"
                        }`}
                    />
                  )}
                </button>
              ) : (
                <NavLink
                  to={item.path}
                  className={`relative flex items-center h-14 transition-colors duration-300 ${isExpanded
                      ? "ml-4 rounded-l-[3rem]"
                      : "mx-auto w-14 justify-center rounded-xl"
                    } ${isActive
                      ? "text-[#1e187b]"
                      : "text-[#ffffff80] hover:bg-white/5"
                    }`}
                >
                  <Icon
                    weight="Bold"
                    size={23}
                    className={isExpanded ? "ml-7 z-10" : "z-10"}
                  />

                  {isExpanded && (
                    <span className="ml-4 text-lg font-medium z-10">
                      {item.name}
                    </span>
                  )}

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      transition={{ duration: 0.2 }}
                      className={`absolute inset-0 bg-white z-0 ${isExpanded ? "rounded-l-[3rem]" : "rounded-xl"
                        }`}
                    />
                  )}
                </NavLink>
              )}

              <AnimatePresence>
                {hasChildren && isExpanded && openMenus[item.codigo] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    {item.children!.map((child) => {
                      const ChildIcon = child.icon;

                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            `ml-14 mr-3 h-10 flex items-center gap-3 rounded-lg px-3 text-sm transition-colors ${isActive
                              ? "bg-white/20 text-white"
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                            }`
                          }
                        >
                          <ChildIcon size={18} />
                          <span>{child.name}</span>
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </motion.aside>
  );
}