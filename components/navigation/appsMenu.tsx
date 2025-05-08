"use client"
import { authApi } from '@/apiAxios/authApi';
import { SessionWithUser } from '@/interfaces/session';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import clsx from 'clsx';
import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import useSwr from 'swr';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface IApp {
  Name: string;
  Link: string;
  Description: string;
  IconName: string;
  ImageUrl: string | null;
  AlwaysVisible: boolean | null;
}

const getLucideIcon = (IconName: string): React.FC<LucideProps> => {
  if (!Icons[IconName as keyof typeof Icons]) {
    console.log(`Icono "${IconName}" no encontrado en lucide-react`);
    return Icons.HelpCircle; // Fallback to a default icon if not found
  }
  return Icons[IconName as keyof typeof Icons] as React.FC<LucideProps>;
};

const GripIcon = getLucideIcon('Grip');

const fetcher = async (url: string) => {
  const response = await authApi().get(url);
  return response.data.response;
}

type Props = {
  className?: string
  position?: 'left' | 'right'
}
const AppsMenu = ({ className, position = 'left' }: Props) => {
  const { data: session } = useSession() as SessionWithUser;
  const currentHost = typeof window !== "undefined" ? window.location.hostname : "";

  const { data: apps = [] } = useSwr<IApp[]>('/apps', fetcher);

   // código para filtrar las apps a mostrar si el usuario no tiene ningun rol de esa app.
  const userHasRoleForApp = (app: IApp) => {
    if(app.AlwaysVisible === true) return true; // ignora roles

    if (!session?.user?.roles) return false;
    const appName = app.Name;

    if(appName === 'Usuarios'){
      return session.user.roles.some(role => {
        const [roleName,] = role.split(' - ').map(str => str.trim());
        return roleName.toUpperCase() === "ADMIN";
      });
    }

    return session.user.roles.some(role => {
      const [, roleAppName] = role.split(' - ').map(str => str.trim());
      return roleAppName == appName.toUpperCase();
    });
  };

  const sortAppsByCurrentHost = (a: IApp, b: IApp) => {
    const aIsCurrent = new URL(a.Link).hostname === currentHost;
    const bIsCurrent = new URL(b.Link).hostname === currentHost;

    // Si a es actual y b no, a va primero (-1)
    if (aIsCurrent && !bIsCurrent) return -1;
    if (!aIsCurrent && bIsCurrent) return 1;

    // Si ninguno o ambos son actuales, mantener orden alfabético
    return a.Name.localeCompare(b.Name);
  };

  const filteredApps = apps.filter(userHasRoleForApp).sort(sortAppsByCurrentHost);
  
  return (
    <Menu as="div" className="relative inline-block text-left z-50">
      {({ open }) => (
        <>
          <div>
            <MenuButton className={`inline-flex justify-center w-full p-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 ${open ? 'bg-gray-200' : ''} border border-transparent rounded-md ${className}`}>
              <GripIcon className="w-6 h-6" />
            </MenuButton>
          </div>

          <Transition
            show={open}
            as="div"
            enter="transition transform ease-out duration-150"
            enterFrom="transform scale-75 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition transform ease-in duration-100"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-75 opacity-0"
          >
            <MenuItems 
              className={`absolute ${position === 'left' && `-left-2`} ${position === 'right' && `-right-[58px]`} w-svw max-w-[400px] mt-2 px-3 py-2 bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-lg ring-1
            ring-black ring-opacity-5 focus:outline-none`}
              static
            >
              {filteredApps.length === 0 ? (
                <div className='flex items-center justify-center w-full h-16 text-xs text-gray-500'>
                  <p className='text-center'>No tienes acceso a ninguna aplicación</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {filteredApps.map((app) => {
                    const isCurrent = new URL(app.Link).hostname === currentHost;
                    const LucideIcon = getLucideIcon(app.IconName);
                    
                    return (
                      <MenuItem key={app.Name}>
                        {({ focus }) => (
                          <div className='relative flex flex-col items-center w-full'>
                            <TooltipProvider>
                              <Tooltip delayDuration={800}>
                                <TooltipTrigger className='w-full'>
                                  <a
                                    href={isCurrent ? '#' : app.Link}
                                    className={clsx(
                                      'flex flex-col items-center justify-center py-2 text-sm text-center border rounded-xl gap-1.5',
                                      isCurrent
                                        ? 'bg-stone-100 text-black font-bold cursor-default '
                                        : focus
                                        ? 'bg-stone-100 text-gray-700 border-transparent'
                                        : 'text-gray-700 border-transparent hover:bg-stone-50'
                                    )}
                                    // className={`${
                                    //   focus ? 'bg-gray-100' : ''
                                    // } flex flex-col items-center justify-center py-2 text-sm text-gray-700 gap-1.5 text-center border border-transparent rounded-xl`}
                                  >
                                    <div className='flex flex-col items-center justify-start py-2 text-sm text-gray-700 gap-1.5 text-center'>
                                      {app.ImageUrl ? (
                                        <Image
                                          src={app.ImageUrl}
                                          alt={app.Name}
                                          unoptimized
                                          width={24}
                                          height={24}
                                          priority
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      ) : (
                                        <div className="flex-shrink-0">
                                          { <LucideIcon className="w-6 h-6" /> }
                                        </div>
                                      )}
                                      <div>{app.Name}</div>
                                    </div>
                                  </a>
                                </TooltipTrigger>
                                <TooltipContent 
                                    side='bottom'
                                    className="w-40 bg-gray-800 text-white p-2 rounded-md shadow-lg text-xs text-pretty text-center"
                                  >
                                  <p>{app.Description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        )}
                      </MenuItem>
                  )})}
                </div>
              )}
            </MenuItems>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default AppsMenu