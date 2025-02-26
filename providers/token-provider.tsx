'use client';

import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import Cookies from 'js-cookie';
import { SessionWithUser } from "@/interfaces/session";
import { usePathname } from "next/navigation";
import { isTokenExpired } from "@/utils/token";

interface Props {
  children: React.ReactNode;
}

const domain = process.env.NODE_ENV === 'production' ? '.grupotepsi.com' : 'localhost';

export default function TokenProvider({ children }: Props) {
  const { data: session } = useSession() as SessionWithUser;
  const pathname = usePathname();

  useEffect(() => {
    if (session) {
      const token = session.user?.token;
      if (token && !isTokenExpired(token)) {
        Cookies.set("token", token, { domain: domain });
      }else{
        Cookies.remove("token", { domain: domain });
        signOut();
      }
    } else {
      Cookies.remove("token", { domain: domain });
    }
  }, [session, pathname]);

  return <>{children}</>;
}