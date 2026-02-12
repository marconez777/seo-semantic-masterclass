import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "contato@mkart.com.br";

type EventType = "new_order" | "new_customer" | "new_lead";

interface NotifyRequest {
  type: EventType;
  data: Record<string, unknown>;
}

function buildEmail(type: EventType, data: Record<string, unknown>): { subject: string; html: string } {
  const now = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  if (type === "new_order") {
    const orderId = String(data.order_id || "").substring(0, 8).toUpperCase();
    const total = Number(data.total || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    const itemsCount = data.items_count || 0;
    return {
      subject: `🛒 Novo Pedido #${orderId} - ${total}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#1a1a2e;">Novo Pedido Recebido</h2>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Pedido</td><td style="padding:8px;border-bottom:1px solid #eee;">#${orderId}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Valor Total</td><td style="padding:8px;border-bottom:1px solid #eee;">${total}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Itens</td><td style="padding:8px;border-bottom:1px solid #eee;">${itemsCount}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Cliente</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.customer_name || "N/A"} (${data.customer_email || "N/A"})</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Data</td><td style="padding:8px;">${now}</td></tr>
          </table>
        </div>`,
    };
  }

  if (type === "new_customer") {
    return {
      subject: `👤 Novo Cliente Cadastrado - ${data.name || "N/A"}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <h2 style="color:#1a1a2e;">Novo Cliente Cadastrado</h2>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Nome</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.name || "N/A"}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">E-mail</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.email || "N/A"}</td></tr>
            <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">WhatsApp</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.phone || "N/A"}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Data</td><td style="padding:8px;">${now}</td></tr>
          </table>
        </div>`,
    };
  }

  // new_lead
  return {
    subject: `📩 Novo Lead - ${data.name || "N/A"}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#1a1a2e;">Novo Lead Recebido</h2>
        <table style="width:100%;border-collapse:collapse;margin:20px 0;">
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Nome</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.name || "N/A"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">E-mail</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.email || "N/A"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">WhatsApp</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.whatsapp || "N/A"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Site</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.website || "N/A"}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold;">Origem</td><td style="padding:8px;border-bottom:1px solid #eee;">${data.source || "backlink"}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;">Data</td><td style="padding:8px;">${now}</td></tr>
        </table>
      </div>`,
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data }: NotifyRequest = await req.json();

    // Validate type
    const validTypes: EventType[] = ["new_order", "new_customer", "new_lead"];
    if (!validTypes.includes(type)) {
      return new Response(JSON.stringify({ error: "Invalid event type" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { subject, html } = buildEmail(type, data || {});

    const emailResponse = await resend.emails.send({
      from: "MK Art SEO <contato@mkart.com.br>",
      to: [ADMIN_EMAIL],
      subject,
      html,
    });

    console.log(`Admin notification sent [${type}]:`, emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending admin notification:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
