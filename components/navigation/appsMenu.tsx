"use client"
import React from 'react'
import { ClipboardList, GripIcon, UserRoundCog, Wallet } from 'lucide-react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { useSession } from 'next-auth/react'
import { SessionWithUser } from '@/interfaces/session'

const apps = [
  {
    name: "Rendiciones",
    link: "https://rendiciones.grupotepsi.com",
    description: "Sistema de rendiciones",
    imageComponent: () => <Wallet className="w-6 h-6" />
  },
  {
    name: "Novedades",
    link: "https://partenovedades.grupotepsi.com",
    description: "Sistema de parte de novedades",
    imageComponent: () => <ClipboardList className="w-6 h-6" />
  },
  {
    name: "Usuarios",
    link: "https://admin.grupotepsi.com",
    description: "Sistema de administración de usuarios y roles",
    imageComponent: () => <UserRoundCog className="w-6 h-6" />
  },
]
const AppsMenu = () => {
  const { data: session } = useSession() as SessionWithUser;

   // código para filtrar las apps a mostrar si el usuario no tiene ningun rol de esa app.
   const userHasRoleForApp = (appName: string) => {
    if (!session?.user?.roles) return false;

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
  const filteredApps = apps.filter(app => userHasRoleForApp(app.name));

  return (
    <Menu as="div" className="relative inline-block text-left z-50">
      <div>
        <MenuButton className="inline-flex justify-center w-full p-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 border border-transparent rounded-md">
          <GripIcon className="w-6 h-6" />
        </MenuButton>
      </div>

      <Transition
        as="div"
        enter="transition transform ease-out duration-150"
        enterFrom="transform scale-75 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition transform ease-in duration-100"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-75 opacity-0"
      >
        <MenuItems 
          className="absolute left-0 w-[400px] mt-2 px-3 py-2 origin-top-left bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 shadow-lg ring-1
         ring-black ring-opacity-5 focus:outline-none"
        >
        <div className="grid grid-cols-3">
          {filteredApps.map((app) => (
            <MenuItem key={app.name}>
              {({ focus }) => (
                <div className='relative flex flex-col items-center w-full'>
                  <TooltipProvider>
                    <Tooltip delayDuration={800}>
                      <TooltipTrigger className='w-full'>
                        <a
                          href={app.link}
                          className={`${
                            focus ? 'bg-gray-100' : ''
                          } flex flex-col items-center justify-center py-2 text-sm text-gray-700 gap-1.5 text-center border border-transparent rounded-xl`}
                        >
                          <div className='flex flex-col items-center justify-start py-2 text-sm text-gray-700 gap-1.5 text-center'>
                            <div className="flex-shrink-0">{<app.imageComponent />}</div>
                            <div>{app.name}</div>
                          </div>
                        </a>
                      </TooltipTrigger>
                      <TooltipContent 
                          side='bottom'
                          className="w-40 bg-gray-800 text-white p-2 rounded-md shadow-lg text-xs text-pretty text-center"
                        >
                        <p>{app.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
      </Transition>
    </Menu>
  )
}

export default AppsMenu