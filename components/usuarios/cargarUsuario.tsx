'use client'
import { getPersonalByEmail } from '@/database/dbPersonal'
import { getUsuarioByEmail, registerUsuario } from '@/database/dbUsuarios'
import { IPersonal } from '@/interfaces/personal'
import { SessionWithUser } from '@/interfaces/session'
import { IUsuarioNuevo } from '@/interfaces/usuarios'
import { UsuariosRolesContext } from '@/providers/usuariosRoles-provider'
import { NuevaCuentaFormSchema, NuevaCuentaFormSchemaRefined } from '@/utils/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { startCase } from 'lodash'
import { CircleHelpIcon, PlusSquareIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import MultipleSelector from '../ui/select-multiple'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

const CargarUsuario = () => {
  const { data: session }: any = useSession() as SessionWithUser;
  const { refreshUsuarios, listaRoles } = useContext(UsuariosRolesContext);

  const [openModal, setOpenModal] = useState(false);
  
  const form = useForm<z.infer<typeof NuevaCuentaFormSchemaRefined>>({
    resolver: zodResolver(NuevaCuentaFormSchemaRefined),
    defaultValues: {
      nombre: "",
      email: "",
      roles: [],
      mostrarInputPassword: false,
    },
  })
  const { setError, clearErrors } = form;
  const handleOpenModal = (open: boolean) => {
    form.reset();
    setOpenModal(open)
  };

  const checkEmailExists = async (email: string) => {
    try {
      const existeUsuario = await getUsuarioByEmail(email);
      if(existeUsuario) {
        setError('email', { type: 'manual', message: 'Ya existe un usuario con este email' });
        return false;
      }else{
        setearNombre(email);
      }

      clearErrors('email');
      return true;
    } catch (error) {
      setError('email', { type: 'manual', message: 'Error al verificar el email' });
      return false;
    }
  };

  const setearNombre = async(email: string) => {
    const persona: IPersonal = await getPersonalByEmail(email);
    if(persona){
      form.setValue('nombre', persona.Apellido + ' ' + persona.Nombre);
    }
  }

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
    
    await registerUsuario(formattedValues);
    refreshUsuarios();
    handleOpenModal(false);
  }

  return (
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
                  name="email"
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="example@tepsi.com.ar" 
                          {...field}
                          onChange={(e) => {
                            clearErrors('email');
                            form.resetField('nombre');
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
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Gomez Mario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch('mostrarInputPassword') ? (
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
                ) : (
                  <div 
                    className={`w-full ${form.getValues().mostrarInputPassword ? "hidden" : "flex"} gap-2 items-center cursor-pointer`}
                    onClick={()=>form.setValue('mostrarInputPassword', true)}
                  >
                    <p className="text-sm text-slate-500 dark:text-slate-400">Incluir contraseña</p>
                    <PlusSquareIcon size={15} className="text-slate-500 dark:text-slate-400"/>
                  </div>
                )}
                {listaRoles && (
                  <FormField
                    control={form.control}
                    name="roles"
                    render={({ field }) => (
                      <FormItem className='w-full flex flex-col'>
                        <FormLabel className='flex gap-1 py-1'>Roles</FormLabel>
                        <FormControl>
                          <MultipleSelector
                            value={field.value.map((rolSeleccionado) => {
                              const r = listaRoles.find(
                                (rol) => rol.Id === rolSeleccionado
                              );
                    
                              return {
                                id: r?.Id || '',
                                value: r?.Name + ' - ' + r?.Modulo || '',
                                label: r?.Name + ' - ' + r?.Modulo || '',
                                group: r?.Modulo || 'Otros'
                              };
                            })}
                            onChange={(selectedOptions) => {
                              field.onChange(selectedOptions.map(option => option.id));
                            }}
                            options={listaRoles.map((rol) => ({
                              id: rol.Id || '',
                              value: rol.Name + ' - ' + rol.Modulo || '',
                              label: rol.Name,
                              group: rol.Modulo || 'Otros'
                            }))}
                            className="text-[13px]"
                            placeholder="Asignar roles"
                            groupBy='group'
                          />
                        </FormControl>
                        <FormMessage className='!mt-0'/>
                      </FormItem>
                    
                    )}
                  />
                )}
                <Button type="submit" className='w-full' style={{ marginTop: 30 }}>Crear</Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
  )
}

export default CargarUsuario