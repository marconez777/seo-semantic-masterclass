import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SERPBOT_API = "https://api.serprobot.com/v1/api.php";

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
  const res = await fetch(url);
  const data = await res.json();

  const position = data?.pos ?? null;
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

  return { keyword_id: kw.id, keyword: kw.keyword, position, previous_position: previousPosition };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, ...params } = await req.json();
    const apiKey = Deno.env.get("SERPBOT_API_KEY")!;

    // Action: cron_monthly_check (no auth required, uses service role)
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
        }
      }

      return new Response(JSON.stringify({ results: allResults }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Auth required for other actions
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
