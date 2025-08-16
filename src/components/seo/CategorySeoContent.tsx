import React from 'react';

interface CategorySeoContentProps {
  categoryName: string;
}

const seoContentByCat: Record<string, React.ReactNode> = {
  'tecnologia': (
    <>
      <h2 className="text-2xl font-semibold">Maximizando seu SEO no Setor de Tecnologia</h2>
      <p className="text-muted-foreground">
        No competitivo mercado de tecnologia, ter uma presença online forte é crucial. Backlinks de qualidade de sites de tecnologia relevantes podem aumentar drasticamente a autoridade do seu domínio, atraindo mais tráfego orgânico e leads qualificados.
      </p>
    </>
  ),
  'financas': (
    <>
      <h2 className="text-2xl font-semibold">Construindo Confiança no Setor Financeiro com Backlinks</h2>
      <p className="text-muted-foreground">
        Para empresas do setor financeiro, a confiança é tudo. Backlinks de portais de finanças respeitados não apenas melhoram seu SEO, mas também estabelecem sua marca como uma autoridade confiável no mercado.
      </p>
    </>
  ),
  'default': (
    <>
      <h2 className="text-2xl font-semibold">A Importância de Backlinks de Qualidade</h2>
      <p className="text-muted-foreground">
        Backlinks são um dos fatores mais importantes para o ranking no Google. Ao adquirir links de sites relevantes e de alta autoridade em seu nicho, você sinaliza para os motores de busca que seu conteúdo é valioso e confiável.
      </p>
    </>
  ),
};

const slugify = (text: string) => {
    if (!text) return '';
    return text
      .toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

const CategorySeoContent: React.FC<CategorySeoContentProps> = ({ categoryName }) => {
  const slug = slugify(categoryName);
  const content = seoContentByCat[slug] || seoContentByCat['default'];

  return (
    <section className="mt-10 space-y-6">
      {content}
    </section>
  );
};

export default CategorySeoContent;
