"use client";

import { useWindowSize } from "@/hooks/useWindowSize";
import { SessionWithUser } from "@/interfaces/session";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import getRoutes from "../utils/navigation/routes";

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const { data: session } = useSession() as SessionWithUser;
    const rolesUsuarioActual = session?.user?.roles || [];
    const pathname = usePathname();
    const params = useParams();
    const { width } = useWindowSize();
    const routes = getRoutes(rolesUsuarioActual);

    if ( !params ){
        return ;
    }

    return (
        <>
            { width > 768 && (
                <div className="flex items-center px-4 py-1 border-l-2 border-[#707272]" >
                    <nav
                        className={ cn("flex items-center space-x-4 lg:space-x-6", className) }
                    >
                        { routes.map(( route ) => {
                            const active = pathname === route.href

                            return (
                                <Link 
                                    key={ route.href }
                                    href={ route.href }
                                    className={ cn( "text-sm font-medium transition-colors hover:text-primary",
                                    active ? "text-black dark:text-white" : "text-muted-foreground" )}
                                    style={{ display: route.hidden ? 'none' : 'block' }}
                                >
                                    { route.label }
                                </Link>
                            )})
                        }
                    </nav>
                </div>
            )}
        </>
    );
};

