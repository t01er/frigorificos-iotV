import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "./services/authApi";

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

interface AuthState {
  user: Omit<UserAPIType, 'accessToken' | 'tokenType'> | null; 
  token: string | null;
  isAuthenticated: boolean;
}

const storedToken = localStorage.getItem("token");
const storedUser = localStorage.getItem("user");

const initialState: AuthState = {
  token: storedToken,
  isAuthenticated: !!storedToken,
  user: storedUser ? JSON.parse(storedUser) : null, 
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user"); 
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      authApi.endpoints.login.matchFulfilled,
      (state, action) => {
        const { accessToken, tokenType: _tokenType, ...restOfUser } = action.payload;
        
        state.token = accessToken;
        state.isAuthenticated = true;
        state.user = restOfUser; 

        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(restOfUser)); 
      }
    );
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;