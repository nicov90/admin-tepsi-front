'use client'

import React, { useEffect } from 'react'
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";

import { useForm } from "react-hook-form";
import { validations } from "@/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { redirect, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SessionWithUser } from '@/interfaces/session';
import Image from 'next/image';
import tepsiLogo from "@/public/tepsi-logo.webp";
import Microsoft from '@/public/microsoft-icon.svg';
import { toast } from 'sonner';

type FormData = {
  email: string;
  password: string;
};

const LoginUI = ({enableCustomLogin}: {enableCustomLogin: boolean}) => {
  const { status } = useSession() as SessionWithUser;
  const callbackUrl = useSearchParams().get('callbackUrl');

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [customLoginFormVisible, setCustomLoginFormVisible] = useState(false);

  const handleLogin = async (data?: FormData, method?: "custom" | "microsoft") => {
    console.log(data, method);
    setShowError(false);
    setIsLoading(true);

    switch (method) {
      case "custom":
        if(data){
          const loginStatus = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
          });
    
          if (loginStatus?.ok) {
            router.push(callbackUrl ? callbackUrl : "/inicio");
          } else {
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
          }
          setIsLoading(false);
        }
        break;
      case "microsoft":
        try {
          await signIn("azure-ad");
        } catch (err) {
          console.log(err);
          toast.error("Error al iniciar sesión con Microsoft", { style: { backgroundColor: "red", color: "white" } });
        }
        break;
      default:
        break;
    }
  };

  //* por alguna razón el inicio de sesión con azure no redirecciona correctamente asi que uso esto
  useEffect(() => {
    if (status === "authenticated") {
      router.push(callbackUrl ? callbackUrl : "/inicio");
    }
  }, [status]);

  return (
    <div className="flex justify-center items-center min-h-screen">   
        <form className='w-full max-w-[320px]' onSubmit={handleSubmit(data => handleLogin(data, "custom"))} autoComplete="off" noValidate>
          <div className='pb-6 rounded-none shadow-lg bg-white overflow-hidden'>
            <h1 className="bg-sky-950 py-2 rounded-md text-white mb-6 text-center text-base font-bold">Iniciar sesión</h1>
            {/* <div className="my-2 h-[2px] rounded-full bg-sky-800"></div> */}
            <section className={`${!customLoginFormVisible ? "bg-stone-50" : ""} mb-4 px-10 /*mb-6*/ grid container gap-4 p-0`}>
              {!customLoginFormVisible ? (
                <Button
                    onClick={() => handleLogin(undefined, "microsoft")}
                    className="my-2 bg-sky-800 hover:bg-sky-900 flex justify-center items-center gap-2"
                    size="lg"
                >
                  <Image src={Microsoft} className='' alt="microsoft" width={24} height={24} />
                  <p className="font-semibold">Ingresar con Microsoft</p>
                </Button>
              ) : (
                <>
                  {enableCustomLogin && (
                    <div className='flex flex-col gap-2'>
                      <div>
                        <Input
                          type="email"
                          placeholder="Email"
                          {...register("email", {
                            required: "Este campo es requerido",
                            validate: validations.isEmail,
                          })}
                        />
                      </div>
                      <div className='mb-2'>
                        <Input
                          type="password"
                          placeholder="Contraseña"
                          {...register("password", {
                            required: "Este campo es requerido",
                            minLength: {
                              value: 6,
                              message: "Mínimo 6 caracteres",
                            },
                          })}
                        />
                      </div>
                      <div className='flex flex-col gap-1'>
                        <Badge
                          variant='destructive'
                          className="fadeIn mb-2 py-1 text-center"
                          style={{ display: showError ? "flex" : "none" }}
                        >
                          Usuario o contraseña incorrectos
                        </Badge>
                        <Button
                          type="submit"
                          className='border-2 bg-white hover:bg-gray-50'
                          variant="outline"
                          size="lg"
                        >
                          Ingresar
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              { isLoading && (
                <div>
                  <div className="flex justify-center">
                    <Loader2 className='animate-spin' style={{ animation: 'spin 1.5s linear infinite' }} size={24}/>
                  </div>
                </div>
              )}
            </section>
            <p onClick={() => setCustomLoginFormVisible(!customLoginFormVisible)} className="mt-2 text-center text-xs cursor-pointer text-gray-600 underline text-nowrap">
              {!customLoginFormVisible ? "Ingresar con email y contraseña" : "Ingresar con Microsoft"}
            </p>
          </div>
        </form>    
      </div>
  )
}

export default LoginUI