export interface Roles {
  general: Rol[];
  modulo: Rol[];
  todos: Rol[];
}

export interface Rol {
  Id: string;
  Name: string;
  Modulo: string;
  Descripcion: string;
}

export interface RolUpdate{
  Name?: string;
  Modulo?: string;
  Descripcion?: string;
}

export type RolNuevo = Omit<Rol, 'Id'>