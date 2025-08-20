import { createRoot } from 'react-dom/client'
import { HelmetProvider } from "react-helmet-async";
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './auth/AuthProvider';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Configure Helmet for better SEO with priority injection
const helmetContext = {};

// Create a client
const queryClient = new QueryClient()

// Optimize for SEO - inject meta tags as soon as possible
const rootElement = document.getElementById("root")!;

createRoot(rootElement).render(
  <HelmetProvider context={helmetContext}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </HelmetProvider>
);
