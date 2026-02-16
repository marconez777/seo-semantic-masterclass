import { useEffect, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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
import { Heart, UserCircle, Shield, Package, ShoppingBag, Globe, Search, BarChart3, FileText, Link2, PenTool, ClipboardList } from "lucide-react";
import { OrdersList } from "@/components/dashboard/OrdersList";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown";
import { Separator } from "@/components/ui/separator";
import { FavoritesTable } from "@/components/dashboard/FavoritesTable";
import { KeywordTracker } from "@/components/dashboard/KeywordTracker";
import { ConsultingKeywords } from "@/components/consulting/ConsultingKeywords";
import { ConsultingPages } from "@/components/consulting/ConsultingPages";
import { ConsultingBacklinks } from "@/components/consulting/ConsultingBacklinks";
import { ConsultingBlogPosts } from "@/components/consulting/ConsultingBlogPosts";
import { ConsultingTaskBoard } from "@/components/consulting/ConsultingTaskBoard";

type TabType = "pedidos" | "favoritos" | "keywords" | "perfil" | "palavras" | "paginas" | "backlinks" | "blog" | "tarefas";

const TAB_LABELS: Record<TabType, string> = {
  pedidos: "Meus Pedidos",
  favoritos: "Favoritos",
  keywords: "Rastreio de Palavras",
  perfil: "Perfil",
  palavras: "Palavras-Chave",
  paginas: "Páginas",
  backlinks: "Backlinks",
  blog: "Blog",
  tarefas: "Tarefas",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabType>("pedidos");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("Usuário");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [consultingClientId, setConsultingClientId] = useState<string | null>(null);
  const [isConsultingClient, setIsConsultingClient] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const id = session?.user?.id ?? null;
      setUserId(id);
      if (!id) navigate('/auth', { replace: true, state: { from: '/painel' } });
    });
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user?.id ?? null;
      setUserId(id);
      if (!id) navigate('/auth', { replace: true, state: { from: '/painel' } });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;

    const init = async () => {
      // Load profile
      const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url, is_admin').eq('user_id', userId).maybeSingle();
      if (profile?.full_name) setUserName(profile.full_name);
      if (profile?.avatar_url) setAvatarUrl(profile.avatar_url);

      // Check consulting client
      const { data: consulting } = await supabase.from('consulting_clients').select('id, name').eq('user_id', userId).eq('status', 'ativo').maybeSingle();
      if (consulting) {
        setConsultingClientId(consulting.id);
        setIsConsultingClient(true);
        setTab("palavras");
      }

      // Check admin role
      const { data: roleData } = await supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').maybeSingle();
      if (roleData) {
        setIsAdmin(true);
      } else if (profile?.is_admin) {
        setIsAdmin(true);
      }

      setLoading(false);
    };

    init();
  }, [userId]);

  if (!userId || loading) return null;

  return (
    <>
      <SEOHead
        title="Painel | MK Art SEO"
        description="Veja seus favoritos e perfil."
        canonicalUrl="https://mkart.com.br/painel"
        keywords="dashboard, favoritos"
        noindex={true}
      />

      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar collapsible="offcanvas" className="w-60">
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
              {isConsultingClient ? (
                <ConsultingSidebar tab={tab} setTab={setTab} />
              ) : (
                <StoreSidebar tab={tab} setTab={setTab} />
              )}
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>Links</SidebarGroupLabel>
                <SidebarMenu>
                  {isAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="/admin" className="text-sidebar-foreground hover:bg-sidebar-accent/50">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/comprar-backlinks" className="text-sidebar-foreground hover:bg-sidebar-accent/50">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span>Loja de Backlinks</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/" className="text-sidebar-foreground hover:bg-sidebar-accent/50">
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
                <h1 className="text-lg font-semibold">{TAB_LABELS[tab]}</h1>
              </div>
              <UserProfileDropdown
                name={userName}
                role={isConsultingClient ? "Consultoria" : "Cliente"}
                avatarUrl={avatarUrl}
                onSignOut={() => supabase.auth.signOut()}
                showActions={false}
              />
            </header>

            <main className="p-6 bg-muted/20 min-h-[calc(100vh-3.5rem)]">
              {/* Store tabs */}
              {tab === 'pedidos' && <OrdersList userId={userId} />}
              {tab === 'favoritos' && <FavoritesTable userId={userId} />}
              {tab === 'keywords' && <KeywordTracker userId={userId} />}
              {/* Consulting tabs */}
              {tab === 'palavras' && consultingClientId && <ConsultingKeywords clientId={consultingClientId} readOnly={true} />}
              {tab === 'paginas' && consultingClientId && <ConsultingPages clientId={consultingClientId} readOnly={true} />}
              {tab === 'backlinks' && consultingClientId && <ConsultingBacklinks clientId={consultingClientId} readOnly={true} />}
              {tab === 'blog' && consultingClientId && <ConsultingBlogPosts clientId={consultingClientId} readOnly={true} />}
              {tab === 'tarefas' && consultingClientId && <ConsultingTaskBoard clientId={consultingClientId} readOnly={true} />}
              {/* Shared */}
              {tab === 'perfil' && <ProfileSection />}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}

function SidebarItem({ tab, current, setTab, icon: Icon, label }: { tab: TabType; current: TabType; setTab: (t: TabType) => void; icon: React.ElementType; label: string }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={current === tab}
        onClick={() => setTab(tab)}
        className={current === tab ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}
      >
        <Icon className="mr-2 h-4 w-4" />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function StoreSidebar({ tab, setTab }: { tab: TabType; setTab: (t: TabType) => void }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Minha Conta</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarItem tab="pedidos" current={tab} setTab={setTab} icon={Package} label="Meus Pedidos" />
        <SidebarItem tab="favoritos" current={tab} setTab={setTab} icon={Heart} label="Favoritos" />
        <SidebarItem tab="keywords" current={tab} setTab={setTab} icon={Search} label="Rastreio de Palavras" />
        <SidebarItem tab="perfil" current={tab} setTab={setTab} icon={UserCircle} label="Perfil" />
      </SidebarMenu>
    </SidebarGroup>
  );
}

function ConsultingSidebar({ tab, setTab }: { tab: TabType; setTab: (t: TabType) => void }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Consultoria SEO</SidebarGroupLabel>
      <SidebarMenu>
        <SidebarItem tab="palavras" current={tab} setTab={setTab} icon={BarChart3} label="Palavras-Chave" />
        <SidebarItem tab="paginas" current={tab} setTab={setTab} icon={FileText} label="Páginas" />
        <SidebarItem tab="backlinks" current={tab} setTab={setTab} icon={Link2} label="Backlinks" />
        <SidebarItem tab="blog" current={tab} setTab={setTab} icon={PenTool} label="Blog" />
        <SidebarItem tab="tarefas" current={tab} setTab={setTab} icon={ClipboardList} label="Tarefas" />
        <SidebarItem tab="perfil" current={tab} setTab={setTab} icon={UserCircle} label="Perfil" />
      </SidebarMenu>
    </SidebarGroup>
  );
}
