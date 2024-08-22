import { authApi } from "@/apiAxios/authApi";

export async function getPersonalByEmail(email: string): Promise<any> {
  const data = await authApi().get(`/personal/${email}`).then((res) => res.data.data[0]);
  return data;
}