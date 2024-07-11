import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
    const session:any = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const pathname = req.nextUrl.pathname;

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
        const validRoles = [ 'Admin' ];
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