#!/usr/bin/env node

/**
 * Agendamento de QA SEO
 * Executa verificações automáticas de SEO
 */

import { execSync } from 'child_process';
import { runSEOCheck } from './qa-seo.mjs';

const CRON_SECRET = process.env.CRON_SECRET || 'cron-dev-123';

async function scheduledSEOCheck() {
  const timestamp = new Date().toISOString();
  console.log(`🕐 [${timestamp}] Iniciando QA SEO agendado...`);
  
  try {
    const result = await runSEOCheck();
    
    console.log(`📊 [QA CRON] Score: ${result.summary.score}% | Issues: ${result.issues.length}`);
    
    // Log para monitoramento
    const logEntry = {
      timestamp,
      type: 'scheduled_qa',
      score: result.summary.score,
      issues: result.issues.length,
      checked: result.checked,
      ok: result.ok
    };
    
    console.log('📋 [QA CRON] Resultado:', JSON.stringify(logEntry));
    
    // Se score muito baixo, enviar alerta
    if (result.summary.score < 50) {
      console.error('🚨 [ALERTA] Score SEO crítico!');
      console.error('Issues:', result.issues.slice(0, 5));
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ [QA CRON] Erro:', error.message);
    throw error;
  }
}

// Endpoint para webhook/cron
export async function handleCronRequest(request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };
  
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('authorization') || request.headers.get('x-cron-secret');
    
    if (authHeader !== `Bearer ${CRON_SECRET}` && authHeader !== CRON_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers }
      );
    }
    
    const result = await scheduledSEOCheck();
    
    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        result: {
          score: result.summary.score,
          issues: result.issues.length,
          checked: result.checked,
          ok: result.ok
        }
      }),
      { status: 200, headers }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers }
    );
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  scheduledSEOCheck().catch(error => {
    console.error('Cron job failed:', error);
    process.exit(1);
  });
}