import { Metadata } from 'next';
import React from 'react'

export const metadata: Metadata = {
  title: "Iniciar sesión - Grupo Tepsi",
  description: "Rendiciones App",
};

const LoginLayout = ({ children }: { children: React.ReactNode}) => {
  return (
    <main className="w-full mx-aut bg-slate-50">
      <div className="flex gap-x-7">
          <div className="w-full">
              {children}
          </div>
      </div>
    </main>
  )
}

export default LoginLayout