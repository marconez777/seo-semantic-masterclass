import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";

type Backlink = Database['public']['Tables']['backlinks']['Row'];

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  backlink: Backlink;
}

interface OrderData {
  url_destino: string;
  texto_ancora: string;
}

const PurchaseModal = ({ isOpen, onClose, backlink }: PurchaseModalProps) => {
  const [step, setStep] = useState(1);
  const [orderData, setOrderData] = useState<OrderData>({
    url_destino: "",
    texto_ancora: ""
  });
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
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

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleStep1Next = () => {
    if (!orderData.url_destino.trim()) {
      toast({
        title: "URL obrigatória",
        description: "Por favor, informe a URL de destino.",
        variant: "destructive"
      });
      return;
    }

    if (!validateUrl(orderData.url_destino)) {
      toast({
        title: "URL inválida",
        description: "Por favor, informe uma URL válida (ex: https://seusite.com).",
        variant: "destructive"
      });
      return;
    }

    if (!orderData.texto_ancora.trim()) {
      toast({
        title: "Texto âncora obrigatório",
        description: "Por favor, informe o texto âncora do link.",
        variant: "destructive"
      });
      return;
    }

    setStep(2);
  };

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Create order in database
      const { data, error } = await supabase
        .from('pedidos')
        .insert({
          user_id: user.id,
          backlink_id: backlink.id,
          url_destino: orderData.url_destino,
          texto_ancora: orderData.texto_ancora,
          pagamento_status: 'pendente',
          publicacao_status: 'pendente'
        })
        .select()
        .single();

      if (error) throw error;
      setOrderId(data.id);
      setStep(3);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!orderId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          order_id: orderId,
          amount: Number(backlink.valor),
          description: `Backlink de ${getDomainFromUrl(backlink.site_url)}`
        }
      });

      if (error) throw error;

      if (data.payment_url) {
        // Open Mercado Pago checkout in new tab
        window.open(data.payment_url, '_blank');
        
        toast({
          title: "Redirecionando para pagamento",
          description: "Complete o pagamento na nova aba. O status será atualizado automaticamente."
        });
      } else {
        throw new Error("URL de pagamento não recebida");
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Erro no pagamento",
        description: "Não conseguimos processar seu pagamento. Tente novamente ou use outro método.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setOrderData({ url_destino: "", texto_ancora: "" });
    setOrderId(null);
    onClose();
  };

  const progressValue = (step / 3) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Comprar backlink de {getDomainFromUrl(backlink.site_url)}
          </DialogTitle>
          <div className="mt-4">
            <Progress value={progressValue} className="h-2" />
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span className={step >= 1 ? "text-primary font-medium" : ""}>1. Dados do Link</span>
              <span className={step >= 2 ? "text-primary font-medium" : ""}>2. Confirmação</span>
              <span className={step >= 3 ? "text-primary font-medium" : ""}>3. Pagamento</span>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {/* Step 1: Link Data */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="url_destino" className="text-sm font-medium">
                  URL de destino *
                </Label>
                <Input
                  id="url_destino"
                  type="url"
                  placeholder="https://seusite.com/pagina"
                  value={orderData.url_destino}
                  onChange={(e) => setOrderData({ ...orderData, url_destino: e.target.value })}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  URL para onde o backlink irá apontar
                </p>
              </div>

              <div>
                <Label htmlFor="texto_ancora" className="text-sm font-medium">
                  Texto âncora *
                </Label>
                <Input
                  id="texto_ancora"
                  placeholder="palavra-chave ou frase clicável"
                  value={orderData.texto_ancora}
                  onChange={(e) => setOrderData({ ...orderData, texto_ancora: e.target.value })}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Texto que será clicável no link
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleClose} className="flex-1">
                  Cancelar
                </Button>
                <Button onClick={handleStep1Next} className="flex-1">
                  Próximo <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold text-foreground mb-3">Resumo do pedido</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Site:</span>
                    <span className="font-medium">{getDomainFromUrl(backlink.site_url)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Métricas:</span>
                    <div className="flex gap-2">
                      <Badge variant="secondary">DR {backlink.dr}</Badge>
                      <Badge variant="secondary">DA {backlink.da}</Badge>
                      <Badge variant="secondary">{backlink.trafego_mensal.toLocaleString()}/mês</Badge>
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">URL de destino:</span>
                    <span className="font-medium text-sm">{orderData.url_destino}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Texto âncora:</span>
                    <span className="font-medium">"{orderData.texto_ancora}"</span>
                  </div>
                  
                  <div className="border-t pt-3 flex justify-between">
                    <span className="text-muted-foreground">Valor total:</span>
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(Number(backlink.valor))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button onClick={handleCreateOrder} disabled={loading} className="flex-1">
                  {loading ? "Processando..." : "Prosseguir para Pagamento"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="bg-green-50 p-6 rounded-lg">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Pedido criado com sucesso!
                </h3>
                <p className="text-green-700 mb-4">
                  Agora você será redirecionado para finalizar o pagamento via Mercado Pago.
                </p>
                <p className="text-sm text-muted-foreground">
                  Valor: <strong>{formatPrice(Number(backlink.valor))}</strong>
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Métodos de pagamento disponíveis:</h4>
                <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                  <span>💳 Cartão de Crédito</span>
                  <span>📱 PIX</span>
                  <span>🏦 Boleto</span>
                </div>
              </div>

              <Button onClick={handlePayment} disabled={loading} className="w-full">
                {loading ? "Processando..." : "Finalizar Pagamento"}
              </Button>

              <p className="text-xs text-muted-foreground">
                Após o pagamento, o backlink será publicado em até 3 dias úteis.
                Você poderá acompanhar o status no seu painel de compras.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;