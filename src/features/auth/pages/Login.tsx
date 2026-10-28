import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Moon, Snowflake, Streets, Sun, Thermometer } from "@solar-icons/react";
import LoginForm from "../components/LoginForm";
import { useTheme } from "../../../hooks/useTheme";

const FEATURES = [
  { icon: <Streets size={18} />, text: "Mapa nacional de neveras" },
  { icon: <Bell size={18} />, text: "Alertas de energía y zona en vivo" },
  { icon: <Thermometer size={18} />, text: "Temperatura y contenido de frigoríficos" },
];

const ROTATE_MS = 4500;

export default function Login() {
  const [active, setActive] = useState(0);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const timer = setInterval(
      () => setActive((i) => (i + 1) % FEATURES.length),
      ROTATE_MS,
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative isolate min-h-screen bg-nx-shell lg:grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-3 p-3">
      <div className="nx-glow" aria-hidden="true" />
      <section className="nx-login-hero relative z-10 hidden lg:flex flex-col justify-between overflow-hidden rounded-[1.75rem] p-8 xl:p-10 text-white">
        <div
          aria-hidden
          className="absolute left-1/2 top-[38%] size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-70"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(125,211,252,0.85) 0%, rgba(125,211,252,0) 65%)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <span className="size-9 rounded-full bg-white text-nx-purple flex items-center justify-center">
            <Snowflake size={18} />
          </span>
          <span className="text-base font-bold">Labotec</span>
        </div>

        <div className="relative flex flex-col gap-6">
          <span className="w-fit rounded-full bg-white/15 border border-white/25 px-3.5 py-1 text-xs">
            Monitoreo IoT en todo el Perú
          </span>
          <h2 className="text-5xl xl:text-6xl font-bold leading-[1.05] tracking-tight">
            Cada nevera,
            <br />
            en tiempo real
          </h2>
          <p className="max-w-md text-base text-white/80">
            Ubicación, energía, temperatura y alertas de toda tu flota en un solo
            lugar.
          </p>

          <div className="grid grid-cols-3 gap-3 pt-2 max-w-2xl">
            {FEATURES.map((f, i) => {
              const on = i === active;
              return (
                <button
                  key={f.text}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`relative text-left rounded-2xl p-3.5 h-28 flex flex-col justify-between border transition-colors duration-500 ${
                    on
                      ? "border-transparent text-nx-text"
                      : "bg-white/10 border-white/20 text-white/90 hover:bg-white/15"
                  }`}
                >
                  {on && (
                    <motion.span
                      layoutId="login-feature-active"
                      transition={{ type: "spring", stiffness: 110, damping: 20, mass: 1 }}
                      className="absolute -inset-px rounded-2xl bg-white shadow-lg shadow-black/10"
                    />
                  )}
                  <span className="relative flex items-center justify-between">
                    <span
                      className={`size-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors duration-500 ${
                        on
                          ? "bg-nx-purple text-white"
                          : "border border-white/50 text-white"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={`transition-colors duration-500 ${
                        on ? "text-nx-purple" : "text-white/80"
                      }`}
                    >
                      {f.icon}
                    </span>
                  </span>
                  <span className="relative text-[13px] font-medium leading-snug">
                    {f.text}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <main className="relative z-10 flex items-center justify-center px-6 py-10">
        <button
          type="button"
          aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="absolute right-3 top-3 size-10 rounded-full border border-nx-line bg-nx-surface text-nx-text-2 hover:text-nx-text flex items-center justify-center transition-colors"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="nx-login-card w-full max-w-[22rem] flex flex-col gap-6">
          <div className="lg:hidden flex items-center gap-3">
            <span className="size-10 rounded-full bg-nx-gradient text-white flex items-center justify-center">
              <Snowflake size={20} />
            </span>
            <span className="text-lg font-bold text-nx-text">Labotec</span>
          </div>

          <div className="flex flex-col gap-1.5 text-center">
            <h1 className="text-3xl font-bold text-nx-text">Iniciar sesión</h1>
            <p className="text-[15px] text-nx-text-2">Ingresa con tu usuario de Labotec</p>
          </div>

          <LoginForm />

          <p className="text-center text-xs leading-relaxed text-nx-text-3">
            Al ingresar confirmas que aceptas los Términos de uso y la Política
            de privacidad de Labotec.
          </p>
        </div>
      </main>
    </div>
  );
}
