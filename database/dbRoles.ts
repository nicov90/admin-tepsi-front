import { authApi } from "@/apiAxios/authApi";
import { RolUpdate } from "@/interfaces/roles";

export async function getRoles(): Promise<any> {
  const roles = await authApi().get(`/Roles`).then((res) => res.data.response.roles);
  return roles;
}

export async function getRolesByUsuarioId(idUsuario: string): Promise<any> {
  const roles = await authApi().get(`/Roles/${idUsuario}`).then((res) => res.data.response.roles);
  return roles;
}

export async function insertRole(name: string, modulo: string, descripcion: string): Promise<any> {
  const response = await authApi().post(`/Roles`, {
    Name: name,
    Modulo: modulo,
    Descripcion: descripcion
  });
  return response.data;
}

export async function updateRol(id: string, body: RolUpdate): Promise<any> {
  const response = await authApi().patch(`/Roles/${id}`, {
    ...body
  });
  return response.data;
}

export async function deleteRole(id: string): Promise<any> {
  const response = await authApi().delete(`/Roles/${id}`);
  return response.data;
}