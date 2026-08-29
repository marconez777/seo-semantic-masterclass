import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

/**
 * Envia por e-mail um pedido da modalidade PACOTE (/pacote-backlinks/:slug).
 *
 * NAO grava nada no banco: nesta primeira versao o pedido de pacote vive so no
 * e-mail que chega para a MK. O painel (/admin) continua atendendo apenas a
 * compra avulsa. Quando o pacote for para o painel, esta funcao passa a gravar
 * em orders_new — ate la, se o e-mail falhar, o pedido se perde, e por isso a
 * pagina so mostra sucesso quando esta funcao responde 200.
 *
 * Roda com verify_jwt = false porque a compra aceita visitante sem cadastro.
 * Todo o body e' tratado como hostil: o preco vem do catalogo daqui, nunca do
 * navegador, e os campos de texto sao limitados antes de entrar no e-mail.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "contato@mkart.com.br";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

/**
 * Espelho de src/lib/packages.ts. Se um preco mudar la, muda aqui tambem —
 * o frontend so mostra o valor, quem decide o que sera cobrado e' este arquivo.
 */
const PACKAGES: Record<
  string,
  { name: string; quantity: number; daMin: number; daMax: number; price: number; anchorServicePrice: number }
> = {
  basico: { name: "Basico", quantity: 20, daMin: 20, daMax: 30, price: 197, anchorServicePrice: 97 },
  medio: { name: "Medio", quantity: 20, daMin: 30, daMax: 40, price: 497, anchorServicePrice: 0 },
};

const MAX_ANCHOR_LEN = 200;
const MAX_URL_LEN = 500;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value || value.length > MAX_URL_LEN) return false;
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

function clean(value: unknown, maxLen: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

/** O conteudo vem do visitante e vai para dentro de um e-mail HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function brl(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return json({ error: "Corpo da requisicao invalido" }, 400);
    }

    // ---- pacote ----
    const slug = clean(body.package_slug, 40);
    const pkg = slug ? PACKAGES[slug] : undefined;
    if (!pkg || !slug) {
      return json({ error: "Pacote invalido" }, 400);
    }

    // ---- contato ----
    const contact = body.contact ?? {};
    const name = clean(contact.name, 120);
    const email = clean(contact.email, 200);
    const phone = clean(contact.phone, 40);

    if (!name) return json({ error: "Informe o nome" }, 400);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: "E-mail invalido" }, 400);
    }
    if (!phone) return json({ error: "Informe o WhatsApp" }, 400);

    // ---- ancoras ----
    const anchorsByMk = body.anchors_by_mk === true;
    const customerSite = clean(body.customer_site, MAX_URL_LEN);

    const links: { anchor_text: string | null; target_url: string }[] = [];

    if (anchorsByMk) {
      if (!isHttpUrl(customerSite)) {
        return json({ error: "Informe o site de destino" }, 400);
      }
    } else {
      const rawLinks = Array.isArray(body.links) ? body.links : [];
      if (rawLinks.length !== pkg.quantity) {
        return json(
          { error: `Este pacote precisa de exatamente ${pkg.quantity} paginas de destino` },
          400
        );
      }
      for (const link of rawLinks) {
        const targetUrl = clean(link?.target_url, MAX_URL_LEN);
        if (!isHttpUrl(targetUrl)) {
          return json({ error: "Ha uma URL de destino invalida na lista" }, 400);
        }
        links.push({
          anchor_text: clean(link?.anchor_text, MAX_ANCHOR_LEN),
          target_url: targetUrl,
        });
      }
    }

    // ---- total calculado no servidor ----
    const anchorServicePrice = anchorsByMk ? pkg.anchorServicePrice : 0;
    const total = pkg.price + anchorServicePrice;

    const recebidoEm = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

    const linhasHtml = anchorsByMk
      ? `<tr><td colspan="3" style="padding:8px;color:#5f5e5a;">
           O cliente pediu que a MK escolha as ancoras e as paginas.
           Site de destino: <strong>${escapeHtml(customerSite!)}</strong>
         </td></tr>`
      : links
          .map(
            (l, i) => `
            <tr>
              <td style="padding:6px 8px;border-top:1px solid #eee;">${i + 1}</td>
              <td style="padding:6px 8px;border-top:1px solid #eee;">${
                l.anchor_text ? escapeHtml(l.anchor_text) : "<em>sem ancora</em>"
              }</td>
              <td style="padding:6px 8px;border-top:1px solid #eee;">${escapeHtml(l.target_url)}</td>
            </tr>`
          )
          .join("");

    const html = `
      <div style="font-family:sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#1a1a2e;">
        <h2 style="margin:0 0 4px;">Novo pedido de pacote</h2>
        <p style="margin:0 0 20px;color:#5f5e5a;">Recebido em ${recebidoEm}</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:6px 0;width:170px;"><strong>Pacote</strong></td>
              <td>${pkg.name} — ${pkg.quantity} backlinks, DA ${pkg.daMin} a ${pkg.daMax}</td></tr>
          <tr><td style="padding:6px 0;"><strong>Ancoras pela MK</strong></td>
              <td>${anchorsByMk ? `sim (${brl(anchorServicePrice)})` : "nao, o cliente informou"}</td></tr>
          <tr><td style="padding:6px 0;"><strong>Total a receber</strong></td>
              <td style="font-size:18px;"><strong>${brl(total)}</strong></td></tr>
        </table>

        <h3 style="margin:0 0 8px;">Cliente</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
          <tr><td style="padding:6px 0;width:170px;"><strong>Nome</strong></td><td>${escapeHtml(name)}</td></tr>
          <tr><td style="padding:6px 0;"><strong>E-mail</strong></td><td>${escapeHtml(email)}</td></tr>
          <tr><td style="padding:6px 0;"><strong>WhatsApp</strong></td><td>${escapeHtml(phone)}</td></tr>
          ${customerSite ? `<tr><td style="padding:6px 0;"><strong>Site</strong></td><td>${escapeHtml(customerSite)}</td></tr>` : ""}
        </table>

        <h3 style="margin:0 0 8px;">Ancoras e paginas de destino</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${anchorsByMk ? "" : '<tr><th align="left" style="padding:6px 8px;">#</th><th align="left" style="padding:6px 8px;">Ancora</th><th align="left" style="padding:6px 8px;">Destino</th></tr>'}
          ${linhasHtml}
        </table>

        <p style="margin-top:24px;color:#5f5e5a;font-size:13px;">
          <strong>Mande a chave PIX para o cliente</strong> — ela nao aparece no site.
          Este pedido nao esta gravado no banco — ele existe apenas neste e-mail.
        </p>
      </div>`;

    const { error: sendError } = await resend.emails.send({
      from: "MK Art SEO <contato@mkart.com.br>",
      to: [ADMIN_EMAIL],
      replyTo: email,
      subject: `Novo pedido de pacote ${pkg.name} — ${brl(total)} — ${name}`,
      html,
    });

    if (sendError) {
      // Sem banco, e-mail que nao sai e' pedido perdido: o cliente precisa saber.
      console.error("Falha ao enviar pedido de pacote:", sendError);
      return json({ error: "Nao foi possivel enviar o pedido" }, 502);
    }

    return json({ ok: true, total });
  } catch (error) {
    console.error("Erro inesperado em send-package-order:", error);
    return json({ error: "Erro interno" }, 500);
  }
};

serve(handler);
