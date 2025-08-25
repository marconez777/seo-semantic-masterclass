-- Update category "Casa" to "Imóveis" and add "Maternidade"
BEGIN;

-- 1. Rename 'Casa' to 'Imóveis' in the backlinks table
UPDATE public.backlinks
SET category = 'Imóveis'
WHERE category = 'Casa';

-- 2. Rename 'casa' to 'imoveis' in the categories table
UPDATE public.categories
SET
  slug = 'imoveis',
  title = 'Comprar Backlinks de Imóveis - Links Imobiliários',
  description = 'Backlinks de alta qualidade para sites do setor imobiliário. Aumente a autoridade do seu site com links de portais de imóveis.',
  schema_data = '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Backlinks Imóveis", "description": "Marketplace de backlinks para o setor imobiliário"}'
WHERE slug = 'casa';

-- 3. Add the new category 'Maternidade'
INSERT INTO public.categories (slug, title, description, schema_data) VALUES
('maternidade', 'Comprar Backlinks de Maternidade - Links para Mães e Bebês', 'Backlinks para blogs de maternidade, sites de produtos para bebês e conteúdos voltados para mães e pais.', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Backlinks Maternidade", "description": "Marketplace de backlinks para o setor de maternidade"}');

COMMIT;
