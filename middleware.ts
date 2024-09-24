import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt';
import { JWTWithUser } from './interfaces/session';
import { RolesListaNombres } from './interfaces/roles';

export async function middleware(req: NextRequest) {
    const session: JWTWithUser | null = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const pathname = req.nextUrl.pathname;

    if (!session) {
        if(!pathname.startsWith('/auth/login') && !pathname.startsWith('/api/auth')){ // ruta que consulta nextauth - necesario
            const requestedPage = req.nextUrl.pathname;
            const url = req.nextUrl.clone();
            url.pathname = `/auth/login`;
            url.search = `callbackUrl=${requestedPage}`;
    
            return NextResponse.redirect(url);
        }
    }else{
        if(pathname.startsWith('/auth/login')){
            const url = req.nextUrl.clone();
            url.pathname = `/inicio`;
            return NextResponse.redirect(url);
        }

        if(pathname.startsWith('/inicio') || pathname.startsWith('/roles')){
            const validRolesPrefix = 'Admin';
            if(session.user && session.user.roles){
                const userRoles = session.user.roles as RolesListaNombres[];
                const hasValidRole = userRoles.some((role) => role.startsWith(validRolesPrefix));
            
                if ( !hasValidRole ) {
                    const url = req.nextUrl.clone();
                    url.pathname = `/denied`;
                    url.search = '';
                    return NextResponse.redirect(url);
                }
            }
        }

    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/auth/login',
        '/inicio',
        '/roles',
        '/api/:path*',
    ]
}