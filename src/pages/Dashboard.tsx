import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StructuredData from "@/components/seo/StructuredData";
import SEOHead from "@/components/seo/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import PurchasesTable from "@/components/dashboard/PurchasesTable";
import FavoritesTable from "@/components/dashboard/FavoritesTable";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        // Save current URL for redirect after login
        localStorage.setItem('redirect_after_login', window.location.pathname);
        toast({
          title: "Login necessário",
          description: "Você precisa estar logado para acessar o painel.",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/auth');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Erro",
        description: "Erro ao fazer logout.",
        variant: "destructive"
      });
    }
  };

  const pageData = {
    name: "Painel do Usuário - MK Art SEO",
    url: "https://seo-semantic-masterclass.lovable.app/painel",
    description: "Acompanhe suas compras e favoritos de backlinks."
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <SEOHead
        title="Meu Painel - MK Art SEO"
        description="Acompanhe suas compras de backlinks e gerencie seus favoritos."
        noindex={true}
      />
      <StructuredData type="website" data={pageData} />
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Meu Painel
                </h1>
                <p className="text-muted-foreground">
                  Acompanhe suas compras e gerencie seus favoritos
                </p>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Sair
              </Button>
            </div>

            <Tabs defaultValue="compras" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="compras">Compras</TabsTrigger>
                <TabsTrigger value="favoritos">Favoritos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="compras">
                <PurchasesTable userId={user.id} />
              </TabsContent>
              
              <TabsContent value="favoritos">
                <FavoritesTable userId={user.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Dashboard;