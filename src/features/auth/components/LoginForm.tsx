import { useState, useRef, useEffect, type ComponentType, type Ref } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../auth/services/authApi";
import { Input, Button } from "@heroui/react";
import { UserRounded, Lock, Eye, EyeClosed } from "@solar-icons/react";
import ReCAPTCHA from "react-google-recaptcha";
import { RECAPTCHA_TOKEN } from "../../../config/env";

const ReCAPTCHAComponent = ReCAPTCHA as unknown as ComponentType<{
  sitekey: string;
  onChange: (token: string | null) => void;
  ref?: Ref<unknown>;
}>;

const CAPTCHA_WIDTH = 304;
const CAPTCHA_HEIGHT = 78;
const CAPTCHA_MAX_SCALE = 0.88;

export default function LoginForm() {
  const [login, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const recaptchaRef = useRef<unknown>(null);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const captchaBoxRef = useRef<HTMLDivElement>(null);
  const [captchaScale, setCaptchaScale] = useState(1);

  useEffect(() => {
    const el = captchaBoxRef.current;
    if (!el) return;
    const update = () => setCaptchaScale(Math.min(CAPTCHA_MAX_SCALE, el.clientWidth / CAPTCHA_WIDTH));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!captchaToken) {
      console.log("Completa el captcha");
      return;
    }

    try {
      const userData = await login({
        username: email,
        clave: password,
      }).unwrap();

      let targetRoute = "/dashboard/";

      if (userData.id === 8 || userData.id === 31) {
        targetRoute = "/dashboard/reservorios";
      }

      navigate(targetRoute, { replace: true });
    } catch (err) {
      console.error("Fallo el login multitenant:", err);
    }
  };

  const castedError = error as any;

  const globalErrorMessage =
    castedError?.error ||
    castedError?.data?.data?.message ||
    castedError?.data?.message ||
    null;

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-5">
        <Input
          size="sm"
          label="Usuario"
          autoComplete="username"
          value={email}
          onValueChange={setEmail}
          isDisabled={isLoading}
          startContent={<UserRounded size={18} className="text-default-400" />}
        />

        <Input
          size="sm"
          label="Contraseña"
          autoComplete="current-password"
          type={showPassword ? "text" : "password"}
          value={password}
          onValueChange={setPassword}
          isDisabled={isLoading}
          startContent={<Lock size={18} className="text-default-400" />}
          endContent={
            <button
              type="button"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowPassword(!showPassword)}
              className="text-nx-text-3 hover:text-nx-text transition-colors"
            >
              {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
            </button>
          }
        />

        <div
          ref={captchaBoxRef}
          className="w-full flex justify-center"
          style={{ height: CAPTCHA_HEIGHT * captchaScale }}
        >
          <div
            style={{
              width: CAPTCHA_WIDTH,
              flexShrink: 0,
              transform: `scale(${captchaScale})`,
              transformOrigin: "top center",
            }}
          >
            <ReCAPTCHAComponent
              ref={recaptchaRef}
              sitekey={RECAPTCHA_TOKEN}
              onChange={handleCaptchaChange}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          radius="full"
          size="md"
          className="w-full bg-nx-gradient text-white font-medium h-11 text-sm"
          isLoading={isLoading}
          isDisabled={isLoading || !captchaToken}
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>

        {globalErrorMessage && (
          <p
            role="alert"
            className="rounded-xl bg-nx-err-soft px-4 py-2.5 text-sm text-nx-err-ink text-center"
          >
            {globalErrorMessage}
          </p>
        )}
      </div>
    </form>
  );
}
