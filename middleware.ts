import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt';
import { getCookie, getCookies, setCookie } from 'cookies-next';

export async function middleware(req: NextRequest) {
    const session:any = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
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
    }

    if(pathname.startsWith('/inicio') || pathname.startsWith('/roles')){
        const validRoles = [ 'Admin - GENERAL' ];
        const userRoles: string[] = session?.user?.roles  || session?.roles || [];
        const hasValidRole = userRoles.some((role: string) => validRoles.includes(role));
    
        if ( !hasValidRole ) {
            const url = req.nextUrl.clone();
            url.pathname = `/denied`;
            url.search = '';
            return NextResponse.redirect(url);
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