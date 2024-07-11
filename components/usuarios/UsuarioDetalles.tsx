'use client'
import React, { useContext, useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { DialogContent, DialogTitle } from '../ui/dialog'
import { startCase } from 'lodash'
import { useSession } from 'next-auth/react'
import { IUsuarioNuevo } from '@/interfaces/usuarios'
import { UsuariosRolesContext } from '@/providers/usuariosRoles-provider'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form'
import { Input } from '../ui/input'
import { toast } from 'sonner'
import { updateUsuario } from '@/database/dbUsuarios'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CircleHelpIcon, PlusSquareIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import MultipleSelector from '../ui/select-multiple'
import { NuevaCuentaFormSchema } from '@/utils/validations'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getRolesByUsuarioId } from '@/database/dbRoles'
import { Rol } from '@/interfaces/roles'

const UsuarioDetalles = () => {
  const { data: session }: any = useSession();
  const { push } = useRouter();
  const pathname = usePathname();
  const { listaUsuarios, refreshUsuarios, listaRoles } = useContext(UsuariosRolesContext);
  const idUsuarioUrl = useSearchParams().get("id");
  const usuario = listaUsuarios && listaUsuarios.find(u => u.id === idUsuarioUrl) || null;

  const form = useForm<z.infer<typeof NuevaCuentaFormSchema>>({
    resolver: zodResolver(NuevaCuentaFormSchema),
    defaultValues: {
      nombre: usuario?.nombre,
      email: usuario?.email,
      roles: [],
    },
  })
  const [mostrarInputPassword, setMostrarInputPassword] = useState(false);

  async function onSubmit(values: z.infer<typeof NuevaCuentaFormSchema>) {
    const formattedValues: IUsuarioNuevo = {
      ...values,
      nombre: startCase(values.nombre.trim()),
      email: values.email.trim(),
      password: (values.password?.includes('*') ? usuario?.password : values.password?.trim()) || '',
      roles: values.roles,
      cargadoPor: session.user?.id || '',
    }
    
    try{
      if(usuario){
        await updateUsuario(usuario.email, formattedValues);
        refreshUsuarios();
        toast.success("Usuario modificado", { style: { backgroundColor: "green", color: "white" } });
        push(pathname);
      }
    }catch(err){
      console.log(err);
      toast.error("Hubo un error", { style: { backgroundColor: "red", color: "white" } });
    }
  }

  useEffect(() => {
    if (usuario) {
      (async () => {
        form.reset({
          nombre: usuario?.nombre,
          email: usuario?.email,
          roles: [],
          password: usuario?.password ? '***********' : '',
        });
        const roles: Rol[] = await getRolesByUsuarioId(usuario.id).then((res) => res);
        form.setValue('roles', roles.map(r => r.Id));
      })()
    }
  }, [usuario]);

  return (
    <>
    {usuario && usuario.id === idUsuarioUrl && (
      <DialogContent className="sm:max-w-[460px] py-10">
        <>
        <div
          id="user_add"
          className="flex flex-col gap-1 my-1 mx-5"
        >
          <DialogTitle className='w-full'>
            <p className="mb-5 text-start text-xl font-bold">Editar usuario</p>
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
                          // if (NuevaCuentaFormSchema.shape.email.safeParse(e.target.value).success) {
                          //   checkEmailExists(e.target.value);
                          // }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!usuario.password && (
                <div 
                  className={`w-full ${mostrarInputPassword ? "hidden" : "flex"} gap-2 items-center cursor-pointer`}
                  onClick={()=>setMostrarInputPassword(!mostrarInputPassword)}
                >
                  <p className="text-sm text-slate-500 dark:text-slate-400">Incluir contraseña</p>
                  <PlusSquareIcon size={15} className="text-slate-500 dark:text-slate-400"/>
                </div>
              )}
              {(usuario.password || mostrarInputPassword) && (
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
                          //   const r = listaRoles.todos.find(
                          //     (rol) => rol.Id === rolSeleccionado
                          //   );
                            
                          //   return {
                          //     value: r!.Id || '',
                          //     label: r!.Name || ''
                          //   };
                          // })}
                          value={field.value.map((rolSeleccionado) => {
                            const r = listaRoles.todos.find(
                              (rol) => rol.Id === rolSeleccionado
                            );
                            console.log(field.value)
                  
                            return {
                              value: r?.Id || '',
                              label: r?.Name + ' - ' + r?.Modulo || '',
                              group: r?.Modulo || 'Otros'
                            };
                          })}
                          onChange={(selectedOptions) => {
                            field.onChange(selectedOptions.map(option => option.value));
                          }}
                          options={listaRoles.todos.map((rol) => ({
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
              <Button type="submit" className='w-full' style={{ marginTop: 30 }}>Editar</Button>
            </form>
          </Form>
        </div>
        </>
      </DialogContent>  
    )}
  </>
  )
}

export default UsuarioDetalles