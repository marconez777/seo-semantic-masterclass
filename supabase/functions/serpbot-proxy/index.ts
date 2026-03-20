import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SERPBOT_API = "https://api.serprobot.com/v1/api.php";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractPosition(data: any): number | null {
  const pos = data?.pos ?? data?.position ?? null;
  if (pos === null || pos === undefined || pos === 0 || pos === "0") return null;
  return typeof pos === "string" ? parseInt(pos, 10) : pos;
}

async function fetchWithRetry(url: string, keyword: string, maxRetries = 2): Promise<{ position: number | null; rawResponse: any }> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url);
    const httpStatus = res.status;
    const data = await res.json();
    console.log(`[SerpBot] Attempt ${attempt + 1} | Keyword: "${keyword}" | HTTP: ${httpStatus} | Response:`, JSON.stringify(data));

    const position = extractPosition(data);

    if (position !== null) {
      return { position, rawResponse: data };
    }

    if (attempt < maxRetries) {
      const retryDelay = 5000;
      console.log(`[SerpBot] Retry ${attempt + 1}/${maxRetries} for "${keyword}" after ${retryDelay / 1000}s...`);
      await delay(retryDelay);
    } else {
      return { position: null, rawResponse: data };
    }
  }
  return { position: null, rawResponse: null };
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
}

async function saveMonthlySnapshot(
  supabaseAdmin: any,
  keywordId: string,
  position: number | null
) {
  const month = getCurrentMonth();
  if (position === null) return;

  await supabaseAdmin.from("keyword_monthly_snapshots").upsert(
    {
      keyword_id: keywordId,
      month,
      position,
      checked_at: new Date().toISOString(),
    },
    { onConflict: "keyword_id,month" }
  );
}

async function checkAndUpdateKeyword(
  apiKey: string,
  kw: any,
  project: any,
  supabaseAdmin: any
) {
  const url = `${SERPBOT_API}?api_key=${apiKey}&action=rank_check&keyword=${encodeURIComponent(kw.keyword)}&target_url=${encodeURIComponent(project.domain)}&region=${encodeURIComponent(project.region)}&device=${encodeURIComponent(project.device)}`;
  const { position, rawResponse } = await fetchWithRetry(url, kw.keyword);

  const previousPosition = kw.current_position;
  const bestPosition =
    position !== null
      ? kw.best_position !== null
        ? Math.min(kw.best_position, position)
        : position
      : kw.best_position;

  await supabaseAdmin
    .from("tracked_keywords")
    .update({
      current_position: position,
      previous_position: previousPosition,
      best_position: bestPosition,
      last_checked_at: new Date().toISOString(),
    })
    .eq("id", kw.id);

  await supabaseAdmin.from("keyword_history").insert({
    keyword_id: kw.id,
    position,
  });

  await saveMonthlySnapshot(supabaseAdmin, kw.id, position);

  return { keyword_id: kw.id, keyword: kw.keyword, position, previous_position: previousPosition, raw: rawResponse };
}

async function checkConsultingKeyword(
  apiKey: string,
  kw: any,
  domain: string,
  supabaseAdmin: any
) {
  const url = `${SERPBOT_API}?api_key=${apiKey}&action=rank_check&keyword=${encodeURIComponent(kw.keyword)}&target_url=${encodeURIComponent(domain)}&region=www.google.com.br&device=desktop`;
  const { position, rawResponse } = await fetchWithRetry(url, kw.keyword);

  const previousPosition = kw.current_position;
  const bestPosition =
    position !== null
      ? kw.best_position !== null
        ? Math.min(kw.best_position, position)
        : position
      : kw.best_position;

  const month = getCurrentMonth();

  await supabaseAdmin
    .from("consulting_keywords")
    .update({
      current_position: position,
      previous_position: previousPosition,
      best_position: bestPosition,
      last_checked_at: new Date().toISOString(),
    })
    .eq("id", kw.id);

  if (position !== null) {
    await supabaseAdmin.from("consulting_keyword_snapshots").upsert(
      {
        keyword_id: kw.id,
        month,
        position,
        checked_at: new Date().toISOString(),
      },
      { onConflict: "keyword_id,month" }
    );
  }

  return { keyword_id: kw.id, keyword: kw.keyword, position, previous_position: previousPosition, raw: rawResponse };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    const apiKey = Deno.env.get("SERPBOT_API_KEY")!;

    // === CRON ACTIONS (no auth required, uses service role) ===

    if (action === "cron_monthly_check") {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: projects, error: projErr } = await supabaseAdmin
        .from("keyword_projects")
        .select("*");

      if (projErr || !projects) {
        return new Response(JSON.stringify({ error: "Failed to fetch projects" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const allResults = [];

      for (const project of projects) {
        const { data: keywords } = await supabaseAdmin
          .from("tracked_keywords")
          .select("*")
          .eq("project_id", project.id);

        if (!keywords || keywords.length === 0) continue;

        for (const kw of keywords) {
          try {
            const result = await checkAndUpdateKeyword(apiKey, kw, project, supabaseAdmin);
            allResults.push(result);
          } catch (e) {
            allResults.push({ keyword_id: kw.id, keyword: kw.keyword, error: String(e) });
          }
          await delay(3000);
        }
      }

      return new Response(JSON.stringify({ results: allResults }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "cron_consulting_check") {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: clients, error: clErr } = await supabaseAdmin
        .from("consulting_clients")
        .select("*")
        .eq("status", "ativo");

      if (clErr || !clients) {
        return new Response(JSON.stringify({ error: "Failed to fetch consulting clients" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const allResults = [];

      for (const client of clients) {
        const { data: keywords } = await supabaseAdmin
          .from("consulting_keywords")
          .select("*")
          .eq("client_id", client.id);

        if (!keywords || keywords.length === 0) continue;

        for (const kw of keywords) {
          try {
            const result = await checkConsultingKeyword(apiKey, kw, client.domain, supabaseAdmin);
            allResults.push(result);
          } catch (e) {
            allResults.push({ keyword_id: kw.id, keyword: kw.keyword, error: String(e) });
          }
          await delay(3000);
        }
      }

      return new Response(JSON.stringify({ results: allResults }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === AUTH REQUIRED ACTIONS ===

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    // Action: credit
    if (action === "credit") {
      const url = `${SERPBOT_API}?api_key=${apiKey}&action=credit`;
      const res = await fetch(url);
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: rank_check (single keyword)
    if (action === "rank_check") {
      const { keyword, domain, region, device } = params;
      if (!keyword || !domain || !region) {
        return new Response(JSON.stringify({ error: "Missing required params" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const url = `${SERPBOT_API}?api_key=${apiKey}&action=rank_check&keyword=${encodeURIComponent(keyword)}&target_url=${encodeURIComponent(domain)}&region=${encodeURIComponent(region)}&device=${encodeURIComponent(device || "desktop")}`;
      const res = await fetch(url);
      const data = await res.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: check_project (batch check all keywords of a project)
    if (action === "check_project") {
      const { project_id } = params;
      if (!project_id) {
        return new Response(JSON.stringify({ error: "project_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: project, error: projErr } = await supabase
        .from("keyword_projects")
        .select("*")
        .eq("id", project_id)
        .single();

      if (projErr || !project) {
        return new Response(JSON.stringify({ error: "Project not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (project.user_id !== userId) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: keywords, error: kwErr } = await supabase
        .from("tracked_keywords")
        .select("*")
        .eq("project_id", project_id);

      if (kwErr) {
        return new Response(JSON.stringify({ error: "Failed to fetch keywords" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!keywords || keywords.length === 0) {
        return new Response(JSON.stringify({ message: "No keywords to check", results: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results = [];

      for (const kw of keywords) {
        try {
          const result = await checkAndUpdateKeyword(apiKey, kw, project, supabase);
          results.push(result);
        } catch (e) {
          results.push({ keyword_id: kw.id, keyword: kw.keyword, error: String(e) });
        }
        await delay(3000);
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: check_consulting_batch (batch check consulting keywords with offset/limit)
    if (action === "check_consulting_batch") {
      const { client_id, offset = 0, batch_size = 10 } = params;
      if (!client_id) {
        return new Response(JSON.stringify({ error: "client_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Verify user is admin
      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        return new Response(JSON.stringify({ error: "Forbidden - admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: client, error: clErr } = await supabaseAdmin
        .from("consulting_clients")
        .select("*")
        .eq("id", client_id)
        .single();

      if (clErr || !client) {
        return new Response(JSON.stringify({ error: "Client not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get total count
      const { count: total } = await supabaseAdmin
        .from("consulting_keywords")
        .select("id", { count: "exact", head: true })
        .eq("client_id", client_id);

      // Get batch
      const { data: keywords, error: kwErr } = await supabaseAdmin
        .from("consulting_keywords")
        .select("*")
        .eq("client_id", client_id)
        .order("id", { ascending: true })
        .range(offset, offset + batch_size - 1);

      if (kwErr) {
        return new Response(JSON.stringify({ error: "Failed to fetch keywords" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!keywords || keywords.length === 0) {
        return new Response(JSON.stringify({ results: [], total: total || 0, offset, has_more: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results = [];

      for (const kw of keywords) {
        try {
          const result = await checkConsultingKeyword(apiKey, kw, client.domain, supabaseAdmin);
          results.push(result);
        } catch (e) {
          results.push({ keyword_id: kw.id, keyword: kw.keyword, error: String(e) });
        }
        await delay(3000);
      }

      const nextOffset = offset + keywords.length;
      const hasMore = nextOffset < (total || 0);

      return new Response(JSON.stringify({ results, total: total || 0, offset, has_more: hasMore }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Action: check_consulting_client (kept for backward compat but redirects to batch)
    if (action === "check_consulting_client") {
      const { client_id } = params;
      if (!client_id) {
        return new Response(JSON.stringify({ error: "client_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        return new Response(JSON.stringify({ error: "Forbidden - admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: client, error: clErr } = await supabaseAdmin
        .from("consulting_clients")
        .select("*")
        .eq("id", client_id)
        .single();

      if (clErr || !client) {
        return new Response(JSON.stringify({ error: "Client not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: keywords, error: kwErr } = await supabaseAdmin
        .from("consulting_keywords")
        .select("*")
        .eq("client_id", client_id);

      if (kwErr) {
        return new Response(JSON.stringify({ error: "Failed to fetch keywords" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!keywords || keywords.length === 0) {
        return new Response(JSON.stringify({ message: "No keywords to check", results: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results = [];

      for (const kw of keywords) {
        try {
          const result = await checkConsultingKeyword(apiKey, kw, client.domain, supabaseAdmin);
          results.push(result);
        } catch (e) {
          results.push({ keyword_id: kw.id, keyword: kw.keyword, error: String(e) });
        }
        await delay(3000);
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
