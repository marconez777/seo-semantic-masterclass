import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Search,
  User,
  Package,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Cliente {
  user_id: string;
  email: string | null;
  full_name: string | null;
  whatsapp: string | null;
  site: string | null;
  signup_source: string | null;
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

const formatSource = (src: string | null) => {
  if (!src) return "—";
  if (src === "direct") return "Direto";
  if (src.startsWith("/")) return src;
  return src;
};

export default function AdminClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [clienteOrders, setClienteOrders] = useState<OrderSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const { toast } = useToast();

  const loadClientes = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email, full_name, whatsapp, site, signup_source, created_at")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const { data: orders, error: ordersError } = await supabase
        .from("orders_new")
        .select("user_id, total, status");

      if (ordersError) throw ordersError;

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

      const clientesData: Cliente[] = (profiles || []).map((profile: any) => ({
        user_id: profile.user_id || "",
        email: profile.email,
        full_name: profile.full_name,
        whatsapp: profile.whatsapp,
        site: profile.site ?? null,
        signup_source: profile.signup_source ?? null,
        created_at: profile.created_at,
        total_orders: orderStats[profile.user_id!]?.count || 0,
        total_spent: orderStats[profile.user_id!]?.total || 0,
      }));

      setClientes(clientesData);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast({ title: "Erro ao carregar clientes" });
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

  const filteredClientes = useMemo(() => {
    if (!searchQuery) return clientes;
    const query = searchQuery.toLowerCase();
    return clientes.filter(
      (c) =>
        c.email?.toLowerCase().includes(query) ||
        c.full_name?.toLowerCase().includes(query) ||
        c.whatsapp?.includes(query) ||
        c.site?.toLowerCase().includes(query) ||
        c.signup_source?.toLowerCase().includes(query),
    );
  }, [clientes, searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredClientes.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedClientes = useMemo(
    () => filteredClientes.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredClientes, currentPage, pageSize],
  );

  const exportToExcel = () => {
    if (filteredClientes.length === 0) {
      toast({ title: "Nada para exportar" });
      return;
    }
    const rows = filteredClientes.map((c) => ({
      Nome: c.full_name || "",
      "E-mail": c.email || "",
      WhatsApp: c.whatsapp || "",
      Site: c.site || "",
      Origem: formatSource(c.signup_source),
      Pedidos: c.total_orders,
      "Total Gasto (R$)": Number((c.total_spent || 0).toFixed(2)),
      Cadastro: c.created_at ? new Date(c.created_at).toLocaleDateString("pt-BR") : "",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes");
    const date = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `clientes-${date}.xlsx`);
    toast({ title: `Exportados ${rows.length} clientes` });
  };

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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-2xl font-bold">Clientes</h2>
          <div className="flex items-center gap-2">
            <Button onClick={exportToExcel} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Exportar Excel
            </Button>
            <Button onClick={loadClientes} variant="outline" size="sm">
              Atualizar
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email, WhatsApp, site ou origem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
          <div>
            {searchQuery ? (
              <>
                <span className="font-medium text-foreground">{filteredClientes.length}</span>{" "}
                resultado(s) de {clientes.length} cliente(s)
              </>
            ) : (
              <>
                Total:{" "}
                <span className="font-medium text-foreground">{clientes.length}</span> cliente(s)
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span>Itens por página:</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="h-8 w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          <>
            <div className="border rounded-lg overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60">
                  <tr className="text-left">
                    <th className="p-3 font-medium">Cliente</th>
                    <th className="p-3 font-medium">Contato</th>
                    <th className="p-3 font-medium">Site</th>
                    <th className="p-3 font-medium">Origem</th>
                    <th className="p-3 font-medium text-center">Pedidos</th>
                    <th className="p-3 font-medium text-right">Total Gasto</th>
                    <th className="p-3 font-medium">Cadastro</th>
                    <th className="p-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedClientes.map((cliente) => (
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
                      <td className="p-3">{cliente.whatsapp || "—"}</td>
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
                      <td className="p-3 max-w-[180px] truncate" title={cliente.signup_source || ""}>
                        {cliente.signup_source ? (
                          <Badge variant="outline" className="font-normal">
                            {formatSource(cliente.signup_source)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary">{cliente.total_orders}</Badge>
                      </td>
                      <td className="p-3 text-right font-medium">{brl(cliente.total_spent)}</td>
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

            <div className="flex items-center justify-between flex-wrap gap-2 text-sm">
              <div className="text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Próxima <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}

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
