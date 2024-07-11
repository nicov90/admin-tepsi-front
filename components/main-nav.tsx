"use client";

import { useWindowSize } from "@/hooks/useWindowSize";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useContext, useEffect } from "react";

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const params = useParams();
    const { width } = useWindowSize();

    if ( !params ){
        return ;
    }

    const routes = [
        {
            href: `/inicio`,
            label: 'Usuarios',
            active: pathname === `/inicio`,
        },
        {
            href: `/roles`,
            label: 'Roles',
            active: pathname === `/usuarios`,
        },
    ];

    return (
        <nav
            className={ cn("flex items-center space-x-4 lg:space-x-6", className) }
        >
            { width > 768 && routes.map(( route ) => (
                <Link 
                    key={ route.href }
                    href={ route.href }
                    className={ cn( "text-sm font-medium transition-colors hover:text-primary",
                    route.active ? "text-black dark:text-white" : "text-muted-foreground" )}
                >
                    { route.label }
                </Link>
            ))}
        </nav>
    );   
};

