// Roteador das edge functions na stack própria do site (/opt/supabase/mkart).
//
// No Supabase em nuvem cada função tem o seu `verify_jwt`. No auto-hospedado o roteador
// de fábrica tem um interruptor só para todas (o próprio molde diz "TODO: Allow
// configuring VERIFY_JWT per function"). As funções deste site são públicas: o site as
// chama só com o cabeçalho `apikey`, sem `Authorization`.
//
// Este arquivo é o roteador de fábrica (self-hosted v0.8.2) com três mudanças:
//   1. decide por função, lendo `_manifesto-verify-jwt.json`;
//   2. função que não está no manifesto é FECHADA. Função nova entra no manifesto no
//      mesmo commit, ou só responde com JWT válido;
//   3. memória e tempo por função iguais aos da nuvem (256 MB, 400 s), não 150 MB e 60 s.
//
// Fica em ops/supabase/main/ e é copiado para volumes/functions/main/ por
// ops/supabase/publicar-funcoes.sh. Nenhuma função do site se chama `main`.

import * as jose from 'jsr:@panva/jose@6'

const FUNCOES = '/home/deno/functions'
const JWT_SECRET = Deno.env.get('JWT_SECRET')
const SUPABASE_JWKS = parseJwks(Deno.env.get('SUPABASE_JWKS'))
const LOCAL_JWKS = SUPABASE_JWKS ? jose.createLocalJWKSet(SUPABASE_JWKS) : null

// Nome de função válido: é também nome de pasta. Sem isto, `..` no caminho escolheria
// outra pasta do volume.
const NOME_VALIDO = /^[a-z0-9][a-z0-9-]*$/

const MANIFESTO = lerManifesto()
console.log(
  `roteador: ${MANIFESTO.size} funções no manifesto, ` +
    `${[...MANIFESTO.values()].filter((v) => !v).length} abertas`,
)

function lerManifesto(): Map<string, boolean> {
  try {
    const bruto = JSON.parse(Deno.readTextFileSync(`${FUNCOES}/_manifesto-verify-jwt.json`))
    return new Map(Object.entries(bruto.funcoes as Record<string, boolean>))
  } catch (e) {
    // Sem manifesto, tudo fechado: os endpoints públicos param, e isso aparece na hora.
    // O contrário — tudo aberto — não apareceria.
    console.error('roteador: manifesto ilegível, TODAS as funções exigem JWT', e)
    return new Map()
  }
}

type FalhaDeAuth = { code: string; message?: string }

function parseJwks(raw: string | undefined): jose.JSONWebKeySet | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    return parsed?.keys && Array.isArray(parsed.keys) && parsed.keys.length > 0
      ? (parsed as jose.JSONWebKeySet)
      : null
  } catch {
    return null
  }
}

function tokenDoPedido(req: Request): string | FalhaDeAuth {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return { code: 'UNAUTHORIZED_NO_AUTH_HEADER', message: 'Missing authorization header' }
  }
  const partes = authHeader.trim().split(/\s+/)
  const [bearer, token] = partes
  if (bearer.toLowerCase() !== 'bearer' || partes.length !== 2 || !token) {
    return { code: 'UNAUTHORIZED_INVALID_JWT_FORMAT', message: 'Invalid JWT format' }
  }
  return token
}

function respostaDeFalha({ code, message = 'Invalid JWT' }: FalhaDeAuth) {
  return Response.json(
    { code, message, msg: message },
    {
      status: 401,
      headers: { 'sb-error-code': code, 'Access-Control-Expose-Headers': 'sb-error-code' },
    },
  )
}

// HS256 é a chave legada (anon e service_role, e o que o cron manda pelo Vault);
// ES256/RS256 é o login dos usuários.
async function conferirJwt(jwt: string): Promise<FalhaDeAuth | null> {
  let alg: string | undefined
  try {
    alg = jose.decodeProtectedHeader(jwt).alg
  } catch {
    return { code: 'UNAUTHORIZED_INVALID_JWT_FORMAT', message: 'Invalid JWT format' }
  }
  try {
    if (alg === 'HS256') {
      if (!JWT_SECRET) return { code: 'UNAUTHORIZED_LEGACY_JWT' }
      await jose.jwtVerify(jwt, new TextEncoder().encode(JWT_SECRET))
      return null
    }
    if (alg === 'ES256' || alg === 'RS256') {
      if (!LOCAL_JWKS) return { code: 'UNAUTHORIZED_ASYMMETRIC_JWT' }
      await jose.jwtVerify(jwt, LOCAL_JWKS)
      return null
    }
  } catch {
    return { code: alg === 'HS256' ? 'UNAUTHORIZED_LEGACY_JWT' : 'UNAUTHORIZED_ASYMMETRIC_JWT' }
  }
  return {
    code: 'UNAUTHORIZED_UNSUPPORTED_TOKEN_ALGORITHM',
    message: `Unsupported JWT algorithm ${alg}`,
  }
}

Deno.serve(async (req: Request) => {
  const nome = new URL(req.url).pathname.split('/')[1]

  if (!nome || !NOME_VALIDO.test(nome) || nome === 'main') {
    return Response.json({ msg: 'missing or invalid function name in request' }, { status: 400 })
  }

  // Função que não existe é 404, como na nuvem — antes de qualquer conferência, para
  // quem errou o nome não receber um 401 que parece problema de credencial.
  try {
    Deno.statSync(`${FUNCOES}/${nome}/index.ts`)
  } catch {
    return Response.json(
      { code: 'NOT_FOUND', message: 'Requested function was not found' },
      { status: 404 },
    )
  }

  const exigeJwt = MANIFESTO.get(nome) ?? true
  if (exigeJwt && req.method !== 'OPTIONS') {
    const token = tokenDoPedido(req)
    if (typeof token !== 'string') return respostaDeFalha(token)
    const falha = await conferirJwt(token)
    if (falha) return respostaDeFalha(falha)
  }

  const envVarsObj = { ...Deno.env.toObject(), SUPABASE_FUNCTION_SLUG: nome }

  try {
    const worker = await EdgeRuntime.userWorkers.create({
      servicePath: `${FUNCOES}/${nome}`,
      memoryLimitMb: 256,
      workerTimeoutMs: 400 * 1000,
      noModuleCache: false,
      importMapPath: `${FUNCOES}/deno.jsonc`,
      envVars: Object.keys(envVarsObj).map((k) => [k, envVarsObj[k]]),
    })
    return await worker.fetch(req)
  } catch (e) {
    console.error(`roteador: ${nome} falhou ao subir`, e)
    return Response.json({ msg: String(e) }, { status: 500 })
  }
})
