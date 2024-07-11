import NextAuth from 'next-auth';
import { authOptions } from './auth';

declare module "next-auth" {
  interface Session {
    accessToken?: string;
  }
}

// type NextAuthOptionsCallback = (req: NextApiRequest, res: NextApiResponse) => NextAuthOptions



// const nextAuthOptions: NextAuthOptionsCallback = (req, res) => {
//   return {
// }}

// export default function handler (req: NextApiRequest, res: NextApiResponse) {
//     return NextAuth(req, res, nextAuthOptions(req, res))
// }

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
