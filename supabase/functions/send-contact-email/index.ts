import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: ContactEmailRequest = await req.json();

    // Send email to company
    const companyEmailResponse = await resend.emails.send({
      from: "Contato MK Art <onboarding@resend.dev>",
      to: ["contato@mkart.com.br"],
      subject: `Nova mensagem de contato - ${name}`,
      html: `
        <h2>Nova mensagem de contato</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "MK Art Agência <onboarding@resend.dev>",
      to: [email],
      subject: "Recebemos sua mensagem!",
      html: `
        <h1>Obrigado pelo contato, ${name}!</h1>
        <p>Recebemos sua mensagem e retornaremos o mais breve possível.</p>
        <p>Sua mensagem:</p>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${message.replace(/\n/g, '<br>')}</p>
        <p>Atenciosamente,<br>Equipe MK Art</p>
        <hr>
        <p style="font-size: 12px; color: #666;">
          MK Art Agência de SEO<br>
          Rua Caminho do Pilar, 401 - Santo André – SP<br>
          +55 11 9 8915 1997<br>
          contato@mkart.com.br
        </p>
      `,
    });

    console.log("Emails sent successfully:", { companyEmailResponse, userEmailResponse });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);