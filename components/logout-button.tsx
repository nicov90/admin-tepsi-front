'use client';

import { useSession, signOut, signIn } from "next-auth/react";
import { LogIn, LogOut, PlusCircle, Store as StoreIcon } from "lucide-react";
import Image from "next/image";

export const LogoutButton = () => {

    const { data: session, status } = useSession();
    
    const avatarUrl = ( session?.user?.image )
    ? session.user.image
    : 'https://tailus.io/sources/blocks/grid-cards/preview/images/avatars/third_user.webp';
   

    if ( status === 'loading' ) {
        return (
        <button className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group">
            <PlusCircle className="mr-2 h-4 w-4" />
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

    
    return (
        <button 
            onClick={() => signOut() }
            className="px-4 py-3 flex items-center space-x-4 rounded-md text-gray-600 group">
            <Image
                src={ avatarUrl }
                width={ 50 }
                height={ 50 }
                alt="" 
                className="w-5 h-5 m-auto rounded-full object-cover lg:w-10 lg:h-10" 
            />
            <LogOut className="mr-2 h-5 w-5" />
        </button>
    )
}