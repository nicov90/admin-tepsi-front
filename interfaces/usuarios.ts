export interface IUsuario {
    id: string;
    nombre: string;
    email: string;
    password: string;
    rolGeneral: string;
    rolesModulo: string[];
    roles: string[];
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

export interface IUsuarioNuevo extends Omit<IUsuario, 'id' | 'rolGeneral' | 'rolesModulo' | 'existePersonal'> {
  tipoLogin?: 'microsoft' | 'custom';
}