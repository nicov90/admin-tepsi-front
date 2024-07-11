"use client";

import Link from "next/link";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

interface SidebarProps {
  storageKey?: string;
};

export const Sidebar = ({
  storageKey = "t-sidebar-state",
}: SidebarProps) => {
  const { data: session } = useSession();
  const pathname = usePathname();

  const routes = [
    {
        href: `/inicio`,
        label: 'Inicio',
        active: pathname === `/inicio`,
    },
    {
        href: `/roles`,
        label: 'Roles',
        active: pathname === `/roles`,
    },
];

  return (
    <div className="px-5">
      <h1 className="text-lg font-bold mb-5">Menu</h1>
      <Accordion
        type="single"
        className="space-y-2 px-1 text-[15px]"
      >
        {routes.map((route) => (
          <AccordionItem
            key={route.href}
            value={route.href}
            className={`py-2 ${route.active ? "border-b-black font-medium" : "border-b-gray-300"}`}
            style={{ color: route.active ? "black" : "rgb(0,0,0,0.85)" }}
          >
            <Link href={route.href}>{route.label}</Link>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
