import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SECRET_KEY = Deno.env.get('SEO_HEALTH_SECRET') || 'dev-secret-123';

async function runSEOHealthCheck() {
  const startTime = Date.now();
  const issues = [];
  let checked = 0;
  
  try {
    // Mock health check - in production this would connect to your monitoring systems
    const mockCategories = [
      { slug: 'tecnologia', title: 'Tecnologia' },
      { slug: 'financas', title: 'Finanças' },
      { slug: 'saude', title: 'Saúde' }
    ];
    
    checked = mockCategories.length;
    
    // Simulate some checks
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const score = 85; // Mock score
    
    return {
      ok: score >= 70,
      issues,
      checked,
      summary: {
        score,
        total: checked,
        existing: checked,
        missing: 0,
        withIssues: 0
      },
      duration: Date.now() - startTime
    };
    
  } catch (error) {
    issues.push(`Health check error: ${error.message}`);
    return {
      ok: false,
      issues,
      checked: 0,
      summary: { score: 0 },
      duration: Date.now() - startTime
    };
  }
}

serve(async (req) => {
  // CORS headers
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Secret-Key',
    'Content-Type': 'application/json',
  });
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }
  
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers }
    );
  }
  
  // Check authentication
  const providedSecret = req.headers.get('x-secret-key') || 
                        req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!providedSecret || providedSecret !== SECRET_KEY) {
    return new Response(
      JSON.stringify({ 
        error: 'Unauthorized',
        message: 'Header X-Secret-Key obrigatório'
      }),
      { status: 401, headers }
    );
  }
  
  try {
    console.log('🩺 [SEO HEALTH] Executando verificação...');
    
    const result = await runSEOHealthCheck();
    
    const response = {
      ok: result.ok,
      issues: result.issues,
      checked: result.checked,
      summary: result.summary,
      meta: {
        timestamp: new Date().toISOString(),
        duration: `${result.duration}ms`,
        version: '1.0.0',
        endpoint: '__health/seo',
        environment: Deno.env.get('ENVIRONMENT') || 'production'
      }
    };
    
    console.log(`✅ [SEO HEALTH] Score: ${result.summary.score}% em ${result.duration}ms`);
    
    return new Response(
      JSON.stringify(response, null, 2),
      { status: 200, headers }
    );
    
  } catch (error) {
    console.error('❌ [SEO HEALTH] Erro:', error.message);
    
    return new Response(
      JSON.stringify({
        ok: false,
        issues: [`Health check failed: ${error.message}`],
        checked: 0,
        meta: {
          timestamp: new Date().toISOString(),
          error: error.message,
          environment: Deno.env.get('ENVIRONMENT') || 'production'
        }
      }, null, 2),
      { status: 500, headers }
    );
  }
});

console.log('🩺 SEO Health Check endpoint rodando em /__health/seo');