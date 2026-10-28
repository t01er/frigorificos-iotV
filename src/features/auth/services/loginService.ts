import { 
  API_ENTEL_CORE, 
  API_NESTLE, 
  API_MEGALAB, 
  API_ALMACENES, 
  API_CONDOMINIOS 
} from "../../../config/env";

interface OpcionType {
  codigo: number;
  nombre: string;
  ruta: string;
}

interface DistribuidorPermitido {
  cod_distribuidor: number;
  name_distribuidor: string;
}

export interface UserAPIType {
  id: number;
  username: string;
  roles: string[];
  opciones: OpcionType[];
  accessToken: string;
  tokenType: string;
  distribuidoresPermitidos: DistribuidorPermitido[];
}

type LoginAPIType = UserAPIType & {
  message: string;
};

export const loginAPI = async (nombreUsuario: string, clave: string): Promise<UserAPIType> => {
  let response: LoginAPIType | null = null;
  // Mensaje del servidor principal (ej. "Error - Datos de usuario no coinciden !")
  let serverMessage: string | null = null;
  const urlEncodedBody = new URLSearchParams({ nombreUsuario, clave }).toString();

  const formHeaders = {
    Accept: "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  };

  try {
    const res1 = await fetch(`${API_ENTEL_CORE}/Auth`, {
      method: "POST",
      headers: formHeaders,
      body: urlEncodedBody,
    });

    if (res1.ok) {
      response = await res1.json();
      if (response && response.message !== "OK") {
        serverMessage = response.message?.trim() || null;
      }
    }

    if (response && response.message === "OK") {
      
      if (response.id === 9) {
        const res2 = await fetch(`${API_NESTLE}/Auth`, {
          method: "POST",
          headers: formHeaders,
          body: urlEncodedBody,
        });

        if (!res2.ok) throw new Error("Error de comunicación con la API de Nestlé");
        const data2 = await res2.json();

        if (!data2 || !data2.accessToken) {
          throw new Error("Autorización denegada por el servicio de Nestlé");
        }

        response = {
          ...response,
          accessToken: data2.accessToken,
          tokenType: data2.tokenType ?? "Bearer",
          distribuidoresPermitidos: data2.distribuidoresPermitidos ?? [],
        };
      }
      else if (response.id === 11) {
        const res2 = await fetch(`${API_MEGALAB}/Auth`, {
          method: "POST",
          headers: formHeaders,
          body: urlEncodedBody,
        });

        if (!res2.ok) throw new Error("Error de comunicación con la API de Megalab");
        const data2 = await res2.json();

        response.accessToken = data2.accessToken;
      }
      else if (response.id === 12) {
        const res2 = await fetch(`${API_ALMACENES}/Auth`, {
          method: "POST",
          headers: formHeaders,
          body: urlEncodedBody,
        });

        if (!res2.ok) throw new Error("Error de comunicación con el módulo de Almacenes");
        const data2 = await res2.json();

        response.accessToken = data2.token ?? data2.accessToken;
      }
    } else {
      response = null;
    }

  } catch (error: any) {
    console.warn("Fallo en la ruta principal de autenticación, intentando contingencia...", error.message);
    response = null; 
  }

  if (!response || !response.accessToken) {
    try {
      const res2 = await fetch(`${API_CONDOMINIOS}/auth/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: nombreUsuario,
          password: clave,
        }),
      });

      if (!res2.ok) {
        const errData = await res2.json().catch(() => ({}));
        throw new Error(errData.message || `Error en contingencia: ${res2.status}`);
      }

      const data2: { token: string } = await res2.json();

      response = {
        id: 0,
        username: nombreUsuario,
        roles: [],
        opciones: [],
        accessToken: data2.token,
        tokenType: "Bearer",
        message: "OK",
        distribuidoresPermitidos: [],
      };
    } catch (fallbackError: any) {
      throw new Error(
        serverMessage ||
          fallbackError.message ||
          "No se pudo conectar con ningún servicio de autenticación.",
      );
    }
  }

  const { message, ...user } = response;

  if (message !== "OK") {
    throw new Error("Estructura de autenticación corrupta.");
  }

  return user;
};