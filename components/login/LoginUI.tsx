'use client'

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SessionWithUser } from '@/interfaces/session';
import Microsoft from '@/public/microsoft-icon.svg';
import { validations } from "@/utils";
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from "react-hook-form";
import { BeatLoader } from 'react-spinners';
import { toast } from 'sonner';

type FormData = {
  email: string;
  password: string;
};

const LoginUI = ({enableCustomLogin}: {enableCustomLogin: boolean}) => {
  const { status } = useSession() as SessionWithUser;
  const searchParams = useSearchParams();
  // const pathname = usePathname();
  const callbackUrl = searchParams.get('callbackUrl');
  const errorParam = searchParams.get('error');

  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const [showError, setShowError] = useState(false);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const isLoading = isLoadingForm || status === 'loading';
  const [customLoginFormVisible, setCustomLoginFormVisible] = useState(false);

  const handleLogin = async (data?: FormData, method?: "custom" | "microsoft") => {
    setShowError(false);
    setIsLoadingForm(true);

    switch (method) {
      case "custom":
        if(data){
          const loginStatus = await signIn("credentials", {
            email: data.email,
            password: data.password,
            redirect: false,
          });
    
          if(!loginStatus?.ok){
            setShowError(true);
            setTimeout(() => setShowError(false), 5000);
          }else{
            router.push(callbackUrl ? callbackUrl : "/inicio");
          }
          setIsLoadingForm(false);
        }
        break;
      case "microsoft":
        try {
          await signIn("azure-ad", { callbackUrl: callbackUrl ? callbackUrl : "/inicio" });
        } catch (err) {
          console.log(err);
          toast.error("Error al iniciar sesión con Microsoft", { style: { backgroundColor: "red", color: "white" } });
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">   
        <form className='w-full max-w-[320px]' onSubmit={handleSubmit(data => handleLogin(data, "custom"))} autoComplete="off" noValidate>
          <div className='pb-6 rounded-none shadow-lg bg-white overflow-hidden'>
            <h1 className="bg-sky-950 py-2 rounded-md text-white mb-6 text-center text-base font-bold">Iniciar sesión</h1>
            {isLoading ? (
              <div className='flex justify-center items-center py-4'>
                <BeatLoader color="black" size={8} speedMultiplier={0.5}/>
              </div>
            ) : (
              <>
                <section className={`${!customLoginFormVisible ? "bg-stone-50" : ""} mb-4 px-10 /*mb-6*/ grid container gap-4 p-0`}>
                  {!customLoginFormVisible ? (
                    <div className='flex flex-col gap-2'>
                      <Button
                          onClick={() => handleLogin(undefined, "microsoft")}
                          className="my-2 bg-sky-800 hover:bg-sky-900 flex justify-center items-center gap-2"
                          size="lg"
                      >
                        <Image src={Microsoft} className='' alt="microsoft" width={24} height={24} />
                        <p className="font-semibold">Ingresar con Microsoft</p>
                      </Button>
                      {errorParam && <Badge variant="destructive" className='flex justify-center'>Ocurrió un error</Badge>}
                    </div>
                  ) : (
                    <>
                      {enableCustomLogin && (
                        <div className='flex flex-col gap-2'>
                          <div>
                            <Input
                              type="email"
                              placeholder="Email"
                              className={`${
                                errors.email ? "border-red-500" : ""
                              }`}
                              {...register("email", {
                                required: "Este campo es requerido",
                                validate: validations.isEmail,
                              })}
                            />
                            {errors.email && (
                              <div className='pt-2 text-center'>
                                <p className="text-xs text-red-500">{errors.email.message}</p>
                              </div>
                            )}
                          </div>
                          <div className='mb-2'>
                            <Input
                              type="password"
                              placeholder="Contraseña"
                              className={`${
                                errors.password ? "border-red-500" : ""
                              }`}
                              {...register("password", {
                                required: "Este campo es requerido",
                                minLength: {
                                  value: 6,
                                  message: "Mínimo 6 caracteres",
                                },
                              })}
                            />
                            {errors.password && (
                              <div className='pt-2 text-center'>
                                  <p className="text-xs text-red-500">{errors.password.message}</p>
                              </div>
                            )}
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
                </section>
                <p onClick={() => setCustomLoginFormVisible(!customLoginFormVisible)} className="mt-2 text-center text-xs cursor-pointer text-gray-600 underline text-nowrap">
                  {!customLoginFormVisible ? "Ingresar con email y contraseña" : "Ingresar con Microsoft"}
                </p>
              </>
            )}
          </div>
        </form>    
      </div>
  )
}

export default LoginUI