import { AuthOptions } from "next-auth";
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import AzureAD, { AzureADProfile } from 'next-auth/providers/azure-ad';
import { capitalize } from 'lodash';
import { IUsuario } from '@/interfaces/usuarios';
import { getUsuarioByEmail, registerUsuario } from '@/database/dbUsuarios';
import { authApi } from "@/apiAxios/authApi";
import dayjs from "dayjs";
import { jwtDecode } from 'jwt-decode';
import { refreshAccessToken } from "@/utils/azureAD";

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
    async jwt({ token, account, user }: any) { // Devuelve el token al navegador
      // console.log('JWT Callback - Admin:', { token, account, user });

      if ( account ) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.accessTokenExpires = Date.now() + account.expires_at! * 1000;
        token.provider = account.provider;
        token.user = user;
      }

      // if (token.accessTokenExpires && token.accessTokenExpires < Date.now() ) {
      //   return refreshAccessToken(token);
      // }else{
      //   return token;
      // }

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

      const dbUser: IUsuario = await getUsuarioByEmail(session.user.email as string);
      dbUser?.id && (session.user.id = dbUser.id);
      session.user.roles = dbUser?.roles || [];
      session.user.existePersonal = dbUser?.existePersonal || false;

      if(session.provider === 'azure-ad'){
        session.user.tipoLogin = "Microsoft";

        let tokenExpired = false;
        if (session.user.token) {
          try {
              const decodedToken = jwtDecode(session.user.token);
              const expirationTime = dayjs.unix(decodedToken.exp!);
              tokenExpired = dayjs().isAfter(expirationTime);
          } catch (error) {
              console.error("Error decoding token:", error);
              tokenExpired = true;
          }
        }

        if (!session.user.token || tokenExpired) {
          try {
            const newToken = (await authApi().post(`/Auth/ValidarTokenAzure`, {
              azureToken: session.accessToken,
            })).data.token;
            session.user.token = newToken;
          } catch (error) {
            console.error("Error refreshing token:", error);
          }
        }

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
    async signIn({ user, account, profile }) {
      const userName = (user?.name || profile?.name)?.split(" ").map((word) => capitalize(word.toLowerCase())).join(" ")!;
      const userEmail = user?.email || profile?.email;

      if(account?.provider === 'azure-ad' && userEmail){
        try{
          const newToken = (await authApi(undefined, true).post(`/Auth/ValidarTokenAzure`, {
            azureToken: account?.access_token,
          })).data.token;
          
          // res.setHeader('Set-Cookie', `token=${newToken};path=/`);
          await registerUsuario({
            email: userEmail,
            nombre: userName,
            roles: [],
            tipoLogin: 'microsoft',
            password: '',
            cargadoPor: 'admin-tepsi',
          }, newToken);
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