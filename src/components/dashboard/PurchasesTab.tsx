import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Purchase {
  id: string;
  url_destino: string;
  texto_ancora: string;
  pagamento_status: string;
  publicacao_status: string;
  link_publicacao: string | null;
  criado_em: string;
  backlinks: {
    site_url: string;
    categoria: string;
    valor: number;
    dr: number;
    da: number;
    trafego_mensal: number;
  };
}

interface PurchasesTabProps {
  userId: string;
}

const PurchasesTab = ({ userId }: PurchasesTabProps) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPurchases();
  }, [userId]);

  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          id,
          url_destino,
          texto_ancora,
          pagamento_status,
          publicacao_status,
          link_publicacao,
          criado_em,
          backlinks (
            site_url,
            categoria,
            valor,
            dr,
            da,
            trafego_mensal
          )
        `)
        .eq('user_id', userId)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas compras.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getStatusBadge = (status: string, type: 'payment' | 'publication') => {
    if (type === 'payment') {
      switch (status) {
        case 'pago':
          return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pago</Badge>;
        case 'pendente':
          return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pendente</Badge>;
        case 'cancelado':
          return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelado</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    } else {
      switch (status) {
        case 'publicado':
          return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Publicado</Badge>;
        case 'pendente':
          return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Pendente</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhuma compra encontrada
            </h3>
            <p className="text-muted-foreground mb-6">
              Você ainda não realizou nenhuma compra.
            </p>
            <Button asChild>
              <a href="/comprar-backlinks">Explorar Backlinks</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {purchases.map((purchase) => (
        <Card key={purchase.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {getDomainFromUrl(purchase.backlinks.site_url)}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {purchase.backlinks.categoria}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  {formatPrice(purchase.backlinks.valor)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(purchase.criado_em), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Detalhes do Link</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Texto âncora:</span>
                    <span className="ml-2 font-medium">"{purchase.texto_ancora}"</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">URL destino:</span>
                    <span className="ml-2 font-medium text-xs break-all">
                      {purchase.url_destino}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Métricas do Site</h4>
                <div className="flex gap-2 mb-3">
                  <Badge variant="outline">DR {purchase.backlinks.dr}</Badge>
                  <Badge variant="outline">DA {purchase.backlinks.da}</Badge>
                  <Badge variant="outline">
                    {purchase.backlinks.trafego_mensal.toLocaleString()}/mês
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center justify-between pt-4 border-t">
              <div className="flex gap-3">
                {getStatusBadge(purchase.pagamento_status, 'payment')}
                {getStatusBadge(purchase.publicacao_status, 'publication')}
              </div>
              
              {purchase.link_publicacao && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(purchase.link_publicacao!, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Publicação
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PurchasesTab;