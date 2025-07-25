import { authApi } from "@/apiAxios/authApi";
import { getUsuarioByEmail, registerUsuario } from '@/database/dbUsuarios';
import { IUsuario } from '@/interfaces/usuarios';
import { refreshAccessToken } from "@/utils/azureAD";
import bcrypt from 'bcrypt';
import dayjs from "dayjs";
import { jwtDecode } from 'jwt-decode';
import { AuthOptions } from "next-auth";
import AzureAD, { AzureADProfile } from 'next-auth/providers/azure-ad';
import Credentials from 'next-auth/providers/credentials';

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: 'Custom Login',
      credentials: {
        email: { label: 'Correo:', type: 'email', placeholder: 'tu@correo.com'  },
        password: { label: 'Contraseña:', type: 'password', placeholder: 'Contraseña'  },
      },
      async authorize(credentials, req):Promise<any> {
        try {
          const url = new URL(req.headers?.referer);
          const searchParams = url.searchParams;
          const callbackUrl = searchParams.get('callbackUrl') || '/';

          if(!credentials?.email || !credentials?.password){
            return null;
          }
          const user: IUsuario = await getUsuarioByEmail(credentials.email);
          if(!user){
            return null;
          }

          const passwordsMatch = await bcrypt.compare(credentials?.password, user.password);
          if(!passwordsMatch){
            return null;
          }

          const token = (await authApi(undefined, true).post(`/Auth/Validar`, {
            email: user.email,
            password: credentials.password
          }).then(res => res.data).catch(err => {
            console.log(err);
            return '';
          })).token;

          const userWithToken = {
            ...user,
            token,
            callbackUrl
          }

          // res.setHeader('Set-Cookie', `token=${token};path=/`)

          return userWithToken;

        } catch (error) {
          console.log(error);
          return null
        }
      }
    }),
    AzureAD({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      profile: (profile: AzureADProfile) => {
        return ({
        id: profile.oid,
        nombre: profile.name,
        email: profile.email,
      })},
      authorization: {
        params: {
          scope: 'openid profile email offline_access User.Read',
        }
      }
    }),
  ],

  callbacks: {
    async jwt({ token, account, user, trigger }: any) { // Devuelve el token al navegador
      // console.log('JWT Callback - Admin:', { token, account, user });
      
      if ( account && user ) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = Date.now() + account.expires_at! * 1000;
        token.provider = account.provider;
        token.user = user;
        
        if (token.provider === "azure-ad") {
          await handleAzureAdToken(token, account.id_token);
        }
      }
      
      if(trigger === 'signIn'){
        await registerUsuario({
          email: user.email,
          nombre: user.nombre,
          roles: [],
          tipoLogin: 'microsoft',
          password: '',
          cargadoPor: 'admin-tepsi',
        }, token.user.token);
      }
      
      return refreshAccessToken(token);
    },
    async session({ session, token }: any){  // reemplaza los valores del token en la sesion
      // console.log('Session Callback - Admin:', { session, token });
      session.accessToken = token.accessToken as string;
      session.provider = token.provider as string;

      const { callbackUrl = '/', ...tokenUser } = token.user;
      token.user = tokenUser as any;
      token.callbackUrl = callbackUrl as string;
      session.user = tokenUser as any || token;
      session.callbackUrl = callbackUrl as string;
      session.user.roles = [];

      const dbUser: IUsuario = await getUsuarioByEmail(session.user.email as string);
      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.roles = dbUser.roles || [];
        session.user.existePersonal = dbUser.existePersonal || false;
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) { // para colocar correctamente el callbackUrl en la url al cerrar sesión

      if(url.startsWith("/")){
        return `${baseUrl}${url}`;
      }

      const fullUrl = new URL(url);
      const callbackUrl = fullUrl.searchParams.get('callbackUrl');

      if(callbackUrl) {
        if(callbackUrl.startsWith("/")){
          return `${baseUrl}${callbackUrl}`;
        }

        return callbackUrl;
      };

      return url;

      // console.log(url, baseUrl)
      // let redirectUrl = `${baseUrl}`;

      // const fullUrl = new URL(url);
      // const callbackUrl = fullUrl.searchParams.get('callbackUrl');

      // if(callbackUrl) {
      //   if(callbackUrl.startsWith("/")){
      //     redirectUrl = `${baseUrl}${callbackUrl}`;
      //   }else{
      //     redirectUrl = callbackUrl;
      //   }
      // }
      
      // console.log(`Redirect URL: ${redirectUrl}`);
      // return redirectUrl;
    },
  },

  // Custom Pages
  pages: {
    signIn: '/auth/login',
  },

  session: {
    maxAge: 86400,
    strategy: 'jwt',
    updateAge: 86400, // cada día
  },

  events: {
    async signIn({ user, account, profile }: any) {
      const userName = (user?.name || profile?.name)?.split(" ").map((word: string) => word.toUpperCase()).join(" ")!;
      const userEmail = user?.email || profile?.email;
      if(account?.provider === 'azure-ad' && userEmail){
        try{
          if(user.token){
            await registerUsuario({
              email: userEmail,
              nombre: userName,
              roles: [],
              tipoLogin: 'microsoft',
              password: '',
              cargadoPor: 'admin-tepsi',
            }, user?.token);  
          }
        }catch(err){
          console.log(err)
        }
      }
    }
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.grupotepsi.com' : 'localhost'
      }
    },
    callbackUrl: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.callback-url' : `next-auth.callback-url`,
      options: {
        sameSite: 'none',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.grupotepsi.com' : 'localhost'
      }
    },
    csrfToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.csrf-token' : `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.grupotepsi.com' : 'localhost'
      }
    },
    nonce: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.nonce' : `next-auth.nonce`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.grupotepsi.com' : 'localhost'
      },
    },
    state: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.state' : `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.grupotepsi.com' : 'localhost'
      },
    },
    pkceCodeVerifier: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.pkce.code_verifier' : `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'none',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.grupotepsi.com' : 'localhost'
      },
    },
  }
}

const handleAzureAdToken = async (session: any, idTokenAzure: string) => {
  const tokenExpired = isTokenExpired(session.user?.token);
  if (!session.user.token || tokenExpired) {
    try {
      const newToken = (await authApi(undefined, true).post(`/Auth/ValidarTokenAzure`, {
        azureToken: idTokenAzure,
      })).data.token;
      session.user.token = newToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  }
}

function isTokenExpired(token: string | undefined): boolean {
  if (!token) return true;

  try {
    const decodedToken = jwtDecode(token);
    const expirationTime = dayjs.unix(decodedToken.exp!);
    return dayjs().isAfter(expirationTime);
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
}