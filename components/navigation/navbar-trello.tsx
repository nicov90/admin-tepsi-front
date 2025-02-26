import { MobileSidebar } from "./mobile-sidebar";
import { MainNav } from "@/components/main-nav";
import { LogoutButton } from "@/components/logout-button";
import Image from "next/image";
import Link from "next/link";
import AppsMenu from "./appsMenu";
import { SeparatorVertical } from "lucide-react";

export const Navbar = ({ denied = false }: { denied?: boolean }) => {
  const rutaLogo = "/tepsi-logo-black.png";

  return (
    <nav className="fixed inset-x-0 top-0 h-14 border-b shadow-sm flex items-center bg-white z-50 px-3 pr-1">
      <MobileSidebar />
      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-x-2">
          <AppsMenu className="hidden md:block" position="left"/>
          <Link className="hidden md:flex" href="https://intranet.grupotepsi.com/" passHref>
            <Image
              src={rutaLogo}
              alt="Tepsi"
              width={130}
              height={30}
              priority
              unoptimized // para poder servir desde public
            />
          </Link>
        </div>
        {!denied && (
          <MainNav className="top-0 w-[calc(100% - 240px)] mx-2.5" />
        )}
      </div>
      <div className="ml-auto flex items-center gap-x-1">
        <AppsMenu className="md:hidden" position="right"/>
        <SeparatorVertical className="w-1 h-4 md:hidden" />
        <LogoutButton />
      </div>
    </nav>
  );
};
