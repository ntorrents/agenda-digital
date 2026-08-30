# Petit Diari

El dia a dia a l'escola, a prop de la família (Next.js + Supabase).

## Desenvolupament local

```bash
npm install
npm run dev
```

Variables d'entorn (`.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (només servidor; accions d'administració)

Obre [http://localhost:3000](http://localhost:3000).

## Base de dades de prova

El schema viu al projecte Supabase en producció. Per preparar un entorn nou o de demo, executa `scripts/demo-seed.sql` al SQL Editor de Supabase.

Accés demo (contrasenya `123456`):

| Rol        | Email                 |
|------------|-----------------------|
| Direcció   | `d@cole.cat`          |
| Professor  | `p1@cole.cat`         |
| Família    | `f1@cole.cat`         |
| Superadmin | `superadmin@bressol.cat` |

## Desplegament

Desplegat a Vercel des del branch `main`. Assegura't que les tres variables d'entorn de Supabase estan configurades al projecte.
