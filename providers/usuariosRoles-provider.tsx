'use client';
import { createContext, useEffect, useState } from "react";
import { getUsuarios } from "@/database/dbUsuarios";
import { Roles } from "@/interfaces/roles";
import { getRoles } from "@/database/dbRoles";
import { IUsuario } from "@/interfaces/usuarios";

interface ContextProps{
  refreshUsuarios: () => Promise<void>;
  listaUsuarios: IUsuario[] | null;
  refreshRoles: () => Promise<void>;
  listaRoles: Roles | null;
}
export const UsuariosRolesContext = createContext({} as ContextProps);

interface Props {
  children: React.ReactNode;
}

export default function UsuariosRolesProvider({ children, ...rest }: Props) {
  const [listaUsuarios, setListaUsuarios] = useState(null);
  const [listaRoles, setListaRoles] = useState<Roles | null>(null);

  const refreshUsuarios = async() => {
    setListaUsuarios(await getUsuarios());
  }

  const refreshRoles = async() => {
    const roles: Roles = await getRoles();
    setListaRoles(roles);
  }

  useEffect(() => {
    (async () => {
      refreshUsuarios();
      refreshRoles();
    })()
  }, []);

  return (
    <UsuariosRolesContext.Provider value={{ listaUsuarios, refreshUsuarios, listaRoles, refreshRoles }}>
      { children }
    </UsuariosRolesContext.Provider>
  );
}