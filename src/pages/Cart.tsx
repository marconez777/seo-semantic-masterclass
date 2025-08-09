import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, X, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/seo/SEOHead';


const Cart = () => {
  const { cartItems, removeFromCart, cartTotal, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [showCpfModal, setShowCpfModal] = useState(false);
  const [cpfInput, setCpfInput] = useState('');
  const [cpfError, setCpfError] = useState('');
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

  const formatCpf = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const validateCpf = (cpf: string) => {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) {
      return 'CPF deve ter 11 dígitos';
    }
    if (/^(\d)\1{10}$/.test(cleaned)) {
      return 'CPF inválido';
    }
    return '';
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    setCpfInput(formatCpf(cleaned));
    setCpfError('');
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      // Check if user already has CPF
      let taxId = (session?.user?.user_metadata?.taxId || '').trim?.() || '';
      if (!taxId) {
        // Show CPF modal
        setShowCpfModal(true);
        return;
      }

      await processCheckout(taxId);
    } catch (error) {
      console.error('[Checkout] Error:', error);
      toast({
        title: "Erro no checkout",
        description: "Não foi possível processar seu pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processCheckout = async (taxId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      // Create multiple orders in database
      const orders = cartItems.map(item => ({
        user_id: user!.id,
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

      if (data && data.length > 0) {
        // Prepare payload according to Abacate Pay format
        const payload = {
          frequency: 'ONE_TIME',
          methods: ['PIX'],
          customer: {
            name: (session?.user?.user_metadata as any)?.full_name || session?.user?.email || 'Cliente',
            cellphone: (session?.user?.user_metadata as any)?.phone || '',
            email: session?.user?.email || 'no-reply@mkart.com.br',
            taxId: taxId,
          },
          products: cartItems.map((item: any) => ({
            externalId: String(item.id),
            name: `Backlink em ${item.site_url || 'site'}`,
            description: '',
            quantity: 1,
            price: Math.round(Number(item.valor) * 100),
          })),
        };

        console.log('[Checkout] Payload Abacate:', payload);

        const { data: abacate, error: abacateErr } = await supabase.functions.invoke('abacate-create-billing', { 
          body: payload 
        });

        if (abacateErr) {
          // Try to get more detailed error info
          const ctx: any = (abacateErr as any).context;
          try {
            if (ctx?.response && typeof ctx.response.text === 'function') {
              const bodyText = await ctx.response.text();
              console.error('[Checkout] EdgeFunction error body:', bodyText);
              throw new Error(bodyText);
            }
            if (ctx?.text) {
              const bodyText = await ctx.text();
              console.error('[Checkout] EdgeFunction error body:', bodyText);
              throw new Error(bodyText);
            }
            if (ctx?.error) {
              console.error('[Checkout] EdgeFunction error body:', ctx.error);
              throw new Error(typeof ctx.error === 'string' ? ctx.error : JSON.stringify(ctx.error));
            }
          } catch (_) {
            // ignore parsing errors
          }
          console.error('[Checkout] EdgeFunction error:', abacateErr);
          throw new Error(abacateErr.message || 'Erro ao processar pagamento PIX');
        }

        if (abacate?.url) {
          clearCart();
          window.location.href = abacate.url;
          return;
        }

        console.warn('[Checkout] Resposta sem URL de pagamento:', abacate);
        throw new Error('Não foi possível iniciar o pagamento. Tente novamente.');
      } else {
        throw new Error("Não foi possível criar o seu pedido");
      }
    } catch (error: any) {
      console.error('[Checkout] Exception:', error);
      throw error;
    }
  };

  const handleCpfSubmit = async () => {
    const cpfCleaned = cpfInput.replace(/\D/g, '');
    const error = validateCpf(cpfCleaned);
    if (error) {
      setCpfError(error);
      return;
    }

    setIsLoading(true);
    try {
      setShowCpfModal(false);
      setCpfInput('');
      setCpfError('');

      await processCheckout(cpfCleaned);
    } catch (e: any) {
      console.error('[Checkout] handleCpfSubmit error:', e);
      toast({
        title: 'Erro no checkout',
        description: e?.message || 'Erro ao processar pagamento PIX.',
        variant: 'destructive'
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

      {/* CPF Modal */}
      <Dialog open={showCpfModal} onOpenChange={setShowCpfModal}>
        <DialogContent className="sm:max-w-md" aria-describedby="cpf-dialog-description">
          <DialogHeader>
            <DialogTitle>Informe seu CPF</DialogTitle>
            <DialogDescription id="cpf-dialog-description">
              Precisamos do seu CPF para gerar o pagamento PIX via Abacate Pay.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF (apenas números)</Label>
              <Input
                id="cpf"
                placeholder="000.000.000-00"
                value={cpfInput}
                onChange={handleCpfChange}
                maxLength={14}
                className={cpfError ? 'border-destructive' : ''}
              />
              {cpfError && (
                <p className="text-sm text-destructive">{cpfError}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCpfModal(false);
              setCpfInput('');
              setCpfError('');
              setIsLoading(false);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleCpfSubmit} disabled={!cpfInput || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                'Continuar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Cart;