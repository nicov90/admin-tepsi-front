'use client';

import { useSession, signOut, signIn } from "next-auth/react";
import { LogIn, LogOut, PlusCircle, Store as StoreIcon } from "lucide-react";
import Image from "next/image";
import { SessionWithUser } from "@/interfaces/session";
import { useWindowSize } from "@/hooks/useWindowSize";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { startCase } from "lodash";

export const LogoutButton = () => {
    const { data: session, status } = useSession() as SessionWithUser;
    const { width } = useWindowSize();
    
    const avatarUrl = 'https://tailus.io/sources/blocks/grid-cards/preview/images/avatars/third_user.webp';
   
    if ( status === 'loading' ) {
        return (
        <button className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group">
            <span className="group-hover:text-gray-700">Cargando...</span>
        </button>
        )
    }

    if ( status === 'unauthenticated' ) {
        return (
        <button 
            onClick={() => signIn() }
            className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group">
            <span className="hidden sm:flex group-hover:text-gray-700">Ingresar</span>
            <LogIn className="sm:hidden mr-2 h-5 w-5" />
        </button>
        )
    }

    const handleSignOut = () => {
        signOut({ callbackUrl: window.location.origin });
    }
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
            <button 
                className="px-3 py-3 flex items-center space-x-4 rounded-md text-gray-600 group">
                { width > 768 && (
                    <Image
                        src={ avatarUrl }
                        width={ 50 }
                        height={ 50 }
                        alt="" 
                        className="w-6 h-6 m-auto rounded-full object-cover lg:w-10 lg:h-10" 
                    />
                )}
                <LogOut className="h-5 w-5" />
            </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mr-2">
                <DropdownMenuLabel className="px-4">{startCase(session?.user.nombre.toLowerCase())}</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200"/>
                <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-red-500 justify-center"
                >
                    Cerrar sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}