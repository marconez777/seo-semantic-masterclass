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
  SidebarHeader,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ClipboardList, Upload, Settings, PenTool, Users, FileText, MessageSquare, Gift, Globe } from "lucide-react";
import { NavLink } from "react-router-dom";
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown";
import { Separator } from "@/components/ui/separator";

export default function AdminLayout() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("Admin");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const id = session?.user?.id ?? null;
      setUserId(id);
      if (!id) navigate('/admin/login', { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user?.id ?? null;
      setUserId(id);
      if (!id) navigate('/admin/login', { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    supabase.from('profiles').select('full_name, avatar_url').eq('user_id', userId).maybeSingle().then(({ data }) => {
      if (data?.full_name) setUserName(data.full_name);
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
    });
  }, [userId]);

  if (!userId) return null;

  const adminMenuItems = [
    { title: "Pedidos", url: "/admin", icon: ClipboardList },
    { title: "Clientes", url: "/admin/clientes", icon: Users },
    { title: "Gerenciar Sites", url: "/admin/sites", icon: Settings },
    { title: "Publicações", url: "/admin/publicacoes", icon: PenTool },
    { title: "Blog", url: "/admin/blog", icon: Upload },
    { title: "Conteúdo SEO", url: "/admin/conteudo-seo", icon: FileText },
    { title: "Contatos", url: "/admin/contatos", icon: MessageSquare },
    { title: "Leads Backlinks", url: "/admin/leads", icon: Gift },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="w-60" collapsible="offcanvas">
          <SidebarHeader className="p-4">
            <a href="/" className="flex items-center gap-2">
              <img
                src="/lovable-uploads/cf1b72dd-c973-4cdf-a2f6-fd7ce7ed8d4d.png"
                alt="Logo MK Art SEO"
                className="h-8 w-auto"
                loading="lazy"
              />
              <span className="text-sm font-semibold text-sidebar-foreground">MK Art SEO</span>
            </a>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu</SidebarGroupLabel>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === '/admin'}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
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
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Links</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/" className="text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground">
                      <Globe className="mr-2 h-4 w-4" />
                      <span>Ir para o site</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-card/95 backdrop-blur px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-5" />
              <h1 className="text-lg font-semibold">Admin</h1>
            </div>
            <UserProfileDropdown
              name={userName}
              role="Administrador"
              avatarUrl={avatarUrl}
              onSignOut={() => supabase.auth.signOut()}
              showActions={false}
            />
          </header>

          <main className="p-6 bg-muted/20 min-h-[calc(100vh-3.5rem)]">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
