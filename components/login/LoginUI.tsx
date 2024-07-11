'use client'

import React, { useEffect } from 'react'
import { useState } from "react";
import { signIn, useSession } from "next-auth/react";

import { useForm } from "react-hook-form";
import { validations } from "@/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

type FormData = {
  email: string;
  password: string;
};

const LoginUI = ({enableCustomLogin}: {enableCustomLogin: boolean}) => {
  const { status } = useSession();
  const callbackUrl = useSearchParams().get('callbackUrl');

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [showError, setShowError] = useState(false);
  const [errorAzure, setErrorAzure] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onLoginUser = async ({ email, password }: FormData) => {
    setShowError(false);
    setIsLoading(true);
    const loginStatus = await signIn("credentials", {
      email,
      password,
      redirect: false,
    }); // manda los datos al authorize

    if (loginStatus?.ok) {
      router.push(callbackUrl ? callbackUrl : "/inicio");
    } else {
      setIsLoading(false);
      setShowError(true);

      setTimeout(() => {
        setShowError(false);
      }, 5000);
    }
  };

  const onLoginMicrosoft = async () => {
    setShowError(false);
    setIsLoading(true);
    try{
      await signIn("azure-ad");
    }catch(err){
      setErrorAzure(true);

      setTimeout(() => {
        setErrorAzure(false);
      }, 5000);
    }
  }

  //* por alguna razón el inicio de sesión con azure no redirecciona correctamente asi que uso esto
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/inicio");
    }
  }, [status]);

  return (
    <div className="flex justify-center items-center min-h-screen">   
        <form onSubmit={handleSubmit(onLoginUser)} autoComplete="off" noValidate>
          <div className='w-[350px] py-10 px-5 bg-white'>
            <section className="grid container px-8 gap-2">
              <div>
                <p className="text-2xl font-semibold">Iniciar sesión</p>
              </div>

              {enableCustomLogin && (
                <>
                  <div>
                    <Input
                      type="email"
                      placeholder="Correo"
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
                </>
              )}

              <div className='flex flex-col gap-1'>
                <Badge
                  color="error"
                  className="fadeIn mb-2"
                  style={{ display: showError ? "flex" : "none" }}
                >
                  No reconocemos ese usuario / contraseña
                </Badge>
                <Badge
                  color="error"
                  className="fadeIn mb-2"
                  style={{ display: errorAzure ? "flex" : "none" }}
                >
                  Error al iniciar con Microsoft
                </Badge>
                {enableCustomLogin && (
                  <Button
                    type="submit"
                    className='border-2'
                    variant="outline"
                    size="lg"
                  >
                    Ingresar
                  </Button>
                )}
                <Button
                  onClick={onLoginMicrosoft}
                  className="flex justify-center items-center gap-2 mt-1"
                  variant="default"
                  size="lg"
                  // startIcon={<Microsoft sx={{ mr: 1 }}/>}
                >
                  {/* <Microsoft sx={{ mr: 1 }}/> */}
                  <p className="font-semibold">Ingresar con Microsoft</p>
                </Button>
              </div>
              { isLoading && (
                <div>
                  <div className="flex justify-center">
                    <Loader2 className='animate-spin' style={{ animation: 'spin 1s linear infinite' }} size={24}/>
                  </div>
                </div>
              )}
            </section>
          </div>
        </form>           
      </div>
  )
}

export default LoginUI