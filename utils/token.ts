import { jwtDecode} from "jwt-decode";

export function isTokenExpired(token: string): boolean {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp * 1000 < Date.now(); // Compara la expiración con la fecha actual
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return true; // En caso de error, asumimos que está expirado
  }
}
