import React, { useEffect, useState } from 'react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { Button } from '../ui/button'
import { UsersIcon } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog'
import { getUsuariosByRol } from '@/database/dbUsuarios'
import { IUsuario } from '@/interfaces/usuarios'
import { Table, TableBody, TableCell, TableRow } from '../ui/table'

const UsuariosRolModal = ({ row }: any) => {
  const rolNombre = row.original.Name + ' - ' + row.original.Modulo
  const [openModal, setOpenModal] = useState(false);
  const [listaUsuarios, setListaUsuarios] = useState<IUsuario[]>([]);
  const handleOpenModal = (open: boolean) => {
    setOpenModal(open);
  };

  useEffect(() => {
    (async() => {
      const listaUsuarios = await getUsuariosByRol(row.original.Id);
      setListaUsuarios(listaUsuarios);
    })()
  }, [openModal])

  return (
    <Dialog open={openModal} onOpenChange={open => handleOpenModal(open)}>
      <DialogTrigger asChild className='cursor-pointer mr-3'>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
            <DialogTrigger asChild className='cursor-pointer mr-3'>
              <Button className='p-2' variant='ghost'>
                <UsersIcon className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ver usuarios con este rol</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] py-9 min-h-[500px] max-h-[100vh]">
        <div
          className="flex flex-col gap-1 my-1 mx-5"
        >
          <DialogTitle className='w-full mb-5 text-start text-lg flex flex-col'>
            <p className='text-gray-700'>Usuarios que poseen el rol:</p>
            <p className='font-bold text-xl'>{rolNombre}</p>
          </DialogTitle>
          <div className='/*border-2*/ h-full max-h-[600px] overflow-y-auto'>
            <Table className='w-full border-2 border-neutral-300'>
              <TableBody>
                {listaUsuarios.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No hay usuarios con este rol
                    </TableCell>
                  </TableRow>
                )}
                {listaUsuarios.map((usuario: IUsuario) => (
                  <TableRow
                    key={usuario.id}
                    className='hover:bg-gray-50 cursor-default'
                  > 
                    <TableCell className="font-semibold border-r-2 py-1.5">{usuario.nombre.toUpperCase()}</TableCell>
                    <TableCell className="font-medium py-1.5">{usuario.email}</TableCell>
                  </TableRow>
                ))}
                {/* {listaUsuarios.length !== 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-44 text-center">
                    </TableCell>
                  </TableRow>
                )} */}
              </TableBody>
            </Table>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UsuariosRolModal