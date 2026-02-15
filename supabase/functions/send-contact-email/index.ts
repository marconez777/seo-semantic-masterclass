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

// Simple in-memory rate limiter (per IP, 3 requests per minute)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) return true;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(clientIp)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
      status: 429,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const { name, email, message }: ContactEmailRequest = await req.json();

    // Validate inputs
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return new Response(JSON.stringify({ error: "Invalid name" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    if (!email || typeof email !== 'string' || !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email.trim())) {
      return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    if (!message || typeof message !== 'string' || message.trim().length < 5 || message.trim().length > 5000) {
      return new Response(JSON.stringify({ error: "Invalid message" }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // Sanitize inputs to prevent HTML injection in emails
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const safeName = esc(name || '');
    const safeEmail = esc(email || '');
    const safeMessage = esc(message || '').replace(/\n/g, '<br>');

    // Send email to company
    const companyEmailResponse = await resend.emails.send({
      from: "Contato MK Art <contato@mkart.com.br>",
      to: ["contato@mkart.com.br"],
      subject: `Nova mensagem de contato - ${safeName}`,
      html: `
        <h2>Nova mensagem de contato</h2>
        <p><strong>Nome:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${safeMessage}</p>
      `,
    });

    // Send confirmation email to user
    const userEmailResponse = await resend.emails.send({
      from: "MK Art Agência <contato@mkart.com.br>",
      to: [email],
      subject: "Recebemos sua mensagem!",
      html: `
        <h1>Obrigado pelo contato, ${safeName}!</h1>
        <p>Recebemos sua mensagem e retornaremos o mais breve possível.</p>
        <p>Sua mensagem:</p>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 5px;">${safeMessage}</p>
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
      JSON.stringify({ error: "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
