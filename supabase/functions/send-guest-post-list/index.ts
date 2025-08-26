import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { GuestPostListEmail } from "./_templates/guest-post-list-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GuestPostEmailRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Guest post list email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: GuestPostEmailRequest = await req.json();
    console.log("Processing guest post list email for:", email);

    const html = await renderAsync(
      React.createElement(GuestPostListEmail, {
        listUrl: "https://docs.google.com/spreadsheets/d/1fFdVBKQ0HG7kB12Y2-K1ZFqJc-awz_22TCL8oyJcNDo/edit?usp=sharing",
      })
    );

    const emailResponse = await resend.emails.send({
      from: "MK Art SEO <noreply@mkart.com.br>",
      to: [email],
      subject: "🎉 Sua Lista de 30 Sites para Guest Post DR 20-90 está aqui!",
      html,
    });

    console.log("Guest post list email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending guest post list email:", error);
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