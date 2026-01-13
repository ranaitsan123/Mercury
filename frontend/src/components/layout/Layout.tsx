import Header from "./Header";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex flex-col">
        <Header />
        <main className="flex-1 items-start gap-4 p-4 sm:px-6 sm:py-4 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}