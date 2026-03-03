import { Link, useLocation } from "wouter";
import { 
  Home, 
  ArrowRightLeft, 
  PieChart, 
  Target, 
  LogOut, 
  CreditCard,
  BarChart3,
  Vault
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Transactions", url: "/transactions", icon: ArrowRightLeft },
  { title: "Transfers", url: "/transfers", icon: CreditCard },
  { title: "Budgets", url: "/budgets", icon: PieChart },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Savings Goals", url: "/savings", icon: Target },
];

export function AppSidebar() {
  const [location] = useLocation();
  const logout = useLogout();

  return (
    <Sidebar variant="inset" className="border-r border-border/50">
      <SidebarHeader className="p-4 pt-6">
        <div className="flex items-center gap-2 px-2 text-primary font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-gradient-premium flex items-center justify-center shadow-md">
            <Vault className="w-5 h-5 text-white" />
          </div>
          FinVault
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                      className={isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"}
                    >
                      <Link href={item.url} className="flex items-center gap-3 px-3 py-2 transition-colors">
                        <item.icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
