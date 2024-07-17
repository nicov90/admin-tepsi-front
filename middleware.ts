import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt';
import { getCookie, getCookies, setCookie } from 'cookies-next';
import { JWTWithUser } from './interfaces/session';
import { RolesListaNombres } from './interfaces/roles';

export async function middleware(req: NextRequest) {
    const session: JWTWithUser | null = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const pathname = req.nextUrl.pathname;

    // const callBackUrl = getCookie('next-auth.callback-url');
    // console.log(callBackUrl)
    // if (session?.callbackUrl) {
    //     const callbackUrl = session.callbackUrl ? session.callbackUrl : '/';
    
    //     // Eliminar callbackUrl de la sesión
    //     session.callbackUrl = undefined;
    //     // Actualizar la cookie de sesión
    //     const response = NextResponse.redirect(callbackUrl);
    //     // Establecer la cookie de sesión actualizada en la respuesta
    //     const updatedSessionToken = JSON.stringify(session);
    //     // console.log("updatedSessionToken", updatedSessionToken)
    //     response.cookies.set('next-auth.session-token', updatedSessionToken, { maxAge: 60 * 60 * 24 });
    //     // // Redirigir al callbackUrl
    //     return NextResponse.redirect(callbackUrl);
    //   }

    if (!session) {
        if(!pathname.startsWith('/api/auth')){ // ruta que consulta nextauth - necesario
            const requestedPage = req.nextUrl.pathname;
            const url = req.nextUrl.clone();
            url.pathname = `/auth/login`;
            url.search = `callbackUrl=${requestedPage}`;
    
            return NextResponse.redirect(url);
        }
    }else{

        if(pathname.startsWith('/inicio') || pathname.startsWith('/roles')){
            const validRoles: RolesListaNombres[] = [ 'Admin - GENERAL' ];
            const userRoles = (session?.user?.roles  || session?.roles || []) as RolesListaNombres[];
            const hasValidRole = userRoles.some((role) => validRoles.includes(role));
        
            if ( !hasValidRole ) {
                const url = req.nextUrl.clone();
                url.pathname = `/denied`;
                url.search = '';
                return NextResponse.redirect(url);
            }
        }

    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/inicio',
        '/roles',
        '/api/:path*',
    ]
}