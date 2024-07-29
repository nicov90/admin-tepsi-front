"use client";

import Link from "next/link";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { usePathname } from "next/navigation";
import getRoutes from "../../utils/navigation/routes";

interface SidebarProps {
  storageKey?: string;
};

export const Sidebar = ({
  storageKey = "t-sidebar-state",
}: SidebarProps) => {
  const pathname = usePathname();
  const routes = getRoutes();

  return (
    <div className="px-5">
      <h1 className="text-lg font-bold mb-5">Menu</h1>
      <Accordion
        type="single"
        className="space-y-2 px-1 text-[15px]"
      >
        {routes.map((route) => {
          const active = pathname === route.href;

          return (
            <AccordionItem
              key={route.href}
              value={route.href}
              className={`py-2 ${active ? "border-b-black font-medium" : "border-b-gray-300"}`}
              style={{ color: active ? "black" : "rgb(0,0,0,0.85)", display: route.hidden ? 'none' : 'block' }}
            >
              <Link href={route.href}>{route.label}</Link>
            </AccordionItem>
          )}
        )}
      </Accordion>
    </div>
  );
};
