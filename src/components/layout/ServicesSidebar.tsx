
import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import SmartLink from '../seo/SmartLink';
import { useLocation } from 'react-router-dom';

interface FilterSection {
  title: string;
  items: { name: string; count: number; slug: string }[];
  isOpen: boolean;
  basePath: string;
}

const ServicesSidebar = () => {
  const location = useLocation();
  
  const [filters, setFilters] = useState<FilterSection[]>([
    {
      title: 'Serviços de Link Building',
      basePath: '/servicos',
      isOpen: true,
      items: [
        { name: 'Guest Post', count: 100, slug: 'guest-post' },
        { name: 'Press Release', count: 30, slug: 'press-release' },
        { name: 'Publicação Patrocinada', count: 300, slug: 'publicacao' }
      ]
    },
    {
      title: 'Tipos de Link',
      basePath: '/link-building',
      isOpen: true,
      items: [
        { name: 'Links DoFollow', count: 400, slug: 'do-follow' },
        { name: 'Links NoFollow', count: 30, slug: 'no-follow' }
      ]
    },
    {
      title: 'Nichos Especializados',
      basePath: '/nichos',
      isOpen: true,
      items: [
        { name: 'Todos os Nichos', count: 1000, slug: 'todos' },
        { name: 'Saúde e Medicina', count: 5, slug: 'saude' },
        { name: 'Direito e Justiça', count: 3, slug: 'justica' },
        { name: 'Marketing Digital', count: 80, slug: 'marketing-digital' },
        { name: 'Notícias e Mídia', count: 78, slug: 'noticias' },
        { name: 'Inteligência Artificial', count: 30, slug: 'ia' },
        { name: 'Finanças e Investimentos', count: 40, slug: 'financas' },
        { name: 'E-commerce', count: 30, slug: 'e-commerce' },
        { name: 'Política', count: 5, slug: 'politica' },
        { name: 'Entretenimento', count: 34, slug: 'entretenimento' },
        { name: 'Moda e Beleza', count: 43, slug: 'moda' },
        { name: 'Universo Feminino', count: 45, slug: 'feminino' },
        { name: 'Conteúdo Adulto', count: 45, slug: 'adulto' },
        { name: 'Apostas e Jogos', count: 65, slug: 'apostas' },
        { name: 'Tecnologia', count: 45, slug: 'tecnologia' },
        { name: 'Automóveis', count: 45, slug: 'automoveis' },
        { name: 'Indústria', count: 43, slug: 'industria' },
        { name: 'Pet e Animais', count: 5, slug: 'pet' }
      ]
    },
    {
      title: 'Autoridade de Domínio',
      basePath: '/autoridade',
      isOpen: true,
      items: [
        { name: 'DR 01 - 10', count: 34, slug: 'dr-01-10' },
        { name: 'DR 10 - 30', count: 34, slug: 'dr-10-30' },
        { name: 'DR 30 - 50', count: 34, slug: 'dr-30-50' },
        { name: 'DR 50 - 70', count: 34, slug: 'dr-50-70' },
        { name: 'DR 70 - 80', count: 34, slug: 'dr-70-80' },
        { name: 'DR 80 - 99', count: 34, slug: 'dr-80-99' }
      ]
    },
    {
      title: 'Tráfego Orgânico',
      basePath: '/trafego',
      isOpen: true,
      items: [
        { name: '0 a 100 visitantes', count: 45, slug: 'organico-0-100' },
        { name: '100 a 1.000 visitantes', count: 65, slug: 'organico-100-1000' },
        { name: '1.000 a 10.000 visitantes', count: 120, slug: 'organico-1000-10000' },
        { name: '10.000 a 100.000 visitantes', count: 85, slug: 'organico-10000-100000' },
        { name: 'Mais de 100.000 visitantes', count: 35, slug: 'organico-100000+' }
      ]
    },
    {
      title: 'Prazos de Entrega',
      basePath: '/prazos',
      isOpen: true,
      items: [
        { name: 'Entrega em 1 dia', count: 45, slug: 'entrega-1-dia' },
        { name: 'Entrega em 1 a 5 dias', count: 34, slug: 'entrega-1-5-dias' },
        { name: 'Entrega em 5 a 10 dias', count: 45, slug: 'entrega-5-10-dias' },
        { name: 'Entrega em mais de 10 dias', count: 60, slug: 'entrega-10-dias+' }
      ]
    }
  ]);

  const toggleSection = (index: number) => {
    setFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, isOpen: !filter.isOpen } : filter
    ));
  };

  const isActiveLink = (basePath: string, slug: string) => {
    return location.pathname === `${basePath}/${slug}`;
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto" role="complementary" aria-label="Filtros de serviços">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Nossos Serviços</h2>
        
        <nav className="space-y-6" role="navigation" aria-label="Navegação por categorias">
          {filters.map((section, index) => (
            <div key={section.title} className="border-b border-gray-100 pb-4">
              <button
                onClick={() => toggleSection(index)}
                className="flex items-center justify-between w-full text-left py-2 hover:text-blue-600 transition-colors"
                aria-expanded={section.isOpen}
                aria-controls={`section-${index}`}
              >
                <h3 className="font-medium text-gray-900">{section.title}</h3>
                {section.isOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" aria-hidden="true" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" aria-hidden="true" />
                )}
              </button>
              
              {section.isOpen && (
                <div id={`section-${index}`} className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {section.items.map((item) => (
                    <SmartLink
                      key={item.slug}
                      to={`${section.basePath}/${item.slug}`}
                      className={`flex items-center space-x-3 p-2 rounded-md transition-colors hover:bg-blue-50 hover:text-blue-600 ${
                        isActiveLink(section.basePath, item.slug) ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-sm flex-1">{item.name}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    </SmartLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default ServicesSidebar;
