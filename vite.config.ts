import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import prerender from 'vite-plugin-prerender';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom']
        }
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && prerender({
      staticDir: path.join(__dirname, 'dist'),
      routes: [
        '/',
        '/comprar-backlinks-tecnologia',
        '/comprar-backlinks-noticias',
        '/comprar-backlinks-financas',
        '/comprar-backlinks-moda',
        '/comprar-backlinks-negocios',
        '/comprar-backlinks-educacao',
        '/comprar-backlinks-automoveis',
        '/comprar-backlinks-turismo',
        '/comprar-backlinks',
        '/agencia-de-backlinks',
        '/consultoria-seo',
        '/contato',
        '/blog'
      ]
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
}));
