'use client'
import React, { useContext, useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { startCase } from 'lodash'
import { useSession } from 'next-auth/react'
import { Rol, RolNuevo } from '@/interfaces/roles'
import MultipleSelector from '../ui/select-multiple'
import { UsuariosRolesContext } from '@/providers/usuariosRoles-provider'
import { Input } from '../ui/input'
import { toast } from 'sonner'
import { insertRole } from '@/database/dbRoles'
import { Textarea } from '../ui/textarea'

const CargarRol = () => {
  const { data: session }: any = useSession();
  const { refreshRoles, listaRoles } = useContext(UsuariosRolesContext);
  const listaModulos = listaRoles ? [...new Set([...listaRoles.todos.map((rol: Rol) => rol.Modulo)])] : [];

  const [openModal, setOpenModal] = useState(false);
  const [nuevoRol, setNuevoRol] = useState<RolNuevo>({
    Name: '',
    Modulo: '',
    Descripcion: '',
  })

  const cargarRol = async() => {
    if(nuevoRol.Name === '' || nuevoRol.Modulo === '') {
      toast.error('Falta completar campos', { style: { backgroundColor: 'red', color: 'white' } });
      return;
    }

    try{
      await insertRole(nuevoRol.Name, nuevoRol.Modulo, nuevoRol.Descripcion);
      refreshRoles();
      toast.success('Rol creado exitosamente', { style: { backgroundColor: 'green', color: 'white' } });
    
    }catch(err){
      console.log(err);
      toast.error('No se pudo crear el rol');
    }
    
    handleOpenModal(false);
  }
  
  const handleOpenModal = (open: boolean) => {
    setOpenModal(open)
    setNuevoRol({ Name: '', Modulo: '', Descripcion: '' });
  };

  return (
    <>
      <Dialog open={openModal} onOpenChange={open => handleOpenModal(open)}>
        <DialogTrigger asChild className='cursor-pointer mr-3'>
          <Button variant="default" className='max-w-[200px] px-5' size="sm">Crear</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[380px] py-10 px-8">
          <DialogTitle>
            <p className="mb-0 text-start text-xl font-bold">Crear nuevo rol</p>
          </DialogTitle>
          <div className="flex flex-col gap-5 my-3">
            <div className='flex flex-col items-start gap-3'>
              <Label htmlFor="rol_nombre">
                Nombre
              </Label>
              <Input
                id="rol_nombre"
                placeholder="Nombre del rol"
                maxLength={25}
                value={nuevoRol.Name}
                onChange={(e) => setNuevoRol({ ...nuevoRol, Name: startCase(e.target.value) })}
              />
            </div>
            <div className='flex flex-col items-start gap-3'>
              <Label htmlFor="rol">
                Módulo
              </Label>
              <MultipleSelector
                options={listaModulos.map((modulo) => ({
                  value: modulo,
                  label: modulo,
                }))}
                value={nuevoRol.Modulo ? [{
                  value: nuevoRol.Modulo,
                  label: nuevoRol.Modulo.toUpperCase(),
                }] : []}
                placeholder="Nombre del módulo"
                onChange={(e) => {
                  setNuevoRol({ ...nuevoRol, Modulo: e.length > 0 ? (e[0].value).toUpperCase() : '' });
                }}
                creatable
                maxSelected={1}
                onMaxSelected={() => toast.error('Solo puede agregar un módulo', { style: { backgroundColor: 'red', color: 'white' } })}
                className='-mb-2'
                emptyIndicator={
                  <p className="text-center text-sm leading-10 text-gray-600 dark:text-gray-400">
                    Sin resultados
                  </p>
                }
              />
            </div>
            <div className='flex flex-col items-start gap-3'>
              <Label htmlFor="rol_descripcion">
                Descripción
              </Label>
              <Textarea
                id="rol_descripcion"
                placeholder="Breve descripción del rol..."
                value={nuevoRol.Descripcion}
                onChange={(e) => setNuevoRol({ ...nuevoRol, Descripcion: e.target.value.length === 1 ? startCase(e.target.value) : e.target.value })}
                maxLength={150}
                style={{ resize: 'none' }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={cargarRol} className='w-full'>Cargar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </>
  )
}

export default CargarRol