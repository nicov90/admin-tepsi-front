'use client';

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Cookies from 'js-cookie';

interface Props {
  children: React.ReactNode;
}

export default function TokenProvider({ children, ...rest }: Props) {
  const { data: session } = useSession();

  useEffect(() => {
    if(session){
      console.log(session)
      //@ts-ignore
      const token = session?.user?.token;
      Cookies.set("token", token);
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