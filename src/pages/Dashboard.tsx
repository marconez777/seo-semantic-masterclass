import { useEffect, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
import { Heart, UserCircle, Shield, Package, ShoppingBag, Globe, Search, BarChart3 } from "lucide-react";
import { OrdersList } from "@/components/dashboard/OrdersList";
import { ProfileSection } from "@/components/dashboard/ProfileSection";
import { UserProfileDropdown } from "@/components/ui/user-profile-dropdown";
import { Separator } from "@/components/ui/separator";
import { FavoritesTable } from "@/components/dashboard/FavoritesTable";
import { KeywordTracker } from "@/components/dashboard/KeywordTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConsultingKeywords } from "@/components/consulting/ConsultingKeywords";
import { ConsultingPages } from "@/components/consulting/ConsultingPages";
import { ConsultingBacklinks } from "@/components/consulting/ConsultingBacklinks";
import { ConsultingBlogPosts } from "@/components/consulting/ConsultingBlogPosts";
import { ConsultingTaskBoard } from "@/components/consulting/ConsultingTaskBoard";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<string>("pedidos");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("Usuário");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [consultingClientId, setConsultingClientId] = useState<string | null>(null);
  const [consultingClientName, setConsultingClientName] = useState<string | null>(null);

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

    // Load profile
    supabase.from('profiles').select('full_name, avatar_url').eq('user_id', userId).maybeSingle().then(({ data }) => {
      if (data?.full_name) setUserName(data.full_name);
      if (data?.avatar_url) setAvatarUrl(data.avatar_url);
    });

    // Check if user is a consulting client
    supabase.from('consulting_clients').select('id, name').eq('user_id', userId).eq('status', 'ativo').maybeSingle().then(({ data }) => {
      if (data) {
        setConsultingClientId(data.id);
        setConsultingClientName(data.name);
      }
    });

    // Check admin role
    const checkAdminRole = async () => {
      try {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleData) {
          setIsAdmin(true);
        } else {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('user_id', userId)
            .single();
          setIsAdmin(profile?.is_admin === true);
        }
      } catch (error) {
        console.error('Erro ao verificar role de admin:', error);
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [userId]);

  if (!userId) return null;

  const tabLabel = tab === 'pedidos' ? 'Meus Pedidos' : tab === 'favoritos' ? 'Favoritos' : tab === 'keywords' ? 'Rastreio de Palavras' : tab === 'consultoria' ? 'Consultoria SEO' : 'Perfil';

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
              <SidebarGroup>
                <SidebarGroupLabel>Minha Conta</SidebarGroupLabel>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={tab === 'pedidos'}
                      onClick={() => setTab('pedidos')}
                      className={tab === 'pedidos' ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      <span>Meus Pedidos</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={tab === 'favoritos'}
                      onClick={() => setTab('favoritos')}
                      className={tab === 'favoritos' ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favoritos</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={tab === 'keywords'}
                      onClick={() => setTab('keywords')}
                      className={tab === 'keywords' ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}
                    >
                      <Search className="mr-2 h-4 w-4" />
                      <span>Rastreio de Palavras</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={tab === 'perfil'}
                      onClick={() => setTab('perfil')}
                      className={tab === 'perfil' ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroup>
              {consultingClientId && (
                <>
                  <SidebarSeparator />
                  <SidebarGroup>
                    <SidebarGroupLabel>Consultoria SEO</SidebarGroupLabel>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={tab === 'consultoria'}
                          onClick={() => setTab('consultoria')}
                          className={tab === 'consultoria' ? "bg-sidebar-accent text-sidebar-foreground font-medium" : "text-sidebar-foreground hover:bg-sidebar-accent/50"}
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>{consultingClientName || "Meu Projeto"}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroup>
                </>
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
                <h1 className="text-lg font-semibold">{tabLabel}</h1>
              </div>
              <UserProfileDropdown
                name={userName}
                role="Cliente"
                avatarUrl={avatarUrl}
                onSignOut={() => supabase.auth.signOut()}
                showActions={false}
              />
            </header>

            <main className="p-6 bg-muted/20 min-h-[calc(100vh-3.5rem)]">
              {tab === 'pedidos' && <OrdersList userId={userId} />}
              {tab === 'favoritos' && <FavoritesTable userId={userId} />}
              {tab === 'keywords' && <KeywordTracker userId={userId} />}
              {tab === 'perfil' && <ProfileSection />}
              {tab === 'consultoria' && consultingClientId && (
                <Tabs defaultValue="palavras">
                  <TabsList>
                    <TabsTrigger value="palavras">Palavras</TabsTrigger>
                    <TabsTrigger value="paginas">Páginas</TabsTrigger>
                    <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
                    <TabsTrigger value="blog">Blog</TabsTrigger>
                    <TabsTrigger value="tarefas">Tarefas</TabsTrigger>
                  </TabsList>
                  <TabsContent value="palavras">
                    <ConsultingKeywords clientId={consultingClientId} readOnly={true} />
                  </TabsContent>
                  <TabsContent value="paginas">
                    <ConsultingPages clientId={consultingClientId} readOnly={true} />
                  </TabsContent>
                  <TabsContent value="backlinks">
                    <ConsultingBacklinks clientId={consultingClientId} readOnly={true} />
                  </TabsContent>
                  <TabsContent value="blog">
                    <ConsultingBlogPosts clientId={consultingClientId} readOnly={true} />
                  </TabsContent>
                  <TabsContent value="tarefas">
                    <ConsultingTaskBoard clientId={consultingClientId} readOnly={true} />
                  </TabsContent>
                </Tabs>
              )}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}
