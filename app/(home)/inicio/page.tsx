'use client'
import { UsuarioColumns } from '@/components/tables/usuariosDefinitions';
import { DataTable } from '@/components/ui/data-table';
import TableSkeleton from '@/components/ui/table-skeleton';
import CargarUsuario from '@/components/usuarios/cargarUsuario';
import { UsuariosRolesContext } from '@/providers/usuariosRoles-provider';
import React, { useContext } from 'react'

const Inicio = () => {
  const { listaUsuarios } = useContext(UsuariosRolesContext);

  return (
    <div className="flex min-h-screen flex-col py-10 px-1 lg:px-28">
      <h1 className="text-[1.6rem] md:text-3xl font-bold py-3 pb-4 text-center">Usuarios</h1>
      {listaUsuarios ? (
        <DataTable 
          columns={UsuarioColumns} 
          data={listaUsuarios}
          filterByColumn='nombre'
          searchPlaceholder='Buscar por nombre...'
        >
          <CargarUsuario />
        </DataTable>
      ) : (
        <TableSkeleton />
      )}
    </div>
  )
}

export default Inicio