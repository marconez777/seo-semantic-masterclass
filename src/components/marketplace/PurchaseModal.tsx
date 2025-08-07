import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { CheckCircle, ArrowLeft, ArrowRight, ShoppingCart } from "lucide-react";

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
  const { toast } = useToast();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setOrderData({ url_destino: "", texto_ancora: "" });
    }
  }, [isOpen]);

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

  const handleStep1Next = async () => {
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

    // Check if user is authenticated before proceeding
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para continuar.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    // Add item to cart with form data
    const cartItem = {
      ...backlink,
      url_destino: orderData.url_destino,
      texto_ancora: orderData.texto_ancora
    };
    
    addToCart(cartItem);
    setStep(2);
  };

  const handleContinueShopping = () => {
    toast({
      title: "Backlink adicionado ao carrinho!",
      description: `${getDomainFromUrl(backlink.site_url)} foi adicionado com sucesso.`
    });
    handleClose();
  };

  const handleFinalizePurchase = () => {
    toast({
      title: "Redirecionando para o carrinho",
      description: "Finalize sua compra no carrinho."
    });
    handleClose();
    navigate('/carrinho');
  };


  const handleClose = () => {
    setStep(1);
    setOrderData({ url_destino: "", texto_ancora: "" });
    onClose();
  };

  const progressValue = (step / 2) * 100;

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
              <span className={step >= 2 ? "text-primary font-medium" : ""}>2. Adicionar ao Carrinho</span>
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

          {/* Step 2: Add to Cart Confirmation */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Backlink adicionado ao carrinho!
                </h3>
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Site:</span>
                      <span className="font-medium">{getDomainFromUrl(backlink.site_url)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">URL de destino:</span>
                      <span className="font-medium text-xs">{orderData.url_destino}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Texto âncora:</span>
                      <span className="font-medium">"{orderData.texto_ancora}"</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-bold text-primary">
                        {formatPrice(Number(backlink.valor))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-lg font-medium mb-6">
                  Gostaria de continuar selecionando mais sites ou finalizar a sua compra?
                </p>
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleContinueShopping} className="flex-1">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Selecionar mais sites
                  </Button>
                  <Button onClick={handleFinalizePurchase} className="flex-1">
                    Finalizar compra
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseModal;