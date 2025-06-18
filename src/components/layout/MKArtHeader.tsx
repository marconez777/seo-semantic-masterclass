
import { Search, Menu, X } from 'lucide-react';
import { useState } from 'react';
import SmartLink from '../seo/SmartLink';

const MKArtHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Search className="w-8 h-8 text-blue-600" aria-hidden="true" />
            <SmartLink to="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              MK Art SEO
            </SmartLink>
          </div>
          
          <nav className="hidden md:flex space-x-8" role="navigation" aria-label="Navegação principal">
            <SmartLink to="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Início
            </SmartLink>
            <SmartLink to="/servicos" className="text-gray-700 hover:text-blue-600 transition-colors">
              Serviços
            </SmartLink>
            <SmartLink to="/sobre" className="text-gray-700 hover:text-blue-600 transition-colors">
              Sobre
            </SmartLink>
            <SmartLink to="/portfolio" className="text-gray-700 hover:text-blue-600 transition-colors">
              Portfólio
            </SmartLink>
            <SmartLink to="/contato" className="text-gray-700 hover:text-blue-600 transition-colors">
              Contato
            </SmartLink>
          </nav>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menu mobile"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-2" role="navigation" aria-label="Navegação mobile">
              <SmartLink to="/" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors">
                Início
              </SmartLink>
              <SmartLink to="/servicos" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors">
                Serviços
              </SmartLink>
              <SmartLink to="/sobre" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors">
                Sobre
              </SmartLink>
              <SmartLink to="/portfolio" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors">
                Portfólio
              </SmartLink>
              <SmartLink to="/contato" className="px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors">
                Contato
              </SmartLink>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default MKArtHeader;
