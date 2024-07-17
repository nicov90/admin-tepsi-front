'use client';

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Cookies from 'js-cookie';
import { SessionWithUser } from "@/interfaces/session";

interface Props {
  children: React.ReactNode;
}

const domain = process.env.NODE_ENV === 'production' ? '.grupotepsi.com' : 'localhost';

export default function TokenProvider({ children, ...rest }: Props) {
  const { data: session } = useSession() as SessionWithUser;

  useEffect(() => {
    if(session){
      const token = session?.user?.token;
      Cookies.set("token", token, { domain: domain });
    }else{
      Cookies.remove("token");
    }
  }, [session]);

  return (
    <>
      { children }
    </>
  );
}