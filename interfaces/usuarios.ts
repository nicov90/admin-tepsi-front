import { RolesListaNombres } from "./roles";

export interface IUsuario {
    id: string;
    nombre: string;
    email: string;
    password: string;
    roles: RolesListaNombres[];
    cargadoPor: string;
    existePersonal: boolean;
  }

export interface IUsuarioUpdate {
  nombre?: string;
  email?: string;
  password?: string | null;
  roles?: string[];
  cargadoPor?: string;
}
  
export type IUsuarioSinPassword = Omit<IUsuario, 'password' | 'id'>;

export interface IUsuarioNuevo extends Omit<IUsuario, 'id' | 'existePersonal' | 'roles'> {
  tipoLogin?: 'microsoft' | 'custom';
  roles: string[];
}