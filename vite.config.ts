import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from 'url';
import prerender from 'vite-plugin-prerender'; // Importa o plugin de prerendering
import { componentTagger } from "lovable-tagger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de rotas que ser\u00E3o pr\u00E9-renderizadas.
// \u00C9 crucial que todas as p\u00E1ginas de categoria estejam aqui.
const prerenderRoutes = [
  '/',
  '/agencia-backlinks',
  '/blog',
  '/consultoria-seo',
  '/comprar-backlinks',
  // Rotas de categorias de backlinks
  '/comprar-backlinks-alimentacao',
  '/comprar-backlinks-automoveis',
  '/comprar-backlinks-categoria',
  '/comprar-backlinks-direito',
  '/comprar-backlinks-educacao',
  '/comprar-backlinks-entretenimento',
  '/comprar-backlinks-esportes',
  '/comprar-backlinks-financas',
  '/comprar-backlinks-imoveis',
  '/comprar-backlinks-marketing',
  '/comprar-backlinks-maternidade',
  '/comprar-backlinks-moda',
  '/comprar-backlinks-negocios',
  '/comprar-backlinks-noticias',
  '/comprar-backlinks-pets',
  '/comprar-backlinks-saude',
  '/comprar-backlinks-tecnologia',
  '/comprar-backlinks-turismo',
  // Adicione outras rotas est\u00E1ticas aqui, se houver
];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Adiciona o plugin de prerendering \u00E0 lista de plugins
    prerender({
      routes: prerenderRoutes,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  }
}));
