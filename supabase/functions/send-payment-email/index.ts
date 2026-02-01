import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { PaymentEmail } from "./_templates/payment-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentEmailRequest {
  email: string;
  name: string;
  order_id: string;
  total: number;
  items_count: number;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Payment email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, order_id, total, items_count }: PaymentEmailRequest = await req.json();
    console.log("Processing payment email for:", email, "Order:", order_id);

    const html = await renderAsync(
      React.createElement(PaymentEmail, {
        name,
        order_id,
        total,
        items_count,
      })
    );

    const emailResponse = await resend.emails.send({
      from: "MK Art SEO <noreply@mkart.com.br>",
      to: [email],
      subject: `PIX para pagamento - Pedido #${order_id.slice(0, 8).toUpperCase()}`,
      html,
    });

    console.log("Payment email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending payment email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
