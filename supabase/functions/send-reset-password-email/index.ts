import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import React from "npm:react@18.3.1";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import { ResetPasswordEmail } from "./_templates/reset-password-email.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordEmailRequest {
  email: string;
  reset_url: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Reset password email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, reset_url }: ResetPasswordEmailRequest = await req.json();
    console.log("Processing reset password email for:", email);

    const html = await renderAsync(
      React.createElement(ResetPasswordEmail, {
        reset_url,
      })
    );

    const emailResponse = await resend.emails.send({
      from: "MK Art SEO <noreply@mkart.com.br>",
      to: [email],
      subject: "Redefinir senha - MK Art SEO",
      html,
    });

    console.log("Reset password email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending reset password email:", error);
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