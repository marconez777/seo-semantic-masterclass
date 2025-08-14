-- Criar tabela de categorias para metadados específicos
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  schema_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela categories
CREATE POLICY "Public can read categories" 
ON public.categories 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir categorias baseadas nos backlinks existentes
INSERT INTO public.categories (slug, title, description, schema_data) VALUES
('automoveis', 'Comprar Backlinks de Automóveis - Links de Qualidade', 'Compre backlinks de alta qualidade para sites do setor automotivo. Links DoFollow de sites relevantes com alta autoridade de domínio.', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Backlinks Automóveis", "description": "Marketplace de backlinks para o setor automotivo"}'),
('direito', 'Comprar Backlinks de Direito - Links Jurídicos', 'Backlinks especializados para escritórios de advocacia e sites jurídicos. Aumente a autoridade do seu site legal.', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Backlinks Direito", "description": "Marketplace de backlinks para o setor jurídico"}'),
('educacao', 'Comprar Backlinks de Educação - Links Educacionais', 'Links de qualidade para sites educacionais, cursos online e instituições de ensino. Melhore seu SEO educacional.', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Backlinks Educação", "description": "Marketplace de backlinks para o setor educacional"}'),
('financas', 'Comprar Backlinks de Finanças - Links Financeiros', 'Backlinks premium para sites financeiros, fintechs e serviços bancários. Alta autoridade no setor financeiro.', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Backlinks Finanças", "description": "Marketplace de backlinks para o setor financeiro"}'),
('tecnologia', 'Comprar Backlinks de Tecnologia - Links Tech', 'Links especializados para startups, SaaS e sites de tecnologia. Aumente sua autoridade no setor tech.', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Backlinks Tecnologia", "description": "Marketplace de backlinks para o setor de tecnologia"}'),
('noticias', 'Comprar Backlinks de Notícias - Links Jornalísticos', 'Backlinks de portais de notícias e veículos de comunicação. Alta autoridade jornalística.', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Backlinks Notícias", "description": "Marketplace de backlinks para portais de notícias"}'),
('negocios', 'Comprar Backlinks de Negócios - Links Empresariais', 'Links para sites corporativos e de negócios. Aumente a autoridade da sua empresa online.', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Backlinks Negócios", "description": "Marketplace de backlinks para o setor empresarial"}'),
('moda', 'Comprar Backlinks de Moda - Links Fashion', 'Backlinks especializados para e-commerce de moda, blogs fashion e marcas de vestuário.', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Backlinks Moda", "description": "Marketplace de backlinks para o setor de moda"}'),
('turismo', 'Comprar Backlinks de Turismo - Links de Viagem', 'Links de qualidade para agências de turismo, hotéis e sites de viagem. Melhore seu SEO turístico.', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Backlinks Turismo", "description": "Marketplace de backlinks para o setor de turismo"}'),
('saude', 'Comprar Backlinks de Saúde - Links Médicos', 'Backlinks para clínicas, hospitais e profissionais da saúde. Alta autoridade no setor médico.', '{"@context": "https://schema.org", "@type": "CollectionPage", "name": "Backlinks Saúde", "description": "Marketplace de backlinks para o setor de saúde"}');