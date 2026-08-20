import { useState, useRef, type ComponentType, type Ref } from "react";
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

export default function LoginForm() {
  const [login, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const recaptchaRef = useRef<unknown>(null);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

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
    castedError?.data?.data?.message || castedError?.data?.message || null;

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="space-y-4 ">
        <Input
          variant="faded"
          radius="sm"
          size="lg"
          placeholder="Usuario"
          value={email}
          onValueChange={setEmail}
          isDisabled={isLoading}
          labelPlacement="outside"
          startContent={<UserRounded className="text-black/70" />}
        />

        <Input
          variant="faded"
          radius="sm"
          size="lg"
          placeholder="Contraseña"
          type={showPassword ? "text" : "password"}
          value={password}
          onValueChange={setPassword}
          isDisabled={isLoading}
          startContent={<Lock className="text-black/70" />}
          endContent={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-black/70"
            >
              {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        <div className="">
          <ReCAPTCHAComponent
            ref={recaptchaRef}
            sitekey={RECAPTCHA_TOKEN}
            onChange={handleCaptchaChange}
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          variant="solid"          
          radius="sm"
          className="w-full bg-white text-primary font-bold"
          isLoading={isLoading}
          isDisabled={isLoading || !captchaToken}
        >
          {isLoading ? "Iniciando Sesión..." : "Iniciar Sesión"}
        </Button>

        {globalErrorMessage && (
          <p className="mt-2 text-sm text-red-500">{globalErrorMessage}</p>
        )}
      </div>
    </form>
  );
}
