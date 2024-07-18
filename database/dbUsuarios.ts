import Cookies from "js-cookie";
import { IUsuarioNuevo, IUsuarioUpdate } from "@/interfaces/usuarios";
import { authApi } from "@/apiAxios/authApi";

const clientToken = Cookies.get("token");

export async function getUsuarios(): Promise<any> {
  const data = await authApi().get(
    `/usuarios` ).then((res) => res.data.response.usuarios);

  return data;
}

export async function getUsuarioByEmail(email: string): Promise<any> {
  try{
    const usuario = await authApi(undefined, true).get(
      `/usuarios/${ email }`
    ).then((res) => res.data.response);
  
    return usuario;
  }catch(err){
    console.log(err)
    return null;
  }
}

export async function getUsuariosByRol(rol: string): Promise<any> {
  const data = await authApi().get(
    `/usuarios/rol/${rol}` ).then((res) => res.data.response);
  return data;
}

export async function registerUsuario(body: IUsuarioNuevo, token?: string): Promise<any> {
  const { nombre, email, password, roles, tipoLogin = 'custom', cargadoPor } = body;

  try{
    const user = await getUsuarioByEmail(email);
    if(!user){
      await authApi(token ? token : clientToken).post(
        `/usuarios`, {
          Nombre: nombre,
          Email: email,
          TipoLogin: tipoLogin,
          Password: password,
          Roles: roles,
          CargadoPor: cargadoPor
        }
      );
      return {
        hasError: false
      }
    }
  }catch(err){
    console.log(err)
    // return {
    //   hasError: true,
    //   message: "Ya existe un usuario con ese email"
    // }
  }
}

export async function updateUsuario(emailToChange: string, datos: IUsuarioUpdate): Promise<any> {
  await authApi(clientToken).patch(`/usuarios/${emailToChange}`, {
    Nombre: datos.nombre,
    Email: datos.email,
    Password: datos.password,
    Roles: datos.roles
  });
}

export async function deleteUsuario(email: string): Promise<any> {
  await authApi(clientToken).delete(`/usuarios/${email}`);
}