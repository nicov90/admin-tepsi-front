'use client'
import React, { useContext, useState } from 'react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../ui/dialog'
import { startCase } from 'lodash'
import { useSession } from 'next-auth/react'
import { IUsuarioNuevo } from '@/interfaces/usuarios'
import { UsuariosRolesContext } from '@/providers/usuariosRoles-provider'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { toast } from 'sonner'
import { getUsuarioByEmail, registerUsuario } from '@/database/dbUsuarios'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CircleHelpIcon, Info, PlusSquareIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import MultipleSelector from '../ui/select-multiple'
import { NuevaCuentaFormSchema } from '@/utils/validations'
import { SessionWithUser } from '@/interfaces/session'

const CargarUsuario = () => {
  const { data: session }: any = useSession() as SessionWithUser;
  const { refreshUsuarios, listaRoles } = useContext(UsuariosRolesContext);

  const [openModal, setOpenModal] = useState(false);
  // const [nuevoUsuario, setNuevoUsuario] = useState<IUsuarioNuevo>({
  //   nombre: '',
  //   email: '',
  //   password: '',
  //   roles: [],
  //   cargadoPor: ''
  // })

  
  const form = useForm<z.infer<typeof NuevaCuentaFormSchema>>({
    resolver: zodResolver(NuevaCuentaFormSchema),
    defaultValues: {
      nombre: "",
      email: "",
      roles: [],
    },
  })
  const { setError, clearErrors } = form;
  const [mostrarInputPassword, setMostrarInputPassword] = useState(false);
  
  const handleOpenModal = (open: boolean) => {
    form.reset();
    setMostrarInputPassword(false);
    setOpenModal(open)
  };

  const checkEmailExists = async (email: string) => {
    try {
      // const existePersonal = (await apiAxios().get(`/personal/${email}`)).data.data;
      // if (!existePersonal) {
      //   setError('email', { type: 'manual', message: 'No existe personal con este email' });
      //   return false;
      // } 

      // const existeUsuario = (await apiAxios().get(`/usuarios/${email}`)).data.data;
      const existeUsuario = await getUsuarioByEmail(email);
      if(existeUsuario) {
        setError('email', { type: 'manual', message: 'Ya existe un usuario con este email' });
        return false;
      }

      clearErrors('email');
      return true;
    } catch (error) {
      setError('email', { type: 'manual', message: 'Error al verificar el email' });
      return false;
    }
  };

  async function onSubmit(values: z.infer<typeof NuevaCuentaFormSchema>) {
    const formattedValues: IUsuarioNuevo = {
      ...values,
      nombre: startCase(values.nombre.trim()),
      email: values.email.trim(),
      password: values.password?.trim() || '',
      roles: values.roles,
      cargadoPor: session.user?.id || '',
    }
    if(!(await checkEmailExists(formattedValues.email))) {
      return;
    }
    
    try{
      await registerUsuario(formattedValues);
      refreshUsuarios();
      toast.success("Usuario creado", { style: { backgroundColor: "green", color: "white" } });
      handleOpenModal(false);
    }catch(err){
      console.log(err);
      toast.error("Hubo un error", { style: { backgroundColor: "red", color: "white" } });
    }
  }

  return (
    <>
      <Dialog open={openModal} onOpenChange={open => handleOpenModal(open)}>
        <DialogTrigger asChild className='cursor-pointer mr-3'>
          <Button variant="default" className='max-w-[200px] px-5' size="sm">Crear</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[460px] py-10">
        <div
          id="user_add"
          className="flex flex-col gap-1 my-1 mx-5"
        >
          <DialogDescription className='hidden'></DialogDescription>
          <DialogTitle className='w-full'>
            <p className="mb-5 text-start text-xl font-bold">Crear nuevo usuario</p>
          </DialogTitle>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-3 flex flex-col items-center">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Mario Gomez" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="example@tepsi.com.ar" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (NuevaCuentaFormSchema.shape.email.safeParse(e.target.value).success) {
                            checkEmailExists(e.target.value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {true && (
                <div 
                  className={`w-full ${mostrarInputPassword ? "hidden" : "flex"} gap-2 items-center cursor-pointer`}
                  onClick={()=>setMostrarInputPassword(!mostrarInputPassword)}
                >
                  <p className="text-sm text-slate-500 dark:text-slate-400">Incluir contraseña</p>
                  <PlusSquareIcon size={15} className="text-slate-500 dark:text-slate-400"/>
                </div>
              )}
              {mostrarInputPassword && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='flex gap-1 py-1.5'>
                        Contraseña
                        <p className="text-xs text-slate-500 dark:text-slate-400">(opcional)</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger onClick={(e) => e.preventDefault()}>
                              <CircleHelpIcon size={15} className="text-slate-800 dark:text-slate-400" />
                            </TooltipTrigger>
                            <TooltipContent className='w-svw max-w-[380px]'>
                              <p>Esta es la contraseña con la que el usuario puede iniciar sesión si no se ingresa con Microsoft.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                      </FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {listaRoles && (
                <FormField
                  control={form.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='flex gap-1 py-1'>Roles</FormLabel>
                      <FormControl>
                        <MultipleSelector
                          // value={form.getValues().roles.map((rolSeleccionado) => {
                          //   const r = listaRoles.find(
                          //     (rol) => rol.Id === rolSeleccionado
                          //   );
                            
                          //   return {
                          //     value: r!.Id || '',
                          //     label: r!.Name || ''
                          //   };
                          // })}
                          value={field.value.map((rolSeleccionado) => {
                            const r = listaRoles.find(
                              (rol) => rol.Id === rolSeleccionado
                            );
                  
                            return {
                              value: r?.Id || '',
                              label: r?.Name + ' - ' + r?.Modulo || '',
                              group: r?.Modulo || 'Otros'
                            };
                          })}
                          onChange={(selectedOptions) => {
                            field.onChange(selectedOptions.map(option => option.value));
                          }}
                          options={listaRoles.map((rol) => ({
                            value: rol.Id,
                            label: rol.Name,
                            group: rol.Modulo || 'Otros'
                          }))}
                          className="text-[13px]"
                          placeholder="Asignar roles"
                          groupBy='group'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                   
                  )}
                />
              )}
              <Button type="submit" className='w-full' style={{ marginTop: 30 }}>Crear</Button>
            </form>
          </Form>
        </div>
          {/* <DialogHeader className='mb-3'>
            <DialogTitle>Crear nuevo usuario</DialogTitle>
          </DialogHeader> */}
          {/* <div className="flex flex-col gap-2">
            <div className='flex items-center gap-2'>
              <Label htmlFor="usuario" className="text-center min-w-16">
                Usuario
              </Label>
              <Select
                name="usuario"
                onValueChange={(value) => setNuevoUsuario({ ...nuevoUsuario, IdUsuario: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar"/>
                </SelectTrigger>
                <SelectContent>
                  {listaUsuarios.map((usuario) => (
                    <SelectItem key={usuario.Id} value={usuario.Id}>
                      {startCase(usuario.Nombre)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div> */}
          {/* <DialogFooter>
            <Button type="submit" onClick={cargarUsuario}>Cargar</Button>
          </DialogFooter> */}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default CargarUsuario