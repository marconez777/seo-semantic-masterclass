import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import AgenciaBacklinks from "./pages/AgenciaBacklinks";
import ConsultoriaSeo from "./pages/ConsultoriaSeo";
import Auth from "./pages/Auth";
// import Painel from "./pages/Painel";
import Carrinho from "./pages/Carrinho";
import Cart from "./pages/Cart";
import ComprarBacklinks from "./pages/ComprarBacklinks";
import ComprarBacklinksCategoria from "./pages/ComprarBacklinksCategoria";
import ComprarBacklinksNoticias from "./pages/ComprarBacklinksNoticias";
import ComprarBacklinksAutomoveis from "./pages/ComprarBacklinksAutomoveis";
import ComprarBacklinksFinancas from "./pages/ComprarBacklinksFinancas";
import ComprarBacklinksModa from "./pages/ComprarBacklinksModa";
import Dashboard from "./pages/Dashboard";
import { CartProvider } from "./contexts/CartContext";
import Admin from "./pages/Admin";
import Recibo from "./pages/Recibo";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminBlogNew from "./pages/AdminBlogNew";
import { Toaster } from "@/components/ui/toaster";
 
const App = () => (
  <BrowserRouter>
    <CartProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/agencia-de-backlinks" element={<AgenciaBacklinks />} />
        <Route path="/consultoria-de-seo-backlinks" element={<ConsultoriaSeo />} />
        <Route path="/comprar-backlinks" element={<ComprarBacklinks />} />
        <Route path="/comprar-backlinks-noticias" element={<ComprarBacklinksNoticias />} />
        <Route path="/comprar-backlinks-automoveis" element={<ComprarBacklinksAutomoveis />} />
        <Route path="/comprar-backlinks-financas" element={<ComprarBacklinksFinancas />} />
        <Route path="/comprar-backlinks-moda" element={<ComprarBacklinksModa />} />
        <Route path="/comprar-backlinks-:categoria" element={<ComprarBacklinksCategoria />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/painel" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/blog/novo" element={<AdminBlogNew />} />
        <Route path="/recibo/:orderId" element={<Recibo />} />
        
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
      <Toaster />
    </CartProvider>
  </BrowserRouter>
);
 
export default App;
