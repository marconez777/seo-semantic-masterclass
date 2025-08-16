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
import Dashboard from "./pages/Dashboard";
import { CartProvider } from "./contexts/CartContext";

import AdminLayout from "./layouts/AdminLayout";
import AdminPedidos from "./pages/admin/AdminPedidos";
import AdminSites from "./pages/admin/AdminSites";
import AdminPublicacoes from "./pages/admin/AdminPublicacoes";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminAuth from "./pages/admin/AdminAuth";
import Recibo from "./pages/Recibo";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminBlogNew from "./pages/AdminBlogNew";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import { RequireRole } from "./components/auth/RequireRole";
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
        <Route path="/comprar-backlinks/:categoria" element={<ComprarBacklinksCategoria />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/painel" element={<Dashboard />} />
        <Route path="/403" element={<Forbidden />} />
        
        {/* Admin auth route */}
        <Route path="/admin/login" element={<AdminAuth />} />
        
        <Route path="/admin" element={
          <RequireRole role="admin">
            <AdminLayout />
          </RequireRole>
        }>
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
