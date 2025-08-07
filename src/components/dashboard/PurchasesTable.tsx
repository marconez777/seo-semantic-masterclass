import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface PurchasesTableProps {
  userId: string;
}

const PurchasesTable = ({ userId }: PurchasesTableProps) => {
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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return <Badge className="bg-green-500 text-white hover:bg-green-500">PAGO</Badge>;
      case 'pendente':
        return <Badge className="bg-orange-500 text-white hover:bg-orange-500">PENDENTE</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-500 text-white hover:bg-red-500">CANCELADO</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPublicationStatusBadge = (status: string) => {
    switch (status) {
      case 'publicado':
        return <Badge className="bg-green-500 text-white hover:bg-green-500">PUBLICADO</Badge>;
      case 'pendente':
        return <Badge className="bg-orange-500 text-white hover:bg-orange-500">PENDENTE</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
      <div className="text-center py-12">
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
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="py-3 px-4 text-left text-sm font-medium text-blue-600">#</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-blue-600">SITE</th>
            <th className="py-3 px-4 text-center text-sm font-medium text-blue-600">DR</th>
            <th className="py-3 px-4 text-center text-sm font-medium text-blue-600">DA</th>
            <th className="py-3 px-4 text-center text-sm font-medium text-blue-600">TRÁFEGO /MÊS</th>
            <th className="py-3 px-4 text-left text-sm font-medium text-blue-600">CATEGORIA</th>
            <th className="py-3 px-4 text-center text-sm font-medium text-blue-600">VALOR</th>
            <th className="py-3 px-4 text-center text-sm font-medium text-blue-600">PAGAMENTO</th>
            <th className="py-3 px-4 text-center text-sm font-medium text-blue-600">PUBLICAÇÃO</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((purchase, index) => (
            <tr key={purchase.id} className="border-b hover:bg-muted/50">
              <td className="py-4 px-4 text-center">
                <span className="text-sm text-muted-foreground">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </td>
              
              <td className="py-4 px-4">
                <span className="font-medium text-sm">
                  {getDomainFromUrl(purchase.backlinks.site_url)}
                </span>
              </td>
              
              <td className="py-4 px-4 text-center">
                <span className="font-medium">{purchase.backlinks.dr}</span>
              </td>
              
              <td className="py-4 px-4 text-center text-blue-600 font-medium">
                {purchase.backlinks.da}
              </td>
              
              <td className="py-4 px-4 text-center">
                <span className="text-sm">
                  {purchase.backlinks.trafego_mensal.toLocaleString()}
                </span>
              </td>
              
              <td className="py-4 px-4">
                <Badge variant="outline" className="text-orange-600 border-orange-200">
                  {purchase.backlinks.categoria}
                </Badge>
              </td>
              
              <td className="py-4 px-4 text-center font-bold">
                {formatPrice(purchase.backlinks.valor)}
              </td>
              
              <td className="py-4 px-4 text-center">
                {getPaymentStatusBadge(purchase.pagamento_status)}
              </td>
              
              <td className="py-4 px-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  {getPublicationStatusBadge(purchase.publicacao_status)}
                  {purchase.link_publicacao && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(purchase.link_publicacao!, '_blank')}
                      className="p-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PurchasesTable;