import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ClipboardList, Upload, Settings, PenTool, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const id = session?.user?.id ?? null;
      setUserId(id);
      if (!id) navigate('/auth', { replace: true, state: { from: '/admin' } });
    });
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user?.id ?? null;
      setUserId(id);
      if (!id) navigate('/auth', { replace: true, state: { from: '/admin' } });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    
    // Verificar se é o admin autorizado
    supabase.auth.getUser().then(({ data }) => {
      const userEmail = data.user?.email;
      const isAdminUser = userEmail === 'contato@mkart.com.br';
      setIsAdmin(isAdminUser);
      if (!isAdminUser) navigate('/painel', { replace: true });
    });
  }, [userId, navigate]);

  if (!userId || isAdmin === null) return null;

  const adminMenuItems = [
    { title: "Pedidos", url: "/admin", icon: ClipboardList },
    { title: "Gerenciar Sites", url: "/admin/sites", icon: Settings },
    { title: "Publicações", url: "/admin/publicacoes", icon: PenTool },
    { title: "Blog", url: "/admin/blog", icon: Upload },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="w-60" collapsible="offcanvas">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Painel Administrativo</SidebarGroupLabel>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end={item.url === '/admin'}
                        className={({ isActive }) => 
                          isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                        }
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <main className="container mx-auto px-4 py-10 space-y-8">
            <div className="flex items-center justify-between border-b pb-6">
              <div className="flex items-center gap-3">
                <a href="/" aria-label="Ir para a página inicial">
                  <img src="/lovable-uploads/cf1b72dd-c973-4cdf-a2f6-fd7ce7ed8d4d.png" alt="Logo MK Art SEO" className="h-8 w-auto" loading="lazy" />
                </a>
                <h1 className="text-3xl font-semibold">Admin</h1>
              </div>
              <Button variant="outline" onClick={() => supabase.auth.signOut()}>
                Sair
              </Button>
            </div>
            
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}