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
      async authorize(credentials):Promise<any> {
        try {
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
            token
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
      if ( account ) {
        token.accessToken = account.access_token;

        switch( account.type ) {
          case 'credentials': token.user = user;
            break;
        }
      }
      return token;
    },
    async session({ session, token }){  // reemplaza los valores del token en la sesion
      session.accessToken = token.accessToken as string;
      session.user = token.user as any || token;

      // @ts-ignore
      if(session.user && !session?.user?.roles){
        const dbUser: IUsuario = await getUsuarioByEmail(session.user.email as string);
        // @ts-ignore
        session.user.roles = dbUser?.roles || ['Usuario'];
        // @ts-ignore
        // session.user.activo = dbUser?.activo || true;
        // @ts-ignore
        session.user.tipoLogin = "Microsoft";

        const newToken = (await authApi().post(`/Auth/ValidarTokenAzure`, {
            azureToken: session.accessToken,
          })).data.token;
        // @ts-ignore
        session.user.token = newToken;
      }

      // if(session.user){
      //   // // @ts-ignore
      //   const newToken = await externalApiConToken().post(`/Auth/Revalidar/${session.user.token}`).then(res => res.data.token).catch(err => {
      //     console.log(err);
      //     // @ts-ignore
      //     return session.user.token;
      //   });
      //   // @ts-ignore
      //   session.user.token = newToken;
      //   res.setHeader('Set-Cookie', `token=${newToken};path=/`)
      // }
      
      return session;
    }
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
          const newToken = (await authApi().post(`/Auth/ValidarTokenAzure`, {
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
}