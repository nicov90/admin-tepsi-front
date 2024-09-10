'use client'
import React, { useCallback, useContext, useRef, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import { MoreHorizontal } from 'lucide-react'
import { Dialog, DialogTrigger } from '../ui/dialog'
import { toast } from 'sonner'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { deleteRole } from '@/database/dbRoles'
import { deleteUsuario } from '@/database/dbUsuarios'
import { UsuariosRolesContext } from '@/providers/usuariosRoles-provider'
import UsuarioDetalles from '../usuarios/UsuarioDetalles'
import RolDetalles from '../roles/RolDetalles'
import { SessionWithUser } from '@/interfaces/session'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

interface Props{
  row: any
  nombreTabla: 'usuarios' | 'roles'
}

const TableItemDropdown = ({ row, nombreTabla }: Props) => {
  const { push } = useRouter();
  const { data: session } = useSession() as SessionWithUser;
  const { refreshUsuarios, refreshRoles } = useContext(UsuariosRolesContext);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const detallesRef = useRef<HTMLDivElement | null>(null);
  const eliminarRef = useRef<HTMLDivElement | null>(null);
  const id = searchParams.get("id")
  const [openEliminarModal, setOpenEliminarModal] = useState(false);
  const rowData = row.original;
  const esUsuarioActual = rowData.email === session?.user?.email
  const usuarioActualEsAdminGeneral = session?.user?.roles?.includes("Admin - GENERAL");
  const filaUsuarioEsAdminGeneral = nombreTabla === 'usuarios' && rowData.roles.includes("Admin - GENERAL");
  const deshabilitarModificacion = !usuarioActualEsAdminGeneral && filaUsuarioEsAdminGeneral;

  const handleEliminar = async() => {
    switch (nombreTabla) {
      case 'usuarios':
          if(!deshabilitarModificacion){
            try{
              if(esUsuarioActual){
                toast.error('No puedes eliminarte a ti mismo.', { style: { backgroundColor: "red", color: "white" } }); 
                return;
              }
              deleteUsuario(rowData.email);
              toast.success('Usuario eliminado con exito.', { style: { backgroundColor: "green", color: "white" } });
              
              refreshUsuarios();
            }catch(err){
              console.log(err);
              toast.error('Hubo un error', { style: { backgroundColor: "red", color: "white" } });
            }
          }
        break;

      case 'roles':
          if(!deshabilitarModificacion){
            if(rowData.Modulo == 'GENERAL' && rowData.Name == 'Admin'){
              toast.error('Este rol no se puede eliminar.', { style: { backgroundColor: "red", color: "white" } });
              return;
            }
            try{
              await deleteRole(rowData.Id);
              toast.success('Rol eliminado con exito.', { style: { backgroundColor: "green", color: "white" } });
    
              refreshRoles();
            }catch(err: any){
              console.log(err);
              const errMsj = err.response?.data?.mensaje;
              toast.error(`${errMsj ? `${errMsj}` : 'Ha ocurrido un error'}`, { style: { backgroundColor: "red", color: "white" } });
            }
          }
        break;

      default:
        break;
    }
  }
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
          {deshabilitarModificacion ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className='w-full cursor-default'>
                  <DropdownMenuItem
                    onClick={() => push(`${pathname}?id=${nombreTabla === 'usuarios' ? rowData.id : rowData.Id}`)}
                    disabled={deshabilitarModificacion}
                  >
                    Editar
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent 
                    side='bottom'
                    className={`w-40 bg-gray-800 text-white p-2 rounded-md shadow-lg text-xs text-pretty text-center`}
                  >
                  {`No puedes modificar a un usuario con rol Admin - GENERAL`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <DropdownMenuItem
              onClick={() => push(`${pathname}?id=${nombreTabla === 'usuarios' ? rowData.id : rowData.Id}`)}
            >
              Editar
            </DropdownMenuItem>
          )}
          {deshabilitarModificacion ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className='w-full cursor-default'>
                  <DropdownMenuItem 
                    onClick={() => eliminarRef.current?.click()} 
                    className='font-medium text-red-700 focus:text-red-900'
                    disabled={deshabilitarModificacion}
                  >
                    Eliminar
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent 
                    side='bottom'
                    className={`w-40 bg-gray-800 text-white p-2 rounded-md shadow-lg text-xs text-pretty text-center`}
                  >
                  {`No puedes modificar a un usuario con rol Admin - GENERAL`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <DropdownMenuItem 
              onClick={() => eliminarRef.current?.click()} 
              className='font-medium text-red-700 focus:text-red-900'
            >
              Eliminar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={!!id} onOpenChange={() => push(pathname)}>
        <DialogTrigger asChild>
          <div ref={detallesRef}></div>
        </DialogTrigger>
        {nombreTabla === 'usuarios' && <UsuarioDetalles/>}
        {nombreTabla === 'roles' && <RolDetalles/>}
      </Dialog>
      <AlertDialog open={openEliminarModal} onOpenChange={setOpenEliminarModal}>
        <AlertDialogTrigger asChild style={{ display: 'none' }}>
          <div ref={eliminarRef}></div>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Estás seguro/a?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className='bg-red-700 hover:bg-red-800' onClick={handleEliminar}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default TableItemDropdown