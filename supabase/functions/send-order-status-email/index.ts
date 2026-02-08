import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { OrderStatusEmail } from "./_templates/order-status-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderStatusEmailRequest {
  email: string;
  name: string;
  order_id: string;
  status: 'em_producao' | 'entregue';
  items_count: number;
}

const statusSubjects = {
  em_producao: 'Seu pedido está em produção!',
  entregue: 'Pedido entregue com sucesso!',
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Order status email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, order_id, status, items_count }: OrderStatusEmailRequest = await req.json();
    console.log("Processing order status email for:", email, "Order:", order_id, "Status:", status);

    const html = await renderAsync(
      React.createElement(OrderStatusEmail, {
        name,
        order_id,
        status,
        items_count,
      })
    );

    const shortOrderId = order_id.slice(0, 8).toUpperCase();
    const subject = `${statusSubjects[status]} - Pedido #${shortOrderId}`;

    const emailResponse = await resend.emails.send({
      from: "MK Art SEO <contato@mkart.com.br>",
      to: [email],
      subject,
      html,
    });

    console.log("Order status email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending order status email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
