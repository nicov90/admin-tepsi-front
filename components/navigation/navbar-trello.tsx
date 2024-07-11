// import { Logo } from "@/components/logo";

import { MobileSidebar } from "./mobile-sidebar";
import { MainNav } from "@/components/main-nav";
import { LogoutButton } from "@/components/logout-button";
import Image from "next/image";
import Link from "next/link";

export const Navbar = async({ denied = false }: { denied?: boolean }) => {

  return (
    <nav className="fixed z-50 top-0 px-4 w-full h-14 border-b shadow-sm flex items-center bg-white">
      <MobileSidebar />
      <div className="flex items-center gap-x-4">
        <Link className="hidden md:flex" href="https://intranet.grupotepsi.com/" passHref>
          <Image
            src="https://www.grupotepsi.com/wp-content/uploads/2022/06/Tepsi-Logo-1.png"
            alt="Tepsi"
            width={138}
            height={45}
            priority
            style={{ filter: "invert(1) brightness(0)" }}
          />
        </Link>
        {!denied && (
          <div className="flex items-center px-4" >
            <MainNav className="top-0 w-[calc(100% - 240px)] mx-2" />
          </div>
        )}
      </div>
      <div className="ml-auto flex items-center gap-x-1">
        <LogoutButton />
      </div>
    </nav>
  );
};
