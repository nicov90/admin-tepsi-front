'use client'
import CargarRol from '@/components/roles/cargarRol'
import { RolesColumns } from '@/components/tables/rolesDefinitions'
import { DataTable } from '@/components/ui/data-table'
import TableSkeleton from '@/components/ui/table-skeleton'
import { UsuariosRolesContext } from '@/providers/usuariosRoles-provider'
import React, { useContext } from 'react'

const Roles = () => {
  const { listaRoles } = useContext(UsuariosRolesContext);

  return (
    <div className="flex min-h-screen flex-col py-10 px-1 lg:px-28">
      <h1 className="text-[1.6rem] md:text-3xl font-bold py-3 pb-4 text-center">Roles</h1>
      {listaRoles ? (
        <DataTable 
          columns={RolesColumns} 
          data={listaRoles}
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