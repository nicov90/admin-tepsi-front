// import { Logo } from "@/components/logo";

import { MobileSidebar } from "./mobile-sidebar";
import { MainNav } from "@/components/main-nav";
import { LogoutButton } from "@/components/logout-button";
import Image from "next/image";
import Link from "next/link";
import AppsMenu from "./appsMenu";
import tepsiLogo from "@/public/tepsi-logo.webp";

export const Navbar = async({ denied = false }: { denied?: boolean }) => {

  return (
    <nav className="fixed inset-x-0 top-0 h-14 border-b shadow-sm flex items-center bg-white z-50 px-3 pr-1">
      <MobileSidebar />
      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-x-2">
          <AppsMenu />
          <Link className="hidden md:flex" href="https://intranet.grupotepsi.com/" passHref>
            <Image
              src={tepsiLogo}
              alt="Tepsi"
              width={130}
              priority
              style={{ filter: "invert(1) brightness(0)" }}
            />
          </Link>
        </div>
        {!denied && (
          <div className="flex items-center px-4 py-1 border-l-2 border-[#707272]" >
            <MainNav className="top-0 w-[calc(100% - 240px)] mx-2.5" />
          </div>
        )}
      </div>
      <div className="ml-auto flex items-center gap-x-1">
        <LogoutButton />
      </div>
    </nav>
  );
};
