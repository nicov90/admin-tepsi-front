export interface Rol {
  Id: string;
  FullName: RolesListaNombres;
  Name: string;
  Modulo: string;
  Descripcion: string;
}

export interface RolUpdate{
  Name?: string;
  Modulo?: string;
  Descripcion?: string;
}

export type RolNuevo = Omit<Rol, 'Id' | 'FullName'>

export type RolesListaNombres = 
'Admin - GENERAL' | 'Admin - NOVEDADES' | 'Supervisor - NOVEDADES' | 'Finanzas - RENDICIONES' | 'Supervisor - RENDICIONES'