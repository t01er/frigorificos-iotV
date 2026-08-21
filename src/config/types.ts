export interface PaginacionResponse {
  status: boolean;
  total_records: number;
  total_pages: number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
}

export interface Taller {
  codigo: number;
  nombre: string;
  direccion: string;
  latitud: string;
  longitud: string;
  supervisor: string;
  coordinador: string;
  tipo: number;
  razon_social: string;
}

export interface TalleresResponse extends PaginacionResponse {
  data: Taller[]; 
}

export interface TalleresResponseAlternativa extends PaginacionResponse {
  talleres: Taller[]; 
}