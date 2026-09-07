import { HeroUIProvider } from "@heroui/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider locale="es-ES">
      {children}
    </HeroUIProvider>
  );
}