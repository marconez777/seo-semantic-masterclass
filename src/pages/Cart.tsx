import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, X, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/seo/SEOHead';
import { createCheckout } from '@/services/payment';

const Cart = () => {
  const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Create multiple orders in database
      const orders = cartItems.map(item => ({
        user_id: user.id,
        backlink_id: item.id,
        url_destino: item.url_destino,
        texto_ancora: item.texto_ancora,
        pagamento_status: 'pendente',
        publicacao_status: 'pendente'
      }));

      const { data, error } = await supabase
        .from('pedidos')
        .insert(orders)
        .select();

      if (error) throw error;

      // Manual checkout flow (no payment provider)
      if (data && data.length > 0) {
        // Optional: call a placeholder payment service for future providers
        const checkout = await createCheckout(data);

        clearCart();

        toast({
          title: "Pedido registrado",
          description: "Seu pedido foi criado. Em breve você receberá instruções de pagamento.",
        });

        navigate(checkout.url || '/painel');
      } else {
        throw new Error("Não foi possível criar o seu pedido");
      }
    } catch (error) {
      console.error('Error processing checkout:', error);
      toast({
        title: "Erro no checkout",
        description: "Não foi possível processar seu pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEOHead
        title="Carrinho de Compras | Mkart - Backlinks de Qualidade"
        description="Finalize sua compra de backlinks de alta qualidade. Revise seus itens e proceda para o pagamento seguro."
        canonicalUrl="https://mkart.com.br/carrinho"
      />
      
      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 pt-28 pb-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <ShoppingCart className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Seu Carrinho</h1>
            </div>

            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Seu carrinho está vazio
                </h2>
                <p className="text-muted-foreground mb-8">
                  Adicione alguns backlinks ao seu carrinho para continuar.
                </p>
                <Button onClick={() => navigate('/comprar-backlinks')}>
                  Explorar Backlinks
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="bg-card border rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">
                    {cartItems.length} item{cartItems.length > 1 ? 's' : ''} no carrinho
                  </h2>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Site</TableHead>
                        <TableHead>Métricas</TableHead>
                        <TableHead>URL Destino</TableHead>
                        <TableHead>Texto Âncora</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead className="w-16">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{getDomainFromUrl(item.site_url)}</div>
                              <div className="text-sm text-muted-foreground">{item.categoria}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Badge variant="secondary" className="text-xs">DR {item.dr}</Badge>
                              <Badge variant="secondary" className="text-xs">DA {item.da}</Badge>
                              <Badge variant="secondary" className="text-xs">
                                {item.trafego_mensal.toLocaleString()}/mês
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate text-sm">{item.url_destino}</div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">"{item.texto_ancora}"</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-primary">
                              {formatPrice(Number(item.valor))}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeFromCart(item.id)}
                              className="h-8 w-8"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="bg-muted p-6 rounded-lg">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-medium">Total do pedido:</span>
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(cartTotal)}
                    </span>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={clearCart} disabled={isLoading}>
                      Limpar Carrinho
                    </Button>
                    <Button 
                      onClick={handleCheckout} 
                      disabled={isLoading || cartItems.length === 0}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Finalizar Compra'
                      )}
                    </Button>
                  </div>
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>✓ Pagamento será instruído por e-mail</p>
                    <p>✓ Publicação em até 3 dias úteis</p>
                    <p>✓ Acompanhamento no painel do usuário</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Cart;