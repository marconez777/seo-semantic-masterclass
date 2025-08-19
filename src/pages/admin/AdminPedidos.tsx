import { useEffect, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Pedido {
  id: string;
  user_id: string;
  status: string;
  total_cents: number;
  created_at: string;
  paid_at?: string;
  publish_due_at?: string;
  cancelled_at?: string;
  payment_method?: string;
}

interface PedidoPII {
  order_id: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_cpf: string | null;
  customer_phone: string | null;
}

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [piiByOrder, setPiiByOrder] = useState<Record<string, PedidoPII>>({});
  const [receiptAmount, setReceiptAmount] = useState("");
  const [receiptNote, setReceiptNote] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    // Pedidos (todos)
    const { data: pedidosData, error: pedidosErr } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });
    if (pedidosErr) console.error('Erro ao carregar pedidos', pedidosErr);
    const pedidos = pedidosData ?? [];
    setPedidos(pedidos as any);

    const orderIds = pedidos.map((p: any) => p.id);

    // Load PII snapshot for each order (admin only) - using secure edge function
    let piiMap: Record<string, PedidoPII> = {};
    if (orderIds.length) {
      try {
        const { data: piiResponse, error: piiErr } = await supabase.functions.invoke('get-pii-data', {
          body: { order_ids: orderIds }
        });
        
        if (piiErr) {
          console.error('Erro ao carregar dados PII via edge function', piiErr);
        } else if (piiResponse?.data) {
          piiResponse.data.forEach((record: any) => {
            piiMap[record.order_id] = record as PedidoPII;
          });
        }
      } catch (error) {
        console.error('Erro ao chamar função segura de PII', error);
      }
    }
    setPiiByOrder(piiMap);
    setLoading(false);
  };

  const handleApprovePayment = async (orderId: string) => {
    const { data: updatedOrder, error } = await supabase
      .from('pedidos')
      .update({ status: 'paid' })
      .eq('id', orderId)
      .select('*')
      .single();
    
    if (error || !updatedOrder) {
      console.error('Erro ao aprovar pagamento', error);
      toast({ title: "Erro ao aprovar pagamento", description: error?.message });
    } else {
      const dueDate = updatedOrder.publish_due_at
        ? new Date(updatedOrder.publish_due_at).toLocaleDateString('pt-BR')
        : 'N/A';
      toast({ title: "Pagamento aprovado", description: `Prazo de publicação até ${dueDate}.` });
      loadData();
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('pedidos')
      .update({ status: 'cancelled' })
      .eq('id', orderId);
    
    if (error) {
      console.error('Erro ao cancelar pedido', error);
      toast({ title: "Erro ao cancelar pedido", description: error.message });
    } else {
      toast({ title: "Pedido cancelado" });
      loadData();
    }
  };

  const handleAddReceipt = async () => {
    const amount = parseFloat(receiptAmount);
    if (!amount || amount <= 0) {
      toast({ title: "Valor inválido", description: "Digite um valor válido." });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Usuário não autenticado", description: "Faça login novamente." });
      return;
    }

    const { error } = await supabase
      .from('order_receipts')
      .insert({
        order_id: selectedOrderId,
        amount_cents: Math.round(amount * 100),
        note: receiptNote || null,
        created_by: user.id,
      });

    if (error) {
      console.error('Erro ao adicionar recibo', error);
      toast({ title: "Erro ao adicionar recibo", description: error.message });
    } else {
      toast({ title: "Recibo adicionado com sucesso" });
      setShowReceiptDialog(false);
      setReceiptAmount("");
      setReceiptNote("");
      setSelectedOrderId("");
      loadData(); // Refetch data
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <SEOHead
        title="Admin – Pedidos | MK Art SEO"
        description="Painel admin para gerenciar pedidos."
        canonicalUrl={`${window.location.origin}/admin`}
        keywords="admin, pedidos"
      />

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Pedidos</h2>
        
        <div className="border rounded-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-accent/40">
              <tr className="text-left">
                <th className="p-3">Pedido</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Contato</th>
                <th className="p-3">Criado</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3">Pago em</th>
                <th className="p-3">Prazo Pub.</th>
                <th className="p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4" colSpan={9}>Carregando…</td></tr>
              ) : pedidos.length === 0 ? (
                <tr><td className="p-4" colSpan={9}>Nenhum pedido.</td></tr>
              ) : (
                pedidos.map((p) => (
                  <tr key={p.id} className="border-t align-top">
                    <td className="p-3">
                      <div className="font-mono text-xs break-all max-w-32">{p.id}</div>
                    </td>
                    <td className="p-3">
                      {(() => { const pii = piiByOrder[p.id]; return (
                        <>
                          <div className="font-medium">{pii?.customer_name ?? '—'}</div>
                          <div className="text-muted-foreground text-xs">CPF: {pii?.customer_cpf ?? '—'}</div>
                        </>
                      ); })()}
                    </td>
                    <td className="p-3 text-xs">
                      {(() => { const pii = piiByOrder[p.id]; return (
                        <>
                          <div>{pii?.customer_email ?? '—'}</div>
                          <div>{pii?.customer_phone ?? '—'}</div>
                        </>
                      ); })()}
                    </td>
                    <td className="p-3 text-xs">{new Date(p.created_at).toLocaleString('pt-BR')}</td>
                    <td className="p-3">{(p.total_cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</td>
                    <td className="p-3">
                      <Badge variant={getStatusBadgeVariant(p.status)}>{p.status}</Badge>
                    </td>
                    <td className="p-3 text-xs">
                      {p.paid_at ? new Date(p.paid_at).toLocaleString('pt-BR') : '—'}
                    </td>
                    <td className="p-3 text-xs">
                      {p.publish_due_at ? new Date(p.publish_due_at).toLocaleString('pt-BR') : '—'}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col gap-1">
                        {p.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleApprovePayment(p.id)}
                              className="text-xs h-7"
                            >
                              Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleCancelOrder(p.id)}
                              className="text-xs h-7"
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                        {p.status === 'paid' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              setSelectedOrderId(p.id);
                              setShowReceiptDialog(true);
                            }}
                            className="text-xs h-7"
                          >
                            + Recibo
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog para adicionar recibo */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Recibo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input
                type="number"
                step="0.01"
                value={receiptAmount}
                onChange={(e) => setReceiptAmount(e.target.value)}
                placeholder="Ex: 150.00"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Observação (opcional)</label>
              <Textarea
                value={receiptNote}
                onChange={(e) => setReceiptNote(e.target.value)}
                placeholder="Observações sobre o pagamento..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddReceipt}>Adicionar Recibo</Button>
              <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}