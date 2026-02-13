import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SERPBOT_API = "https://api.serprobot.com/v1/api.php";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const { action, ...params } = await req.json();
    const apiKey = Deno.env.get("SERPBOT_API_KEY")!;

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
        return new Response(
          JSON.stringify({ error: "Missing required params" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
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
        return new Response(
          JSON.stringify({ error: "project_id required" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Verify ownership
      const { data: project, error: projErr } = await supabase
        .from("keyword_projects")
        .select("*")
        .eq("id", project_id)
        .single();

      if (projErr || !project) {
        return new Response(
          JSON.stringify({ error: "Project not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // RLS already filters by user, but double-check
      if (project.user_id !== userId) {
        return new Response(
          JSON.stringify({ error: "Forbidden" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Get keywords
      const { data: keywords, error: kwErr } = await supabase
        .from("tracked_keywords")
        .select("*")
        .eq("project_id", project_id);

      if (kwErr) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch keywords" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (!keywords || keywords.length === 0) {
        return new Response(
          JSON.stringify({ message: "No keywords to check", results: [] }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const results = [];

      for (const kw of keywords) {
        try {
          const url = `${SERPBOT_API}?api_key=${apiKey}&action=rank_check&keyword=${encodeURIComponent(kw.keyword)}&target_url=${encodeURIComponent(project.domain)}&region=${encodeURIComponent(project.region)}&device=${encodeURIComponent(project.device)}`;
          const res = await fetch(url);
          const data = await res.json();

          const position = data?.position ?? null;
          const previousPosition = kw.current_position;
          const bestPosition =
            position !== null
              ? kw.best_position !== null
                ? Math.min(kw.best_position, position)
                : position
              : kw.best_position;

          // Update keyword
          await supabase
            .from("tracked_keywords")
            .update({
              current_position: position,
              previous_position: previousPosition,
              best_position: bestPosition,
              last_checked_at: new Date().toISOString(),
            })
            .eq("id", kw.id);

          // Insert history
          await supabase.from("keyword_history").insert({
            keyword_id: kw.id,
            position: position,
          });

          results.push({
            keyword_id: kw.id,
            keyword: kw.keyword,
            position,
            previous_position: previousPosition,
          });
        } catch (e) {
          results.push({
            keyword_id: kw.id,
            keyword: kw.keyword,
            error: String(e),
          });
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
