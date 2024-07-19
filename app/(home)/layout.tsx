import { Navbar } from "@/components/navigation/navbar-trello";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="pt-14 md:pt-14 px-4 w-full mx-auto overflow-x-hidden">
        <div className="flex gap-x-7">
            <div className="w-full">
                {children}
            </div>
        </div>
      </main>
    </>
  );
}
