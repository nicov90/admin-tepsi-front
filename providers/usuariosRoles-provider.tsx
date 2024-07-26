'use client';
import { createContext, useEffect, useState } from "react";
import { getUsuarios } from "@/database/dbUsuarios";
import { Rol } from "@/interfaces/roles";
import { getRoles } from "@/database/dbRoles";
import { IUsuario } from "@/interfaces/usuarios";
import { useSession } from "next-auth/react";
import { SessionWithUser } from "@/interfaces/session";

interface ContextProps{
  refreshUsuarios: () => Promise<void>;
  listaUsuarios: IUsuario[] | null;
  refreshRoles: () => Promise<void>;
  listaRoles: Rol[] | null;
  modulosAdminUsuario: string[];
}
export const UsuariosRolesContext = createContext({} as ContextProps);

interface Props {
  children: React.ReactNode;
}

export default function UsuariosRolesProvider({ children, ...rest }: Props) {
  const { data: session } = useSession() as SessionWithUser;
  const [listaUsuarios, setListaUsuarios] = useState(null);
  const [listaRoles, setListaRoles] = useState<Rol[] | null>(null);

  // para limitar al usuario según los modulos en los que es administrador
  const modulosAdminUsuario = session?.user.roles 
    ? [...new Set([...session.user.roles.filter(rol => rol.startsWith('Admin')).map((rol: string) => rol.split(' - ')[1])])]
    : [];

  const refreshUsuarios = async() => {
    setListaUsuarios(await getUsuarios());
  }

  const refreshRoles = async() => {
    const roles: Rol[] = await getRoles();
    setListaRoles(roles);
  }

  useEffect(() => {
    (async () => {
      refreshUsuarios();
      refreshRoles();
    })()
  }, []);

  return (
    <UsuariosRolesContext.Provider value={{ listaUsuarios, refreshUsuarios, listaRoles, refreshRoles, modulosAdminUsuario }}>
      { children }
    </UsuariosRolesContext.Provider>
  );
}