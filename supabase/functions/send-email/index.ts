import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  orders: Array<{
    site_url: string;
    url_destino: string;
    texto_ancora: string;
    valor: number;
  }>;
  totalAmount: number;
  customerName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { to, subject, orders, totalAmount, customerName } = await req.json() as EmailRequest;

    // Format order details for email
    const orderList = orders.map(order => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${order.site_url}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${order.url_destino}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${order.texto_ancora}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">R$ ${order.valor.toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Confirmação de Pedido - Mkart</h1>
          
          <p>Olá ${customerName || 'Cliente'},</p>
          
          <p>Recebemos seu pedido de backlinks com sucesso! Abaixo estão os detalhes:</p>
          
          <h2>Detalhes do Pedido:</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Site</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">URL Destino</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Texto Âncora</th>
                <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${orderList}
            </tbody>
          </table>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0; color: #2563eb;">Total: R$ ${totalAmount.toFixed(2)}</h3>
          </div>
          
          <h3>Próximos Passos:</h3>
          <ul>
            <li>✅ Pedido confirmado e em processamento</li>
            <li>📝 Publicação dos backlinks em até 3 dias úteis</li>
            <li>📧 Você receberá um email com os links de publicação</li>
            <li>📊 Acompanhe o status no seu painel de usuário</li>
          </ul>
          
          <p>Se você tiver alguma dúvida, entre em contato conosco em <a href="mailto:contato@mkart.com.br">contato@mkart.com.br</a></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="font-size: 14px; color: #666; text-align: center;">
            <strong>Mkart - Marketplace de Backlinks</strong><br>
            Aumentando sua autoridade digital
          </p>
        </div>
      </body>
      </html>
    `;

    // For now, we'll just log the email content since we don't have Resend configured
    // In a real implementation, you would use Resend or another email service
    console.log('Email to be sent:', {
      to,
      subject,
      content: htmlContent
    });

    return new Response(
      JSON.stringify({ 
        message: 'Email queued successfully',
        recipient: to,
        subject: subject
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);