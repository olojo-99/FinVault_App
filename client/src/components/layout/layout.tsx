import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { useUser } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "4rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={style}>
      <div className="flex min-h-screen w-full bg-grid-pattern bg-background/95">
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full overflow-hidden relative">
          {/* Subtle top blur effect */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-background to-transparent z-0 pointer-events-none" />
          
          <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4 md:px-6 bg-background/50 backdrop-blur-xl z-10 sticky top-0">
            <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                ME
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 z-10 w-full max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
