'use client'
import CargarRol from '@/components/roles/cargarRol'
import { RolesColumns } from '@/components/tables/rolesDefinitions'
import { DataTable } from '@/components/ui/data-table'
import TableSkeleton from '@/components/ui/table-skeleton'
import { SessionWithUser } from '@/interfaces/session'
import { UsuariosRolesContext } from '@/providers/usuariosRoles-provider'
import { useSession } from 'next-auth/react'
import React, { useContext } from 'react'

const Roles = () => {
  const { data: session } = useSession() as SessionWithUser;
  const { listaRoles, modulosAdminUsuario } = useContext(UsuariosRolesContext);
  const tieneAdminGeneral = session?.user.roles?.includes('Admin - GENERAL');
  
  const rolesVisibles = tieneAdminGeneral 
  ? listaRoles 
  : listaRoles?.filter(rol => modulosAdminUsuario.includes(rol.Modulo));

  return (
    <div className="flex flex-col py-10 px-1 lg:px-28">
      <h1 className="text-[1.6rem] md:text-3xl font-bold py-3 pb-4 text-center">Roles</h1>
      {rolesVisibles ? (
        <DataTable 
          columns={RolesColumns} 
          data={rolesVisibles}
          filterByColumn='Name'
          searchPlaceholder='Buscar por rol...'
        >
          <CargarRol />
        </DataTable>
      ) : (
        <TableSkeleton />
      )}
    </div>
  )
}

export default Roles