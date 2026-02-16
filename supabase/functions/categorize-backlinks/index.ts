import { createClient } from "https://esm.sh/@supabase/supabase-js@2.93.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = [
  "Notícias", "Negócios", "Saúde", "Educação", "Tecnologia",
  "Finanças", "Imóveis", "Moda", "Turismo", "Alimentação",
  "Pets", "Automotivo", "Esportes", "Entretenimento", "Marketing",
  "Direito", "Maternidade",
];

async function scrapeUrl(url: string, apiKey: string): Promise<string | null> {
  try {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 5000,
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl error for ${url}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const markdown = data?.data?.markdown || data?.markdown || "";
    // Limit content to ~2000 chars to save tokens
    return markdown.slice(0, 2000) || null;
  } catch (err) {
    console.error(`Scrape failed for ${url}:`, err);
    return null;
  }
}

async function classifyWithAI(
  sites: Array<{ id: string; domain: string; content: string | null }>,
  apiKey: string,
  provider: "openai" | "gemini" = "openai"
): Promise<Array<{ id: string; category: string }>> {
  const prompt = sites
    .map(
      (s, i) =>
        `Site ${i + 1} (ID: ${s.id}, Domínio: ${s.domain}):\n${s.content || `Sem conteúdo disponível. Analise apenas o domínio: ${s.domain}`}`
    )
    .join("\n\n---\n\n");

  const systemPrompt = `Você é um classificador de sites brasileiro. Para cada site abaixo, classifique em UMA das categorias:
${CATEGORIES.join(", ")}.

Responda em formato JSON array, ex: [{"id":"xxx","category":"Tecnologia"},...]
Use EXATAMENTE os nomes das categorias listados acima (com acentos).
Responda APENAS o JSON, sem markdown, sem explicação.`;

  const isGemini = provider === "gemini";
  const endpoint = isGemini
    ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
    : "https://api.openai.com/v1/chat/completions";
  const model = isGemini ? "gemini-2.0-flash" : "gpt-4o-mini";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`AI gateway error: ${response.status} ${errText}`);
      throw new Error(`AI error ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || "";

    // Extract JSON from response (handle possible markdown wrapping)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("AI response not valid JSON:", text);
      throw new Error("Invalid AI response");
    }

    const results = JSON.parse(jsonMatch[0]) as Array<{
      id: string;
      category: string;
    }>;

    // Validate categories
    return results.map((r) => ({
      id: r.id,
      category: CATEGORIES.includes(r.category) ? r.category : "Geral",
    }));
  } catch (err) {
    console.error("AI classification failed:", err);
    // Return all as Geral on failure
    return sites.map((s) => ({ id: s.id, category: "Geral" }));
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    // Verify user is admin
    const supabaseAuth = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Acesso negado - somente admin" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { sites, provider = "openai" } = await req.json() as {
      sites: Array<{ id: string; url: string; domain: string }>;
      provider?: "openai" | "gemini";
    };

    // Validate API key for chosen provider
    const aiKey = provider === "gemini" ? geminiKey : openaiKey;
    if (!aiKey) {
      return new Response(
        JSON.stringify({ error: `${provider === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY"} não configurada` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!sites || !Array.isArray(sites) || sites.length === 0) {
      return new Response(
        JSON.stringify({ error: "Lista de sites vazia" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Scrape all sites
    const scrapedSites = await Promise.all(
      sites.map(async (site) => {
        const content = await scrapeUrl(site.url, firecrawlKey);
        return { id: site.id, domain: site.domain, content };
      })
    );

    // Step 2: Classify with AI
    const classifications = await classifyWithAI(scrapedSites, aiKey, provider);

    // Step 3: Update database
    const results = [];
    for (const classification of classifications) {
      if (classification.category === "Geral") {
        results.push({
          id: classification.id,
          domain: sites.find((s) => s.id === classification.id)?.domain || "",
          old_category: "Geral",
          new_category: "Geral",
          status: "skipped",
        });
        continue;
      }

      const { error: updateError } = await supabaseAdmin
        .from("backlinks")
        .update({ category: classification.category })
        .eq("id", classification.id);

      const site = sites.find((s) => s.id === classification.id);
      results.push({
        id: classification.id,
        domain: site?.domain || "",
        old_category: "Geral",
        new_category: classification.category,
        status: updateError ? "error" : "updated",
        error: updateError?.message,
      });
    }

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("categorize-backlinks error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
