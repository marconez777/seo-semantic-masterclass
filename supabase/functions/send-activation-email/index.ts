import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { ActivationEmail } from "./_templates/activation-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ActivationEmailRequest {
  email: string;
  name: string;
  activation_url: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Activation email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, activation_url }: ActivationEmailRequest = await req.json();
    console.log("Processing activation email for:", email);

    const html = await renderAsync(
      React.createElement(ActivationEmail, {
        name,
        activation_url,
      })
    );

    const emailResponse = await resend.emails.send({
      from: "MK Art SEO <noreply@mkart.com.br>",
      to: [email],
      subject: "Ative sua conta - MK Art SEO",
      html,
    });

    console.log("Activation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending activation email:", error);
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