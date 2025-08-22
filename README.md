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

### Requirements
- Node.js (v22 or higher)
- pnpm (v10 or higher)

### Local Development Setup

Follow these steps to run the project locally:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Step 2: Install dependencies using pnpm
pnpm install

# Step 3: Set up environment variables
# Copy the example file to create your local environment file.
cp .env.example .env.local

# Step 4: Start the development server
pnpm dev
```

**Note on Supabase Integration:**

The project is configured to run without requiring real Supabase credentials. When using the placeholder values from `.env.example`, any features that depend on Supabase (such as dynamic data loading, user authentication, etc.) will be disabled or run in a mocked/degraded mode. This allows for frontend development and testing without needing access to the backend.

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

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/64be96ec-500e-4bf9-b808-b82d5b5c8def) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
