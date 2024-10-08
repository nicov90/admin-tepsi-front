import { Navbar } from "@/components/navigation/navbar-trello";

export default function DeniedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar denied/>
      <main className="pt-14 md:pt-14 px-4 w-full mx-auto">
        <div className="flex gap-x-7">
            {/* <div className="w-64 shrink-0 hidden md:block">
                <Sidebar />
            </div> */}
            <div className="w-full">
                {children}
            </div>
        </div>
      </main>
    </>
  );
}
