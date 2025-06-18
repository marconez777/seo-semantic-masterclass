
import { useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface FilterSection {
  title: string;
  items: { name: string; count: number }[];
  isOpen: boolean;
}

const FilterSidebar = () => {
  const [filters, setFilters] = useState<FilterSection[]>([
    {
      title: 'Fonte',
      isOpen: true,
      items: [
        { name: 'Guest Post', count: 100 },
        { name: 'Press Release', count: 30 },
        { name: 'Publicação', count: 300 }
      ]
    },
    {
      title: 'Tipo',
      isOpen: true,
      items: [
        { name: 'Do Follow', count: 400 },
        { name: 'No Follow', count: 30 }
      ]
    },
    {
      title: 'Nichos',
      isOpen: true,
      items: [
        { name: 'Todos', count: 1000 },
        { name: 'Saúde', count: 5 },
        { name: 'Justiça', count: 3 },
        { name: 'Marketing Digital', count: 80 },
        { name: 'Notícias', count: 78 },
        { name: 'IA', count: 30 },
        { name: 'Finanças', count: 40 },
        { name: 'E-commerce', count: 30 },
        { name: 'Política', count: 5 },
        { name: 'Entretenimento', count: 34 },
        { name: 'Moda', count: 43 },
        { name: 'Feminino', count: 45 },
        { name: 'Adulto', count: 45 },
        { name: 'Apostas', count: 65 },
        { name: 'Tecnologia', count: 45 },
        { name: 'Automóveis', count: 45 },
        { name: 'Indústria', count: 43 },
        { name: 'Pet', count: 5 }
      ]
    },
    {
      title: 'Autoridade',
      isOpen: true,
      items: [
        { name: 'DR 01 - 10', count: 34 },
        { name: 'DR 10 - 30', count: 34 },
        { name: 'DR 30 - 50', count: 34 },
        { name: 'DR 50 - 70', count: 34 },
        { name: 'DR 70 - 80', count: 34 },
        { name: 'DR 80 - 99', count: 34 }
      ]
    },
    {
      title: 'Tráfego',
      isOpen: true,
      items: [
        { name: '0 a 100', count: 45 },
        { name: '100 a 1.000', count: 65 },
        { name: '1.000 a 10.000', count: 120 },
        { name: '10.000 a 100.000', count: 85 },
        { name: 'Mais de 100.000', count: 35 }
      ]
    },
    {
      title: 'Aceita Conteúdo Black',
      isOpen: false,
      items: [
        { name: 'Sim', count: 45 },
        { name: 'Não', count: 385 }
      ]
    },
    {
      title: 'Prazo de Publicação',
      isOpen: true,
      items: [
        { name: '1 dia', count: 45 },
        { name: '1 a 5 dias', count: 34 },
        { name: '5 a 10 dias', count: 45 },
        { name: 'Mais de 10 dias', count: 60 }
      ]
    }
  ]);

  const toggleSection = (index: number) => {
    setFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, isOpen: !filter.isOpen } : filter
    ));
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto flex-shrink-0">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Filtros</h2>
        
        <div className="space-y-6">
          {filters.map((section, index) => (
            <div key={section.title} className="border-b border-gray-100 pb-4">
              <button
                onClick={() => toggleSection(index)}
                className="flex items-center justify-between w-full text-left py-2 hover:text-blue-600 transition-colors"
              >
                <h3 className="font-medium text-gray-900">{section.title}</h3>
                {section.isOpen ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
              
              {section.isOpen && (
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  {section.items.map((item) => (
                    <label key={item.name} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
