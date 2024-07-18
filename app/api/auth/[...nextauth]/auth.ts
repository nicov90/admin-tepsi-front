import { AuthOptions } from "next-auth";
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
import AzureAD, { AzureADProfile } from 'next-auth/providers/azure-ad';
import { capitalize } from 'lodash';
import { IUsuario } from '@/interfaces/usuarios';
import { getUsuarioByEmail, registerUsuario } from '@/database/dbUsuarios';
import { authApi } from "@/apiAxios/authApi";

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
          const callbackUrl = searchParams.get('callbackUrl');

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
      profile: (profile: AzureADProfile) => ({
        id: profile.oid,
        name: profile.name,
        email: profile.email
      }),
    }),
  ],

  callbacks: {
    async jwt({ token, account, user }) { // Devuelve el token al navegador
      // console.log('JWT Callback - Admin:', { token, account, user });
      if ( account ) {
        token.accessToken = account.access_token;

        token.user = user;
        // switch( account.type ) {
        //   case 'credentials': token.user = user;
        //     break;
        // }
      }
      return token;
    },
    async session({ session, token }: any){  // reemplaza los valores del token en la sesion
      // console.log('Session Callback - Admin:', { session, token });

      session.accessToken = token.accessToken as string;
      const { callbackUrl = '/', ...tokenUser } = token.user;
      token.user = tokenUser as any;
      token.callbackUrl = callbackUrl as string;
      session.user = tokenUser as any || token;
      session.callbackUrl = callbackUrl as string;

      if(session.user && !session?.user?.roles){
        const dbUser: IUsuario = await getUsuarioByEmail(session.user.email as string);
        session.user.roles = dbUser?.roles || [];
        session.user.tipoLogin = "Microsoft";

        const newToken = (await authApi().post(`/Auth/ValidarTokenAzure`, {
            azureToken: session.accessToken,
          })).data.token;

        session.user.token = newToken;
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) { // para colocar correctamente el callbackUrl en la url al cerrar sesión
      // console.log('Redirect Callback - Admin:', { url, baseUrl });
      if(url.startsWith("/")){
        return `${baseUrl}${url}`;
      }
      const fullUrl = new URL(url);
      const callbackUrl = fullUrl.searchParams.get('callbackUrl');

      if(callbackUrl) return callbackUrl;

      return url;
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