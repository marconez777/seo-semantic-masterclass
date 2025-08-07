
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">MK</span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-purple-600 font-medium">Home</a>
          <a href="#servicos" className="text-gray-700 hover:text-purple-600 transition-colors">Serviços</a>
          <a href="#cursos" className="text-gray-700 hover:text-purple-600 transition-colors">Cursos</a>
          <a href="#blog" className="text-gray-700 hover:text-purple-600 transition-colors">Blog</a>
          <a href="#sobre" className="text-gray-700 hover:text-purple-600 transition-colors">Sobre Nós</a>
          <a href="#contato" className="text-gray-700 hover:text-purple-600 transition-colors">Contato</a>
        </div>
        
        <Button 
          variant="outline" 
          className="px-6 py-2 rounded-lg"
          onClick={() => navigate('/auth')}
        >
          Login
        </Button>
      </nav>
    </header>
  );
};

export default Header;
