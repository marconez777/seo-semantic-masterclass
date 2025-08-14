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
import ComprarBacklinksTecnologia from "./pages/ComprarBacklinksTecnologia";
import ComprarBacklinksNegocios from "./pages/ComprarBacklinksNegocios";
import ComprarBacklinksEducacao from "./pages/ComprarBacklinksEducacao";
import ComprarBacklinksTurismo from "./pages/ComprarBacklinksTurismo";
import ComprarBacklinksAlimentacao from "./pages/ComprarBacklinksAlimentacao";
import ComprarBacklinksPets from "./pages/ComprarBacklinksPets";
import ComprarBacklinksEsportes from "./pages/ComprarBacklinksEsportes";
import ComprarBacklinksEntretenimento from "./pages/ComprarBacklinksEntretenimento";
import ComprarBacklinksMarketing from "./pages/ComprarBacklinksMarketing";
import ComprarBacklinksDireito from "./pages/ComprarBacklinksDireito";
import ComprarBacklinksImoveis from "./pages/ComprarBacklinksImoveis";
import ComprarBacklinksMaternidade from "./pages/ComprarBacklinksMaternidade";
import Dashboard from "./pages/Dashboard";
import { CartProvider } from "./contexts/CartContext";

import AdminLayout from "./layouts/AdminLayout";
import AdminPedidos from "./pages/admin/AdminPedidos";
import AdminSites from "./pages/admin/AdminSites";
import AdminPublicacoes from "./pages/admin/AdminPublicacoes";
import AdminBlog from "./pages/admin/AdminBlog";
import Recibo from "./pages/Recibo";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminBlogNew from "./pages/AdminBlogNew";
import NotFound from "./pages/NotFound";
import { Toaster } from "@/components/ui/toaster";
import { WhatsAppFAB } from "@/components/ui/whatsapp-fab";
 
const App = () => (
  <BrowserRouter>
    <CartProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/contato" element={<Contact />} />
        <Route path="/agencia-de-backlinks" element={<AgenciaBacklinks />} />
        <Route path="/consultoria-seo" element={<ConsultoriaSeo />} />
        <Route path="/comprar-backlinks" element={<ComprarBacklinks />} />
        <Route path="/comprar-backlinks-noticias" element={<ComprarBacklinksNoticias />} />
        <Route path="/comprar-backlinks-automoveis" element={<ComprarBacklinksAutomoveis />} />
        <Route path="/comprar-backlinks-financas" element={<ComprarBacklinksFinancas />} />
        <Route path="/comprar-backlinks-negocios" element={<ComprarBacklinksNegocios />} />
        <Route path="/comprar-backlinks-educacao" element={<ComprarBacklinksEducacao />} />
        <Route path="/comprar-backlinks-moda" element={<ComprarBacklinksModa />} />
        <Route path="/comprar-backlinks-tecnologia" element={<ComprarBacklinksTecnologia />} />
        <Route path="/comprar-backlinks-turismo" element={<ComprarBacklinksTurismo />} />
        <Route path="/comprar-backlinks-alimentacao" element={<ComprarBacklinksAlimentacao />} />
        <Route path="/comprar-backlinks-pets" element={<ComprarBacklinksPets />} />
        <Route path="/comprar-backlinks-esportes" element={<ComprarBacklinksEsportes />} />
        <Route path="/comprar-backlinks-entretenimento" element={<ComprarBacklinksEntretenimento />} />
        <Route path="/comprar-backlinks-marketing" element={<ComprarBacklinksMarketing />} />
        <Route path="/comprar-backlinks-direito" element={<ComprarBacklinksDireito />} />
        <Route path="/comprar-backlinks-imoveis" element={<ComprarBacklinksImoveis />} />
        <Route path="/comprar-backlinks-maternidade" element={<ComprarBacklinksMaternidade />} />
        <Route path="/comprar-backlinks-:categoria" element={<ComprarBacklinksCategoria />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/painel" element={<Dashboard />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminPedidos />} />
          <Route path="sites" element={<AdminSites />} />
          <Route path="publicacoes" element={<AdminPublicacoes />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="blog/novo" element={<AdminBlogNew />} />
        </Route>
        <Route path="/recibo/:orderId" element={<Recibo />} />
        
        <Route path="/carrinho" element={<Carrinho />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <WhatsAppFAB />
    </CartProvider>
  </BrowserRouter>
);
 
export default App;
