import { useEffect, useState, useMemo } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp, ExternalLink, MessageCircle } from "lucide-react";
import { OrderStats } from "@/components/admin/OrderStats";
import { AdminOrderFilters } from "@/components/admin/AdminOrderFilters";

interface Pedido {
  id: string;
  user_id: string;
  status: string;
  total: number;
  created_at: string;
  paid_at?: string;
  payment_method?: string;
  payment_status?: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  backlink_id: string;
  price: number;
  anchor_text: string | null;
  target_url: string | null;
  item_status: string;
  mk_will_choose: boolean;
  backlink?: {
    domain: string;
    url: string;
  };
}

interface PedidoPII {
  order_id: string;
  customer_email: string | null;
  customer_name: string | null;
  customer_cpf: string | null;
  customer_phone: string | null;
}

const statusOptions = [
  { value: "aguardando_pagamento", label: "Aguardando Pagamento" },
  { value: "pago", label: "Pago" },
  { value: "em_producao", label: "Em Produção" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

const itemStatusOptions = [
  { value: "pendente", label: "Pendente" },
  { value: "em_producao", label: "Em Produção" },
  { value: "publicado", label: "Publicado" },
  { value: "entregue", label: "Entregue" },
];

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const getStatusBadgeClass = (status: string) => {
  const statusColors: Record<string, string> = {
    aguardando_pagamento: "bg-yellow-100 text-yellow-800 border-yellow-200",
    pago: "bg-green-100 text-green-800 border-green-200",
    em_producao: "bg-blue-100 text-blue-800 border-blue-200",
    entregue: "bg-emerald-100 text-emerald-800 border-emerald-200",
    cancelado: "bg-red-100 text-red-800 border-red-200",
    pendente: "bg-gray-100 text-gray-800 border-gray-200",
    publicado: "bg-purple-100 text-purple-800 border-purple-200",
  };
  return statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    aguardando_pagamento: "Aguardando Pagamento",
    pago: "Pago",
    em_producao: "Em Produção",
    entregue: "Entregue",
    cancelado: "Cancelado",
    pendente: "Pendente",
    publicado: "Publicado",
  };
  return labels[status] || status;
};

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  const [piiByOrder, setPiiByOrder] = useState<Record<string, PedidoPII>>({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Pedido | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const loadData = async () => {
    setLoading(true);
    
    // Fetch orders
    const { data: pedidosData, error: pedidosErr } = await supabase
      .from("orders_new")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (pedidosErr) {
      console.error("Erro ao carregar pedidos", pedidosErr);
      setLoading(false);
      return;
    }

    const orderIds = (pedidosData || []).map((p) => p.id);

    // Fetch order items
    const { data: itemsData } = await supabase
      .from("order_items_new")
      .select("*")
      .in("order_id", orderIds);

    // Fetch backlink details
    const backlinkIds = (itemsData || [])
      .map((item) => item.backlink_id)
      .filter(Boolean) as string[];

    let backlinkMap: Record<string, { domain: string; url: string }> = {};
    if (backlinkIds.length > 0) {
      const { data: backlinksData } = await supabase
        .from("backlinks")
        .select("id, domain, url")
        .in("id", backlinkIds);

      (backlinksData || []).forEach((b) => {
        backlinkMap[b.id] = { domain: b.domain || "", url: b.url };
      });
    }

    // Combine orders with items
    const ordersWithItems: Pedido[] = (pedidosData || []).map((order) => ({
      id: order.id,
      user_id: order.user_id || "",
      status: order.status || "pendente",
      total: order.total || 0,
      created_at: order.created_at || "",
      paid_at: order.paid_at,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      items: (itemsData || [])
        .filter((item) => item.order_id === order.id)
        .map((item) => ({
          id: item.id,
          backlink_id: item.backlink_id || "",
          price: item.price || 0,
          anchor_text: item.anchor_text,
          target_url: item.target_url,
          item_status: item.item_status || "pendente",
          mk_will_choose: item.mk_will_choose || false,
          backlink: item.backlink_id ? backlinkMap[item.backlink_id] : undefined,
        })),
    }));

    setPedidos(ordersWithItems);

    // Load PII data
    let piiMap: Record<string, PedidoPII> = {};
    if (orderIds.length) {
      try {
        const { data: piiResponse, error: piiErr } = await supabase.functions.invoke("get-pii-data", {
          body: { order_ids: orderIds },
        });

        if (!piiErr && piiResponse?.data) {
          piiResponse.data.forEach((record: any) => {
            piiMap[record.order_id] = record as PedidoPII;
          });
        }
      } catch (error) {
        console.error("Erro ao carregar PII", error);
      }
    }
    setPiiByOrder(piiMap);
    setLoading(false);
  };

  const filteredPedidos = useMemo(() => {
    return pedidos.filter((pedido) => {
      // Status filter
      if (statusFilter !== "todos" && pedido.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const pii = piiByOrder[pedido.id];
        const query = searchQuery.toLowerCase();
        const matchesName = pii?.customer_name?.toLowerCase().includes(query);
        const matchesEmail = pii?.customer_email?.toLowerCase().includes(query);
        const matchesPhone = pii?.customer_phone?.includes(query);
        const matchesId = pedido.id.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesId) {
          return false;
        }
      }
      return true;
    });
  }, [pedidos, statusFilter, searchQuery, piiByOrder]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    const updateData: any = { status };
    if (status === "pago") {
      updateData.paid_at = new Date().toISOString();
      updateData.payment_status = "pago";
    }

    const { error } = await supabase.from("orders_new").update(updateData).eq("id", orderId);

    if (error) {
      toast({ title: "Erro ao atualizar status", description: error.message });
    } else {
      toast({ title: "Status atualizado com sucesso" });
      
      // Send email notification for status changes
      const pii = piiByOrder[orderId];
      const order = pedidos.find(p => p.id === orderId);
      
      if (pii?.customer_email && order) {
        try {
          if (status === "em_producao" || status === "entregue") {
            await supabase.functions.invoke("send-order-status-email", {
              body: {
                email: pii.customer_email,
                name: pii.customer_name || "Cliente",
                order_id: orderId,
                status: status,
                items_count: order.items.length,
              },
            });
            toast({ title: "E-mail de atualização enviado" });
          }
        } catch (emailError) {
          console.error("Erro ao enviar e-mail:", emailError);
        }
      }
      
      loadData();
    }
    setStatusDialogOpen(false);
    setSelectedOrder(null);
  };

  const updateItemStatus = async (itemId: string, status: string) => {
    const { error } = await supabase
      .from("order_items_new")
      .update({ item_status: status })
      .eq("id", itemId);

    if (error) {
      toast({ title: "Erro ao atualizar item", description: error.message });
    } else {
      toast({ title: "Item atualizado" });
      loadData();
    }
  };

  const openWhatsApp = (phone: string | null, orderInfo: string) => {
    if (!phone) {
      toast({ title: "WhatsApp não disponível" });
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    const message = `Olá! Estamos entrando em contato sobre seu pedido: ${orderInfo}`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
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
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Pedidos</h2>
          <Button onClick={loadData} variant="outline" size="sm">
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <OrderStats pedidos={pedidos} />

        {/* Filters */}
        <AdminOrderFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              ))}
            </div>
          ) : filteredPedidos.length === 0 ? (
            <div className="border rounded-md p-8 text-center text-muted-foreground">
              {searchQuery || statusFilter !== "todos"
                ? "Nenhum pedido encontrado com esses filtros."
                : "Nenhum pedido encontrado."}
            </div>
          ) : (
            filteredPedidos.map((pedido) => {
              const pii = piiByOrder[pedido.id];
              const isExpanded = expandedOrder === pedido.id;

              return (
                <div key={pedido.id} className="border rounded-lg bg-card overflow-hidden">
                  {/* Order Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpandedOrder(isExpanded ? null : pedido.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm">
                            #{pedido.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(pedido.status)}`}
                          >
                            {getStatusLabel(pedido.status)}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(pedido.created_at).toLocaleString("pt-BR")}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-semibold text-lg">{brl(pedido.total)}</div>
                          <div className="text-xs text-muted-foreground">
                            {pedido.items.length} {pedido.items.length === 1 ? "item" : "itens"}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Customer Info Summary */}
                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">Cliente: </span>
                        <span className="font-medium">{pii?.customer_name || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Email: </span>
                        <span>{pii?.customer_email || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">WhatsApp: </span>
                        <span>{pii?.customer_phone || "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t p-4 bg-muted/20 space-y-4">
                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(pedido);
                            setNewStatus(pedido.status);
                            setStatusDialogOpen(true);
                          }}
                        >
                          Alterar Status
                        </Button>
                        {pedido.status === "aguardando_pagamento" && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(pedido.id, "pago");
                            }}
                          >
                            Marcar como Pago
                          </Button>
                        )}
                        {pii?.customer_phone && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openWhatsApp(pii.customer_phone, `#${pedido.id.slice(0, 8)} - ${brl(pedido.total)}`);
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            WhatsApp
                          </Button>
                        )}
                      </div>

                      {/* Items Table */}
                      <div>
                        <h4 className="font-medium mb-2">Itens do Pedido</h4>
                        <div className="overflow-x-auto border rounded-md">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/60">
                              <tr className="text-left">
                                <th className="p-2 font-medium">Site</th>
                                <th className="p-2 font-medium">Âncora</th>
                                <th className="p-2 font-medium">URL Destino</th>
                                <th className="p-2 font-medium">MK Escolhe</th>
                                <th className="p-2 font-medium">Status</th>
                                <th className="p-2 font-medium text-right">Preço</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pedido.items.map((item) => (
                                <tr key={item.id} className="border-t">
                                  <td className="p-2">
                                    {item.backlink?.domain || item.backlink?.url || "—"}
                                  </td>
                                  <td className="p-2">
                                    {item.mk_will_choose ? (
                                      <span className="italic text-muted-foreground">A definir</span>
                                    ) : (
                                      item.anchor_text || "—"
                                    )}
                                  </td>
                                  <td className="p-2">
                                    {item.mk_will_choose ? (
                                      <span className="italic text-muted-foreground">A definir</span>
                                    ) : item.target_url ? (
                                      <a
                                        href={item.target_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:underline flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {item.target_url.slice(0, 30)}...
                                        <ExternalLink className="h-3 w-3" />
                                      </a>
                                    ) : (
                                      "—"
                                    )}
                                  </td>
                                  <td className="p-2">
                                    {item.mk_will_choose ? (
                                      <Badge variant="secondary">Sim</Badge>
                                    ) : (
                                      <span className="text-muted-foreground">Não</span>
                                    )}
                                  </td>
                                  <td className="p-2">
                                    <Select
                                      value={item.item_status}
                                      onValueChange={(value) => updateItemStatus(item.id, value)}
                                    >
                                      <SelectTrigger className="h-7 w-32 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {itemStatusOptions.map((opt) => (
                                          <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </td>
                                  <td className="p-2 text-right font-medium">{brl(item.price)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Status Change Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Status do Pedido</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => selectedOrder && updateOrderStatus(selectedOrder.id, newStatus)}
              disabled={!newStatus}
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
