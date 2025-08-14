
import { Instagram, Youtube, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/cf1b72dd-c973-4cdf-a2f6-fd7ce7ed8d4d.png" alt="Logo MK Art" className="w-12 h-12" />
            </div>
            
            <div className="space-y-2 text-gray-400 text-sm">
              <p>Mk Art Trafego Organico Ltda</p>
              <p>CNPJ: 26.248.684/0001-39</p>
              <p>Endereço:</p>
              <p>Rua Caminho do Pilar, 401 –</p>
              <p>Santo André – SP</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <div className="space-y-2 text-gray-400">
              <p><Link to="/consultoria-seo" className="hover:text-white transition-colors">Consultoria SEO</Link></p>
              <p><Link to="/agencia-de-backlinks" className="hover:text-white transition-colors">Sobre Nós</Link></p>
              <p><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></p>
              <p><Link to="/contato" className="hover:text-white transition-colors">Contato</Link></p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-purple-400">Seja Parceiro</h4>
            <div className="space-y-2 text-gray-400">
              <p><Link to="/contato" className="hover:text-purple-400 transition-colors">Cadastrar Blog</Link></p>
              <p><Link to="/contato" className="hover:text-purple-400 transition-colors">Envie seu Currículo</Link></p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex space-x-4">
              <a href="https://instagram.com/mkart.seo" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://youtube.com/@mkart.seo" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://facebook.com/mkart.seo" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2024 MK Art. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
