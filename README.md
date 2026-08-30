# Petit Diari

Monorepo npm workspaces:

| App | Carpeta | Descripción |
|-----|---------|-------------|
| **Producte** | `apps/app` | Next.js — agenda digital (`app.petitdiari.com`) |
| **Web** | `apps/web` | Vite — landing comercial (`petitdiari.com`) |

## Desenvolupament

```bash
npm install

# App (Next.js)
npm run dev:app

# Landing (Vite) — quan existei apps/web
npm run dev:web
```

Variables d'entorn:
- App: `apps/app/.env.local`
- Web: `apps/web/.env` (copia des de `apps/web/.env.example`)

## Desplegament Vercel

- **App**: Root Directory → `apps/app`
- **Web**: Root Directory → `apps/web`
