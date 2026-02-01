import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, Package, ExternalLink } from "lucide-react";
import { OrderFilters } from "./OrderFilters";

interface Order {
  id: string;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
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

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const statusLabels: Record<string, { label: string; color: string }> = {
  aguardando_pagamento: { label: "Aguardando Pagamento", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  pago: { label: "Pago", color: "bg-green-100 text-green-800 border-green-200" },
  em_producao: { label: "Em Produção", color: "bg-blue-100 text-blue-800 border-blue-200" },
  entregue: { label: "Entregue", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-800 border-red-200" },
  pendente: { label: "Pendente", color: "bg-gray-100 text-gray-800 border-gray-200" },
};

function getStatusBadge(status: string) {
  const config = statusLabels[status] || statusLabels.pendente;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
      {config.label}
    </span>
  );
}

export function OrdersList({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("todos");

  useEffect(() => {
    let mounted = true;

    const fetchOrders = async () => {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders_new")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        setLoading(false);
        return;
      }

      if (!ordersData || ordersData.length === 0) {
        if (mounted) {
          setOrders([]);
          setLoading(false);
        }
        return;
      }

      // Fetch order items for all orders
      const orderIds = ordersData.map((o) => o.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items_new")
        .select("*")
        .in("order_id", orderIds);

      if (itemsError) {
        console.error("Error fetching order items:", itemsError);
      }

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

      // Combine data
      const ordersWithItems: Order[] = ordersData.map((order) => ({
        id: order.id,
        total: order.total || 0,
        status: order.status || "pendente",
        payment_status: order.payment_status || "aguardando",
        payment_method: order.payment_method || "pix_whatsapp",
        created_at: order.created_at || "",
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

      if (mounted) {
        setOrders(ordersWithItems);
        setLoading(false);
      }
    };

    fetchOrders();

    return () => {
      mounted = false;
    };
  }, [userId]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "todos") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Skeleton className="h-10 w-48" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-4 bg-card">
            <div className="flex justify-between items-center mb-3">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
                <Skeleton className="h-6 w-20 ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <OrderFilters statusFilter={statusFilter} onStatusChange={setStatusFilter} />

      {filteredOrders.length === 0 ? (
        <div className="border rounded-md p-8 bg-card text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {statusFilter === "todos"
              ? "Nenhum pedido encontrado"
              : "Nenhum pedido com este status"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {statusFilter === "todos"
              ? "Você ainda não fez nenhum pedido."
              : "Tente mudar o filtro de status."}
          </p>
          {statusFilter === "todos" && (
            <Button asChild>
              <a href="/comprar-backlinks">Ver backlinks disponíveis</a>
            </Button>
          )}
        </div>
      ) : (
        filteredOrders.map((order) => (
          <div
            key={order.id}
            className="border rounded-lg bg-card overflow-hidden"
          >
            {/* Order Header */}
            <div
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() =>
                setExpandedOrder(expandedOrder === order.id ? null : order.id)
              }
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pedido #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="font-medium">
                    {new Date(order.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                  </p>
                  <p className="font-semibold text-primary">{brl(order.total)}</p>
                </div>
                {getStatusBadge(order.status)}
                {expandedOrder === order.id ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </div>

            {/* Order Details (Expanded) */}
            {expandedOrder === order.id && (
              <div className="border-t p-4 bg-muted/20">
                <h4 className="font-medium mb-3">Itens do Pedido</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/60">
                      <tr className="text-left">
                        <th className="p-2 font-medium">Site</th>
                        <th className="p-2 font-medium">Âncora</th>
                        <th className="p-2 font-medium">URL Destino</th>
                        <th className="p-2 font-medium">Status</th>
                        <th className="p-2 font-medium text-right">Preço</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2">
                            {item.backlink?.domain || item.backlink?.url || "Site não encontrado"}
                          </td>
                          <td className="p-2 text-muted-foreground">
                            {item.mk_will_choose ? (
                              <span className="italic">MK Art escolherá</span>
                            ) : (
                              item.anchor_text || "-"
                            )}
                          </td>
                          <td className="p-2 text-muted-foreground">
                            {item.mk_will_choose ? (
                              <span className="italic">MK Art escolherá</span>
                            ) : item.target_url ? (
                              <a
                                href={item.target_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline truncate block max-w-[200px] flex items-center gap-1"
                              >
                                {item.target_url.slice(0, 30)}...
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="p-2">{getStatusBadge(item.item_status)}</td>
                          <td className="p-2 text-right font-medium">
                            {brl(item.price)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <span>Método: </span>
                    <span className="font-medium">
                      {order.payment_method === "pix_whatsapp"
                        ? "PIX via WhatsApp"
                        : "Cartão de Crédito"}
                    </span>
                  </div>
                  <div className="font-semibold text-lg">
                    Total: {brl(order.total)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
