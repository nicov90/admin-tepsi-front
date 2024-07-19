'use client'
import React, { useContext, useEffect, useState } from 'react'
import { DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'
import { UsuariosRolesContext } from '@/providers/usuariosRoles-provider'
import { toast } from 'sonner'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { updateRol } from '@/database/dbRoles'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'

const RolDetalles = () => {
  const { push } = useRouter();
  const pathname = usePathname();
  const { refreshRoles, listaRoles } = useContext(UsuariosRolesContext);
  const idRolUrl = useSearchParams().get("id");
  const rol = listaRoles && listaRoles.find(u => u.Id === idRolUrl) || null;
  const [rolDescripcion, setRolDescripcion] = useState('');

  async function saveChanges() {
    try{
      if(rol){
        await updateRol(rol.Id, { Descripcion: rolDescripcion });
        refreshRoles();
        toast.success("Descripción del rol actualizado", { style: { backgroundColor: "green", color: "white" } });
        push(pathname);
      }
    }catch(err){
      console.log(err);
      toast.error("Hubo un error", { style: { backgroundColor: "red", color: "white" } });
    }
  }

  useEffect(() => {
    if (rol) {
      setRolDescripcion(rol.Descripcion);
    }
  }, [rol]);

  return (
    <>
    {rol && rol.Id === idRolUrl && (
      <DialogContent className="sm:max-w-[460px] py-10">
        <>
        <div
          className="flex flex-col gap-5 my-1 mx-5"
        >
          <DialogTitle className='w-full'>
            <p className="mb-2 text-start text-xl font-bold">Editar descripción del rol</p>
          </DialogTitle>
          <DialogDescription className='hidden'></DialogDescription>
          <Textarea
            placeholder="Describir el rol..."
            value={rolDescripcion}
            onChange={(e) => setRolDescripcion(e.target.value)}
            maxLength={200}
            style={{ resize: 'none' }}
          />
          <Button onClick={saveChanges}>Guardar</Button>
        </div>
        </>
      </DialogContent>  
    )}
  </>
  )
}

export default RolDetalles