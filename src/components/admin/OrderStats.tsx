import { DollarSign, Package, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderStatsProps {
  pedidos: Array<{
    status: string;
    total: number;
    payment_status?: string;
  }>;
}

function brl(v: number) {
  return (v / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function OrderStats({ pedidos }: OrderStatsProps) {
  const totalVendido = pedidos
    .filter((p) => p.status !== "cancelado")
    .reduce((sum, p) => sum + (p.total || 0), 0);

  const totalPago = pedidos
    .filter((p) => p.status === "pago" || p.status === "em_producao" || p.status === "entregue")
    .reduce((sum, p) => sum + (p.total || 0), 0);

  const aguardando = pedidos.filter((p) => p.status === "aguardando_pagamento").length;
  const entregues = pedidos.filter((p) => p.status === "entregue").length;

  const stats = [
    {
      title: "Total de Pedidos",
      value: pedidos.length.toString(),
      icon: Package,
      description: "Todos os pedidos",
    },
    {
      title: "Faturamento Total",
      value: brl(totalVendido),
      icon: DollarSign,
      description: "Excluindo cancelados",
    },
    {
      title: "Aguardando Pagamento",
      value: aguardando.toString(),
      icon: Clock,
      description: "Pendentes de confirmação",
    },
    {
      title: "Entregues",
      value: entregues.toString(),
      icon: CheckCircle,
      description: "Pedidos finalizados",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
