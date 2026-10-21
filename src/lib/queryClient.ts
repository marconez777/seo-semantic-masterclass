import { QueryClient } from "@tanstack/react-query";

// Instância do navegador. Fica fora do App.tsx porque o main.tsx precisa dela antes
// de montar o React, para carregar o cache que o build estático embute no HTML.
export const queryClient = new QueryClient();
