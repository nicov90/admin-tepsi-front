'use client'
import { getPersonalByEmail } from '@/database/dbPersonal'
import { getRolesByUsuarioId } from '@/database/dbRoles'
import { updateUsuario } from '@/database/dbUsuarios'
import { IPersonal } from '@/interfaces/personal'
import { Rol } from '@/interfaces/roles'
import { SessionWithUser } from '@/interfaces/session'
import { IUsuarioUpdate } from '@/interfaces/usuarios'
import { UsuariosRolesContext } from '@/providers/usuariosRoles-provider'
import { NuevaCuentaFormSchema, NuevaCuentaFormSchemaRefined } from '@/utils/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { startCase } from 'lodash'
import { CircleHelpIcon, PlusSquareIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useContext, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '../ui/button'
import { DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import MultipleSelector from '../ui/select-multiple'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'

const templatePassword = 'AAAAAAAAAAAAA';

const UsuarioDetalles = () => {
  const { data: session, update: updateSession } = useSession() as SessionWithUser;
  const { push } = useRouter();
  const pathname = usePathname();
  const { listaUsuarios, refreshUsuarios, listaRoles } = useContext(UsuariosRolesContext);
  const idUsuarioUrl = useSearchParams().get("id");
  const usuario = listaUsuarios && listaUsuarios.find(u => u.id === idUsuarioUrl) || null;

  const form = useForm<z.infer<typeof NuevaCuentaFormSchemaRefined>>({
    resolver: zodResolver(NuevaCuentaFormSchemaRefined),
    defaultValues: {
      nombre: usuario?.nombre,
      email: usuario?.email,
      roles: [],
      mostrarInputPassword: false,
    },
  })
  const { clearErrors } = form;
  const [permitirCambiarContraseña, setPermitirCambiarContraseña] = useState(false);

  async function onSubmit(values: z.infer<typeof NuevaCuentaFormSchema>) {
    const formattedValues: IUsuarioUpdate = {
      ...values,
      nombre: startCase(values.nombre.trim()),
      email: values.email.trim(),
      password: values.password === templatePassword ? null : values.password?.trim() || null,
      roles: values.roles
    }
    
    try{
      if(usuario){
        await updateUsuario(usuario.email, formattedValues);
        refreshUsuarios();
        toast.success("Usuario modificado", { style: { backgroundColor: "green", color: "white" } });
        if(usuario.email === session?.user?.email){
          updateSession();
        }
        push(pathname);
      }
    }catch(err){
      console.log(err);
      toast.error("Hubo un error", { style: { backgroundColor: "red", color: "white" } });
    }
  }

  const setearNombre = async(email: string) => {
    const persona: IPersonal = await getPersonalByEmail(email);
    if(persona){
      form.setValue('nombre', persona.Apellido + ' ' + persona.Nombre);
    }
  }

  useEffect(() => {
    if (usuario) {
      (async () => {
        form.reset({
          nombre: usuario?.nombre,
          email: usuario?.email,
          roles: [],
          password: usuario?.password ? templatePassword : '',
          mostrarInputPassword: usuario?.password ? true : false,
        });
        const roles: Rol[] = await getRolesByUsuarioId(usuario.id).then((res) => res);
        form.setValue('roles', roles.map(r => r.Id));
      })()
    }
    setPermitirCambiarContraseña(false);
  }, [usuario, idUsuarioUrl, form]);
  
  return (
    <>
    {usuario && usuario.id === idUsuarioUrl && (
      <DialogContent className="sm:max-w-[460px] py-10">
        <div
          id="user_add"
          className="flex flex-col gap-1 my-1 mx-5"
        >
          <DialogDescription className='hidden'></DialogDescription>
          <DialogTitle className='w-full'>
            <p className="mb-5 text-start text-xl font-bold">Editar usuario</p>
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
                            setearNombre(e.target.value);
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
              {(usuario.password || form.watch('mostrarInputPassword')) ? (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className='w-full'>
                      <FormLabel className='flex gap-1 py-1.5'>
                        Contraseña
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
                        <Input 
                          type="password" 
                          placeholder="********" 
                          {...field}
                          onChange={(e) => {
                            setPermitirCambiarContraseña(true);
                            field.onChange(e);
                          }}
                          onSelect={() => (usuario.password && !permitirCambiarContraseña) && form.setValue('password', '')} 
                          onBlur={() => (usuario.password && !permitirCambiarContraseña) && form.setValue('password', templatePassword)}
                        />
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
              <Button type="submit" className='w-full' style={{ marginTop: 30 }}>Guardar</Button>
            </form>
          </Form>
        </div>
      </DialogContent>  
    )}
  </>
  )
}

export default UsuarioDetalles