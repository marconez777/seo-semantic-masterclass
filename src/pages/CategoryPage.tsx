
import { useParams, useLocation } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import SitesTable from '@/components/layout/SitesTable';
import FilterSidebar from '@/components/layout/FilterSidebar';
import SEOHead from '@/components/seo/SEOHead';

const CategoryPage = () => {
  const { category, subcategory } = useParams();
  const location = useLocation();

  // Mapeamento de categorias para títulos e descrições SEO
  const categoryData = {
    'servicos': {
      'guest-post': {
        title: 'Guest Post - Serviços de Link Building | MK Art SEO',
        description: 'Serviços profissionais de Guest Post para fortalecer sua autoridade online. Links de qualidade em sites relevantes do seu nicho.',
        h1: 'Guest Post Profissional',
        content: 'Nossos serviços de Guest Post conectam sua marca a sites de autoridade no seu nicho, construindo links naturais e relevantes.'
      },
      'press-release': {
        title: 'Press Release - Divulgação em Mídia | MK Art SEO',
        description: 'Serviços de Press Release para divulgar suas notícias em veículos de comunicação relevantes e construir autoridade.',
        h1: 'Press Release Estratégico',
        content: 'Distribua suas notícias corporativas em veículos de mídia de qualidade e construa a reputação digital da sua empresa.'
      },
      'publicacao': {
        title: 'Publicação Patrocinada - Content Marketing | MK Art SEO',
        description: 'Publicações patrocinadas em sites de alta autoridade para aumentar visibilidade e gerar tráfego qualificado.',
        h1: 'Publicação Patrocinada',
        content: 'Amplifique o alcance do seu conteúdo através de publicações estratégicas em sites de alta relevância.'
      }
    },
    'link-building': {
      'do-follow': {
        title: 'Links DoFollow - Link Building Premium | MK Art SEO',
        description: 'Links DoFollow de alta qualidade para transferir autoridade e melhorar seu ranking nos buscadores.',
        h1: 'Links DoFollow Premium',
        content: 'Construa autoridade real com links DoFollow de sites de alta qualidade e relevância para seu nicho.'
      },
      'no-follow': {
        title: 'Links NoFollow - Diversificação de Link Profile | MK Art SEO',
        description: 'Links NoFollow estratégicos para criar um perfil de links natural e diversificado.',
        h1: 'Links NoFollow Estratégicos',
        content: 'Mantenha um perfil de links natural com nossa seleção de links NoFollow de qualidade.'
      }
    },
    'nichos': {
      'saude': {
        title: 'SEO para Saúde - Marketing Digital Médico | MK Art SEO',
        description: 'Especialistas em SEO para área da saúde. Estratégias digitais para clínicas, hospitais e profissionais de saúde.',
        h1: 'SEO Especializado em Saúde',
        content: 'Desenvolvemos estratégias de SEO específicas para o setor de saúde, respeitando as regulamentações e focando na confiança.'
      },
      'marketing-digital': {
        title: 'SEO para Marketing Digital - Agências e Consultores | MK Art SEO',
        description: 'Serviços de SEO especializados para agências de marketing digital, consultores e empresas do setor.',
        h1: 'SEO para Marketing Digital',
        content: 'Potencialize sua agência ou consultoria de marketing digital com nossas estratégias avançadas de SEO.'
      }
    }
  };

  const getCurrentData = () => {
    const categoryGroup = categoryData[category as keyof typeof categoryData];
    if (!categoryGroup) return null;
    
    return categoryGroup[subcategory as keyof typeof categoryGroup] || {
      title: `${subcategory?.replace('-', ' ')} | MK Art SEO`,
      description: `Serviços especializados em ${subcategory?.replace('-', ' ')} para melhorar seu posicionamento nos buscadores.`,
      h1: subcategory?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '',
      content: `Oferecemos soluções personalizadas em ${subcategory?.replace('-', ' ')} para alavancar seus resultados digitais.`
    };
  };

  const data = getCurrentData();
  
  if (!data) {
    return <div>Categoria não encontrada</div>;
  }

  const breadcrumbItems = [
    { name: "Início", url: "/" },
    { name: category?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || '', url: `/${category}` },
    { name: data.h1, url: location.pathname }
  ];

  return (
    <>
      <SEOHead 
        title={data.title}
        description={data.description}
        keywords={`${subcategory}, SEO, marketing digital, link building`}
        url={`https://mkart-seo.com${location.pathname}`}
        type="service"
      />
      
      <PageLayout breadcrumbItems={breadcrumbItems} showSidebar={false}>
        <div className="bg-white min-h-full">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.h1}</h1>
            <p className="text-lg text-gray-600 max-w-3xl">{data.content}</p>
          </div>
          
          <div className="flex">
            <FilterSidebar />
            <SitesTable />
          </div>
        </div>
      </PageLayout>
    </>
  );
};

export default CategoryPage;
