import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../auth/services/authApi";
import { Input, Button } from "@heroui/react";
import { UserRounded, Lock, Eye, EyeClosed } from "@solar-icons/react";
// reCAPTCHA desactivado para la demo en Vercel (el dominio no está registrado en la clave).

export default function LoginForm() {
  const [login, { isLoading, error }] = useLoginMutation();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          radius="full"
          size="md"
          className="w-full bg-nx-gradient text-white font-medium h-11 text-sm"
          isLoading={isLoading}
          isDisabled={isLoading}
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
