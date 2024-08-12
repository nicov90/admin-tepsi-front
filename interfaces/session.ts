import { SessionContextValue } from "next-auth/react";
import { IUsuario } from "./usuarios";
import { JWT } from "next-auth/jwt";

// Para poder utilizar el tipo de user en el useSession();
export type SessionWithUser = Omit<SessionContextValue, 'data'> & { 
  data: { 
    user: SessionUser,
    accessToken: string;
    provider: string;
  } | null 
};
export interface JWTWithUser extends JWT {
  user?: SessionUser
}

interface SessionUser extends IUsuario {
  token: string;
}