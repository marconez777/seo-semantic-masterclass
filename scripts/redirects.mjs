// Endereços antigos que têm página equivalente: 301 direto para ela, em um salto,
// com ou sem barra no fim. Fonte para o Nginx (npm run nginx:gerar) e para o
// servidor local (npm run preview:ssg).
// De onde vêm: sitemap antigo que não virou página (conferir-build da skill) e o log
// de 404 do Nginx das primeiras semanas. Cada um combinado com o dono do site.
export const REDIRECTS = {
  // O pacote personalizado é pelo WhatsApp e não tem página: o React já mandava para a
  // vitrine no navegador (PacoteBacklinks.tsx, ctaType "whatsapp").
  "/pacote-backlinks/personalizado": "/comprar-backlinks",
};
