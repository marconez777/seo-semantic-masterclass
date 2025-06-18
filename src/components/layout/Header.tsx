
import { Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Search className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">SEO Marketplace</h1>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Dashboard</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Sites</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Relatórios</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">Conta</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
