-- Criar tabela page_seo_content para gerenciar conteúdo SEO das páginas de categoria
CREATE TABLE public.page_seo_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text UNIQUE NOT NULL,
  meta_title text,
  meta_description text,
  meta_keywords text,
  h1_title text,
  h2_subtitle text,
  intro_text text,
  main_content text,
  faqs jsonb DEFAULT '[]'::jsonb,
  canonical_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger para updated_at
CREATE TRIGGER update_page_seo_content_updated_at
  BEFORE UPDATE ON public.page_seo_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.page_seo_content ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler (necessário para SEO público)
CREATE POLICY "Public can view page_seo_content"
  ON public.page_seo_content FOR SELECT USING (true);

-- Apenas admins podem gerenciar (criar, editar, deletar)
CREATE POLICY "Admins can manage page_seo_content"
  ON public.page_seo_content FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Inserir dados existentes das páginas atuais (seed)
INSERT INTO public.page_seo_content (page_slug, meta_title, meta_description, meta_keywords, h1_title, h2_subtitle, intro_text, main_content, faqs, canonical_url)
VALUES 
  -- Página principal
  ('comprar-backlinks', 
   'Comprar Backlinks de em Grandes Portais | MK', 
   'Comprar Backlinks de qualidade no Nicho que você escolher. Apareça no Topo do Google e nas Respostas das IAs.', 
   'comprar backlinks, link building, DR, DA, tráfego, preço',
   'Comprar Backlinks em Grandes Portais',
   NULL,
   NULL,
   '## Por que comprar backlinks de qualidade?

Os backlinks são um dos principais fatores de ranqueamento do Google. Quando sites de alta autoridade linkam para o seu, você ganha credibilidade e melhora sua posição nos resultados de busca. Nossa plataforma oferece backlinks em portais verificados com métricas reais.',
   '[{"question":"O que são backlinks e por que são importantes?","answer":"Backlinks são links de outros sites que apontam para o seu. Eles são um dos principais fatores de ranqueamento do Google, pois indicam que seu site é confiável e relevante."},{"question":"Qual a diferença entre DA e DR?","answer":"DA (Domain Authority) é uma métrica da Moz que indica a autoridade de um domínio. DR (Domain Rating) é a métrica equivalente da Ahrefs. Ambas variam de 0 a 100."},{"question":"Como funciona o processo de compra?","answer":"Você escolhe os sites desejados, adiciona ao carrinho e finaliza o pagamento via PIX ou cartão. Após confirmação, produzimos o conteúdo com seu link e publicamos no site escolhido."},{"question":"Quanto tempo leva para o link ser publicado?","answer":"O prazo médio é de 7 a 15 dias úteis após a confirmação do pagamento, dependendo do portal escolhido e da aprovação do conteúdo."},{"question":"Os links são permanentes?","answer":"Sim, todos os nossos backlinks são permanentes e do tipo dofollow, garantindo transferência de autoridade para o seu site."}]'::jsonb,
   'https://mkart.com.br/comprar-backlinks'),
   
  -- Notícias
  ('comprar-backlinks-noticias',
   'Comprar Backlinks Brasileiros de Notícias | MK',
   'Comprar Backlinks de qualidade no Nicho de Notícias. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks notícias, backlinks jornais, backlinks portais, DR, DA, tráfego',
   'Backlinks para Notícias',
   'Compre Backlinks de Qualidade para o nicho de Notícias',
   'Destaque seu site em portais de notícias com alta autoridade.',
   '## Por que Comprar Backlinks em Portais de Notícias?

O setor de notícias é um dos mais relevantes para SEO. Backlinks de qualidade em portais jornalísticos transmitem credibilidade e autoridade para qualquer nicho.

Nossos backlinks são provenientes de sites especializados em notícias e jornalismo, garantindo relevância temática para sua estratégia de SEO.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-noticias'),
   
  -- Negócios
  ('comprar-backlinks-negocios',
   'Comprar Backlinks Brasileiros de Negócios | MK',
   'Comprar Backlinks de qualidade no Nicho de Negócios. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks negócios, backlinks empresas, backlinks B2B, DR, DA, tráfego',
   'Backlinks para Negócios',
   'Compre Backlinks de Qualidade para o nicho Empresarial',
   'Construa autoridade para sua empresa ou startup no topo do Google.',
   '## Por que Comprar Backlinks para Negócios?

O ambiente empresarial exige credibilidade. Backlinks de qualidade em portais de negócios são essenciais para startups e empresas que buscam autoridade online.

Nossos backlinks são provenientes de sites especializados em empreendedorismo, economia e gestão, garantindo relevância temática.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-negocios'),
   
  -- Saúde
  ('comprar-backlinks-saude',
   'Comprar Backlinks Brasileiros de Saúde | MK',
   'Comprar Backlinks de qualidade no Nicho de Saúde. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks saúde, backlinks medicina, backlinks clínicas, DR, DA, tráfego',
   'Backlinks para Saúde',
   'Compre Backlinks de Qualidade para o nicho de Saúde',
   'Construa autoridade para sua clínica ou site de saúde.',
   '## Por que Comprar Backlinks para Saúde?

O setor de saúde exige alta credibilidade (YMYL). Backlinks de qualidade em portais especializados são essenciais para clínicas, médicos e farmácias.

Nossos backlinks são provenientes de sites especializados em saúde e bem-estar, garantindo relevância temática e conformidade com as diretrizes do Google.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-saude'),
   
  -- Educação
  ('comprar-backlinks-educacao',
   'Comprar Backlinks Brasileiros de Educação | MK',
   'Comprar Backlinks de qualidade no Nicho de Educação. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks educação, backlinks cursos, backlinks escolas, DR, DA, tráfego',
   'Backlinks para Educação',
   'Compre Backlinks de Qualidade para o nicho Educacional',
   'Destaque sua escola ou curso online no topo do Google com backlinks de alta autoridade.',
   '## Backlinks Brasileiros para o Nicho de Educação

Apareça nas respostas das IAs e no topo do Google com a autoridade dos nossos backlinks!

O setor educacional online está em constante crescimento. Backlinks de qualidade em portais educacionais são essenciais para destacar sua instituição de ensino ou curso online.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-educacao'),
   
  -- Tecnologia
  ('comprar-backlinks-tecnologia',
   'Comprar Backlinks Brasileiros de Tecnologia | MK',
   'Comprar Backlinks de qualidade no Nicho de Tecnologia. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks tecnologia, backlinks tech, backlinks software, DR, DA, tráfego',
   'Backlinks para Tecnologia',
   'Compre Backlinks de Qualidade para o nicho Tech',
   'Destaque sua startup ou empresa de software no topo do Google.',
   '## Por que Comprar Backlinks para Tecnologia?

O setor de tecnologia é inovador e competitivo. Backlinks de qualidade em portais tech são essenciais para startups, SaaS e empresas de software.

Nossos backlinks são provenientes de sites especializados em tecnologia, inovação e negócios digitais, garantindo relevância temática.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-tecnologia'),
   
  -- Finanças
  ('comprar-backlinks-financas',
   'Comprar Backlinks Brasileiros de Finanças | MK',
   'Comprar Backlinks de qualidade no Nicho de Finanças. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks finanças, backlinks investimentos, backlinks bancos, DR, DA, tráfego',
   'Backlinks para Finanças',
   'Compre Backlinks de Qualidade para o nicho Financeiro',
   'Construa autoridade para sua fintech ou site de investimentos.',
   '## Por que Comprar Backlinks para Finanças?

O setor financeiro exige alta credibilidade. Backlinks de qualidade em portais de finanças e economia são essenciais para construir autoridade no Google.

Nossos backlinks são provenientes de sites especializados em finanças, investimentos e economia, garantindo relevância temática para sua estratégia de SEO.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-financas'),
   
  -- Imóveis
  ('comprar-backlinks-imoveis',
   'Comprar Backlinks Brasileiros de Imóveis e Construção | MK',
   'Comprar Backlinks de qualidade no Nicho Casa e Construção. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks imóveis, backlinks construção, DR, DA, tráfego, preço',
   'Backlinks para Imóveis',
   'Compre Backlinks de Qualidade para o nicho de Imóveis',
   'Apareça com sua agência de viagens ou blog no topo do Google e também nas respostas das principais inteligências artificiais.',
   '## Porque Comprar Backlinks para Imóveis?

O mercado imobiliário é altamente competitivo online. Para destacar sua imobiliária, construtora ou blog sobre imóveis nos resultados de busca, é essencial investir em backlinks de qualidade.

Backlinks especializados no nicho de imóveis e construção aumentam a autoridade do seu site perante os mecanismos de busca, melhorando seu posicionamento para palavras-chave relevantes como "apartamentos à venda", "casas para alugar" ou "construtoras em [sua cidade]".

## Estratégias de SEO para o Setor Imobiliário

O SEO no mercado imobiliário requer uma abordagem específica. Além dos backlinks de qualidade, é importante otimizar páginas para termos locais, criar conteúdo sobre tendências do mercado imobiliário e manter informações atualizadas sobre propriedades.

Nossos backlinks são provenientes de sites relacionados ao setor de construção, decoração, arquitetura e mercado imobiliário, garantindo relevância temática e melhor performance nos rankings de busca.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-imoveis'),
   
  -- Moda
  ('comprar-backlinks-moda',
   'Comprar Backlinks Brasileiros de Moda | MK',
   'Comprar Backlinks de qualidade no Nicho de Moda. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks moda, backlinks fashion, backlinks roupas, DR, DA, tráfego',
   'Backlinks para Moda',
   'Compre Backlinks de Qualidade para o nicho de Moda',
   'Destaque sua loja de moda ou blog de tendências no topo do Google.',
   '## Por que Comprar Backlinks para Moda?

O mercado de moda é visual e competitivo. Backlinks de qualidade em portais de moda são essenciais para e-commerces e blogs de tendências.

Nossos backlinks são provenientes de sites especializados em moda, beleza e lifestyle, garantindo relevância temática para sua estratégia de SEO.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-moda'),
   
  -- Turismo
  ('comprar-backlinks-turismo',
   'Comprar Backlinks Brasileiros de Turismo | MK',
   'Comprar Backlinks de qualidade no Nicho de Turismo. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks turismo, backlinks viagens, backlinks hotéis, DR, DA, tráfego',
   'Backlinks para Turismo',
   'Compre Backlinks de Qualidade para o nicho de Viagens',
   'Destaque sua agência de viagens ou hotel no topo do Google.',
   '## Por que Comprar Backlinks para Turismo?

O setor de turismo é altamente visual e competitivo. Backlinks de qualidade em portais de viagens são essenciais para agências, hotéis e blogs de viagem.

Nossos backlinks são provenientes de sites especializados em turismo, viagens e hospitalidade, garantindo relevância temática para sua estratégia de SEO.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-turismo'),
   
  -- Alimentação
  ('comprar-backlinks-alimentacao',
   'Comprar Backlinks Brasileiros de Alimentação | MK',
   'Comprar Backlinks de qualidade no Nicho de Alimentação. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks alimentação, backlinks gastronomia, backlinks restaurantes, DR, DA, tráfego',
   'Backlinks para Alimentação',
   'Compre Backlinks de Qualidade para o nicho de Gastronomia',
   'Destaque seu restaurante ou blog de receitas no topo do Google.',
   '## Por que Comprar Backlinks para Alimentação?

O setor de alimentação é apaixonante e competitivo. Backlinks de qualidade em portais gastronômicos são essenciais para restaurantes, delivery e blogs de receitas.

Nossos backlinks são provenientes de sites especializados em gastronomia, alimentação e lifestyle, garantindo relevância temática para sua estratégia de SEO.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-alimentacao'),
   
  -- Pets
  ('comprar-backlinks-pets',
   'Comprar Backlinks Brasileiros de Pets | MK',
   'Comprar Backlinks de qualidade no Nicho de Pets. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks pets, backlinks animais, backlinks pet shop, DR, DA, tráfego',
   'Backlinks para Pets',
   'Compre Backlinks de Qualidade para o nicho Pet',
   'Destaque seu pet shop ou clínica veterinária no topo do Google.',
   '## Por que Comprar Backlinks para Pets?

O mercado pet é apaixonado e engajado. Backlinks de qualidade em portais especializados são essenciais para pet shops, clínicas veterinárias e blogs de animais.

Nossos backlinks são provenientes de sites especializados em animais de estimação, garantindo relevância temática para sua estratégia de SEO.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-pets'),
   
  -- Automotivo
  ('comprar-backlinks-automoveis',
   'Comprar Backlinks Brasileiros de Automóveis | MK',
   'Comprar Backlinks de qualidade no Nicho Automotivo. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks automóveis, backlinks carros, backlinks concessionárias, DR, DA, tráfego',
   'Backlinks para Automóveis',
   'Compre Backlinks de Qualidade para o nicho Automotivo',
   'Destaque sua concessionária ou blog automotivo no topo do Google.',
   '## Por que Comprar Backlinks para Automóveis?

O setor automotivo é competitivo e exige autoridade. Backlinks de qualidade em portais automotivos são essenciais para concessionárias, oficinas e blogs de carros.

Nossos backlinks são provenientes de sites especializados em automóveis, motos e veículos, garantindo relevância temática para sua estratégia de SEO.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-automoveis'),
   
  -- Esportes
  ('comprar-backlinks-esportes',
   'Comprar Backlinks Brasileiros de Esportes | MK',
   'Comprar Backlinks de qualidade no Nicho de Esportes. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks esportes, backlinks fitness, backlinks academia, DR, DA, tráfego',
   'Backlinks para Esportes',
   'Compre Backlinks de Qualidade para o nicho Esportivo',
   'Destaque sua academia ou blog de esportes no topo do Google.',
   '## Por que Comprar Backlinks para Esportes?

O setor esportivo é apaixonante e engajado. Backlinks de qualidade em portais esportivos são essenciais para academias, lojas de artigos esportivos e blogs de fitness.

Nossos backlinks são provenientes de sites especializados em esportes, fitness e saúde, garantindo relevância temática para sua estratégia de SEO.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-esportes'),
   
  -- Entretenimento
  ('comprar-backlinks-entretenimento',
   'Comprar Backlinks Brasileiros de Entretenimento | MK',
   'Comprar Backlinks de qualidade no Nicho de Entretenimento. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks entretenimento, backlinks cultura, backlinks eventos, DR, DA, tráfego',
   'Backlinks para Entretenimento',
   'Compre Backlinks de Qualidade para o nicho de Entretenimento',
   'Destaque seu site de cultura ou eventos no topo do Google.',
   '## Por que Comprar Backlinks para Entretenimento?

O setor de entretenimento é dinâmico e popular. Backlinks de qualidade em portais de cultura e lazer são essenciais para sites de eventos, streaming e blogs culturais.

Nossos backlinks são provenientes de sites especializados em entretenimento, música e cultura, garantindo relevância temática para sua estratégia de SEO.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-entretenimento'),
   
  -- Marketing
  ('comprar-backlinks-marketing',
   'Comprar Backlinks Brasileiros de Marketing | MK',
   'Comprar Backlinks de qualidade no Nicho de Marketing. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks marketing, backlinks digital, backlinks agências, DR, DA, tráfego',
   'Backlinks para Marketing',
   'Compre Backlinks de Qualidade para o nicho de Marketing Digital',
   'Destaque sua agência ou blog de marketing no topo do Google.',
   '## Por que Comprar Backlinks para Marketing?

O setor de marketing digital é competitivo e exige autoridade. Backlinks de qualidade em portais de marketing são essenciais para agências, consultores e blogs especializados.

Nossos backlinks são provenientes de sites especializados em marketing, publicidade e negócios digitais, garantindo relevância temática para sua estratégia de SEO.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-marketing'),
   
  -- Direito
  ('comprar-backlinks-direito',
   'Comprar Backlinks Brasileiros de Direito | MK',
   'Comprar Backlinks de qualidade no Nicho Jurídico. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks direito, backlinks advocacia, backlinks jurídico, DR, DA, tráfego',
   'Backlinks para Direito',
   'Compre Backlinks de Qualidade para o nicho Jurídico',
   'Destaque seu escritório de advocacia no topo do Google.',
   '## Por que Comprar Backlinks para Direito?

O setor jurídico exige alta credibilidade (YMYL). Backlinks de qualidade em portais de direito são essenciais para escritórios de advocacia e blogs jurídicos.

Nossos backlinks são provenientes de sites especializados em direito, legislação e negócios, garantindo relevância temática para sua estratégia de SEO.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-direito'),
   
  -- Maternidade
  ('comprar-backlinks-maternidade',
   'Comprar Backlinks Brasileiros de Maternidade | MK',
   'Comprar Backlinks de qualidade no Nicho de Maternidade. Apareça no Topo do Google e nas Respostas das IAs.',
   'comprar backlinks maternidade, backlinks bebês, backlinks mães, DR, DA, tráfego',
   'Backlinks para Maternidade',
   'Compre Backlinks de Qualidade para o nicho de Maternidade',
   'Destaque seu blog ou loja de produtos para bebês no topo do Google.',
   '## Por que Comprar Backlinks para Maternidade?

O mercado de maternidade é emocional e engajado. Backlinks de qualidade em portais especializados são essenciais para lojas de bebês, blogs de mães e pediatras.

Nossos backlinks são provenientes de sites especializados em maternidade, família e saúde infantil, garantindo relevância temática para sua estratégia de SEO.',
   '[]'::jsonb,
   'https://mkart.com.br/comprar-backlinks-maternidade');