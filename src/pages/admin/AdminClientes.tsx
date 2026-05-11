import { useEffect, useState } from "react";
import SEOHead from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageCircle, Search, User, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Cliente {
  user_id: string;
  email: string | null;
  full_name: string | null;
  whatsapp: string | null;
  site: string | null;
  created_at: string | null;
  total_orders: number;
  total_spent: number;
}

interface OrderSummary {
  id: string;
  status: string;
  total: number;
  created_at: string;
}

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    aguardando_pagamento: "Aguardando Pagamento",
    pago: "Pago",
    em_producao: "Em Produção",
    entregue: "Entregue",
    cancelado: "Cancelado",
  };
  return labels[status] || status;
};

export default function AdminClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clienteOrders, setClienteOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { toast } = useToast();

  const loadClientes = async () => {
    setLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, full_name, whatsapp, site, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all orders to calculate totals
      const { data: orders, error: ordersError } = await supabase
        .from("orders_new")
        .select("user_id, total, status");

      if (ordersError) throw ordersError;

      // Calculate order stats per user
      const orderStats: Record<string, { count: number; total: number }> = {};
      (orders || []).forEach((order) => {
        if (!order.user_id) return;
        if (!orderStats[order.user_id]) {
          orderStats[order.user_id] = { count: 0, total: 0 };
        }
        orderStats[order.user_id].count++;
        if (order.status !== "cancelado") {
          orderStats[order.user_id].total += order.total || 0;
        }
      });

      // Combine data
      const clientesData: Cliente[] = (profiles || []).map((profile: any) => ({
        user_id: profile.user_id || "",
        email: profile.email,
        full_name: profile.full_name,
        whatsapp: profile.whatsapp,
        site: profile.site ?? null,
        created_at: profile.created_at,
        total_orders: orderStats[profile.user_id!]?.count || 0,
        total_spent: orderStats[profile.user_id!]?.total || 0,
      }));

      setClientes(clientesData);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast({
        title: "Erro ao carregar clientes",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadClienteOrders = async (userId: string) => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders_new")
        .select("id, status, total, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClienteOrders(data || []);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const openWhatsApp = (phone: string | null, name: string | null) => {
    if (!phone) {
      toast({ title: "WhatsApp não disponível" });
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    const message = `Olá${name ? ` ${name}` : ""}! Aqui é da MK Art SEO.`;
    window.open(`https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  useEffect(() => {
    loadClientes();
  }, []);

  const filteredClientes = clientes.filter((cliente) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      cliente.email?.toLowerCase().includes(query) ||
      cliente.full_name?.toLowerCase().includes(query) ||
      cliente.whatsapp?.includes(query) ||
      cliente.site?.toLowerCase().includes(query)
    );
  });

  return (
    <>
      <SEOHead
        title="Admin – Clientes | MK Art SEO"
        description="Gerenciamento de clientes"
        canonicalUrl="https://mkart.com.br/admin/clientes"
        keywords="admin, clientes"
        noindex={true}
      />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Clientes</h2>
          <Button onClick={loadClientes} variant="outline" size="sm">
            Atualizar
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, WhatsApp ou site..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            ))}
          </div>
        ) : filteredClientes.length === 0 ? (
          <div className="border rounded-md p-8 text-center text-muted-foreground">
            {searchQuery ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado."}
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr className="text-left">
                  <th className="p-3 font-medium">Cliente</th>
                  <th className="p-3 font-medium">Contato</th>
                  <th className="p-3 font-medium">Site</th>
                  <th className="p-3 font-medium text-center">Pedidos</th>
                  <th className="p-3 font-medium text-right">Total Gasto</th>
                  <th className="p-3 font-medium">Cadastro</th>
                  <th className="p-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.user_id} className="border-t hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{cliente.full_name || "—"}</div>
                          <div className="text-xs text-muted-foreground">
                            {cliente.email || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {cliente.whatsapp || "—"}
                    </td>
                    <td className="p-3 max-w-[200px] truncate">
                      {cliente.site ? (
                        <a
                          href={cliente.site.startsWith("http") ? cliente.site : `https://${cliente.site}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                          title={cliente.site}
                        >
                          {cliente.site.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <Badge variant="secondary">{cliente.total_orders}</Badge>
                    </td>
                    <td className="p-3 text-right font-medium">
                      {brl(cliente.total_spent)}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {cliente.created_at
                        ? new Date(cliente.created_at).toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCliente(cliente);
                            loadClienteOrders(cliente.user_id);
                          }}
                        >
                          <Package className="h-4 w-4 mr-1" />
                          Pedidos
                        </Button>
                        {cliente.whatsapp && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openWhatsApp(cliente.whatsapp, cliente.full_name)}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Order History Dialog */}
        <Dialog open={!!selectedCliente} onOpenChange={() => setSelectedCliente(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Histórico de Pedidos - {selectedCliente?.full_name || selectedCliente?.email || "Cliente"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {loadingOrders ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : clienteOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum pedido encontrado.
                </p>
              ) : (
                <div className="space-y-2">
                  {clienteOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <span className="font-mono text-sm">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className="text-muted-foreground ml-3">
                          {new Date(order.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="secondary">{getStatusLabel(order.status)}</Badge>
                        <span className="font-medium">{brl(order.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
