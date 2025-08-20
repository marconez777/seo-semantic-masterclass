# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/64be96ec-500e-4bf9-b808-b82d5b5c8def

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/64be96ec-500e-4bf9-b808-b82d5b5c8def) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Configuração de Ambiente

Para rodar o projeto, você precisa configurar as variáveis de ambiente.

**Desenvolvimento Local**

1.  Crie um arquivo `.env.local` na raiz do projeto.
2.  Copie o conteúdo de `.env.production.example` para `.env.local`.
3.  Substitua os valores das variáveis, como `<YOUR-PROJECT-ID>`, pelas suas chaves do Supabase.

**Produção**

1.  No seu provedor de hospedagem (Vercel, Netlify, etc.), configure as variáveis de ambiente com base no arquivo `.env.production.example`.
2.  Certifique-se de que a variável `VITE_CHECKOUT_ENGINE` está definida como `new`.
3.  Adicione também a variável `PIX_KEY` com a sua chave PIX.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/64be96ec-500e-4bf9-b808-b82d5b5c8def) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
