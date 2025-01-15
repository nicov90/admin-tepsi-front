import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import NextTopLoader from 'nextjs-toploader';
import { Toaster } from "sonner";
import TokenProvider from "@/providers/token-provider";
import { Suspense } from "react";
import UsuariosRolesProvider from "@/providers/usuariosRoles-provider";

// const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Administración - Grupo Tepsi",
  description: "Admin App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <TokenProvider>
        <UsuariosRolesProvider>
          <html lang="es" suppressHydrationWarning>
            <body className={`${poppins.className} bg-white overflow-x-hidden`}>
              <ThemeProvider>
              {/* <ThemeProvider attribute="class" defaultTheme="dark" enableSystem> */}
                <Suspense>
                  <NextTopLoader color="rgb(0, 100, 200)" height={4}/>
                </Suspense>
                <Toaster />
                <main className="w-full mx-auto">
                  <div className="flex gap-x-7">
                      {/* <div className="w-64 shrink-0 hidden md:block">
                          <Sidebar />
                      </div> */}
                      <div className="w-full">
                          {children}
                      </div>
                  </div>
                </main>
              </ThemeProvider>
            </body>
          </html>
        </UsuariosRolesProvider>
      </TokenProvider>
    </AuthProvider>
  );
}
