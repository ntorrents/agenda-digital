# PRE: provar PWA i Web Push al mòbil (túnel Cloudflare)

Cada túnel `cloudflared` genera una **URL nova**. Sense actualitzar `.env.local` i `next.config.ts`, el mòbil no pot instal·lar la PWA ni rebre push de forma fiable.

En **PC** (Chrome a `localhost:3000`) normalment no cal túnel.

---

## Checklist ràpid (cada sessió PRE al mòbil)

1. Arrencar stack PRE (Supabase local + `npm run dev` a `apps/app`).
2. Obrir túnel Cloudflare cap al port **3000** (app Next).
3. Copiar la URL `https://….trycloudflare.com`.
4. Actualitzar `apps/app/.env.local` → `APP_URL` (i, si cal, la URL pública de Supabase si també va amb túnel).
5. Afegir el **hostname** (sense `https://`) a `allowedDevOrigins` a `apps/app/next.config.ts`.
6. **Reiniciar** `next dev` (canvis d’env i de `next.config` no es carreguen sols).
7. Al mòbil: obrir la URL Cloudflare (Safari/Chrome) → login → instal·lar PWA → Perfil → activar notificacions.
8. Provar: omplir una **agenda nova** (primera del dia per aquell alumne) amb un usuari staff; el guardian subscrit ha de rebre el push.

---

## 1. Variables d’entorn (`.env.local`)

Exemple (ajusta les URLs del túnel actual):

```env
# App Next (la que obre el mòbil)
APP_URL=https://XXXX.trycloudflare.com

# Si Supabase també va amb túnel (API/Auth):
# NEXT_PUBLIC_SUPABASE_URL=https://YYYY.trycloudflare.com
# Si només proves app en local i Supabase en localhost, el mòbil NO podrà parlar amb 127.0.0.1:
# cal túnel també per a Supabase (port 8000) o usar una URL accessible.

NEXT_PUBLIC_VAPID_PUBLIC_KEY=…
VAPID_PRIVATE_KEY=…
VAPID_SUBJECT=mailto:hola@petitdiari.com
```

Notes:

- `NEXT_PUBLIC_*` es “cuinen” en arrencar Next → **reinicia sempre** després de canviar-les.
- Les claus VAPID de PRE poden ser les mateixes mentre només provi PRE; en PRO millor un parell dedicat a Vercel.
- No commitis `.env.local`.

---

## 2. `next.config.ts` — `allowedDevOrigins`

Next 16 bloqueja orígens de desenvolupament no llistats. Cada URL nova de Cloudflare s’ha d’afegir pel **hostname** (sense protocol ni barra final):

```ts
// ✅ Correcte
allowedDevOrigins: [
  'localhost:3000',
  'XXXX.trycloudflare.com',
],

// ❌ Incorrecte (Next respon "Unauthorized" i el túnel trenca HMR/WebSocket)
allowedDevOrigins: [
  'https://XXXX.trycloudflare.com',
],
```

Si a la terminal de `cloudflared` veus:

`malformed HTTP response "Unauthorized"` en rutes `/_next/hmr` → gairebé segur que el hostname està mal format o falta a `allowedDevOrigins`. Corregeix i **reinicia** `next dev`.

Quan tanquis la sessió, pots deixar només `localhost:3000`. No afecta el build de producció.

---

## 3. Comandes tipiques

Des de l’arrel del monorepo / `apps/app` (segons el teu hàbit):

```bash
# Terminal A — app
cd apps/app && npm run dev

# Terminal B — túnel cap a Next (port 3000)
cloudflared tunnel --url http://localhost:3000
```

Si Supabase local també ha d’ésser accessible des del mòbil:

```bash
# Terminal C — túnel cap a Kong/API Supabase (port 8000 habitual)
cloudflared tunnel --url http://localhost:8000
```

Llavors `NEXT_PUBLIC_SUPABASE_URL` ha de ser la URL del túnel de Supabase (no `http://localhost:8000`).

---

## 4. Instal·lació i push al mòbil

| Plataforma | Instal·lar | Notificacions |
|------------|------------|---------------|
| **Android (Chrome)** | Banner «Instal·lar» o menú → Instal·lar app | Perfil → Activar notificacions |
| **iPhone (Safari)** | Compartir → Afegeix a la pantalla d’inici | Obrir la icona (standalone) → Perfil → Activar (cal iOS 16.4+) |

Sense instal·lar a iOS, el push web **no** funciona.

Service worker: `/sw.js` (headers a `next.config.ts`). Si canvies el SW, força recàrrega o reinstal·la la PWA.

---

## 5. Què dispara una notificació (producte)

| Event | Quan s’envia | Destinataris |
|-------|----------------|--------------|
| **Agenda** | Només la **primera creació** del dia (no cada edició) | Guardians de l’alumne |
| **Avís** (Comunicació) | En crear (audiència escola/aula) | Guardians |
| **Missatge privat** | En enviar des de Missatges | Destinatari |
| **Menú menjador** | En crear o actualitzar | Guardians del centre |
| Calendari / resta | **No** envien push | — |

Textos editables a `src/lib/push/copy.ts`.

Si proves menú i falla amb *extended attributes*: volume `storage_data` al docker-compose de `local-supabase` (ja documentat / aplicat).

---

## 6. Checklist PRO (quan ja validis PRE)

1. SQL: `apps/app/scripts/push-subscriptions.sql` a Supabase **PRO**.
2. Vercel → env: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`.
3. Deploy del codi (sense hostnames de Cloudflare a `allowedDevOrigins`).
4. Smoke: instal·lar PWA en PRO → activar push → crear agenda → rebre notificació.

---

## Problemes freqüents

- **No arriba el push:** VAPID no carregades / Next no reiniciat / usuari no subscrit a `push_subscriptions` / a iOS no està en standalone.
- **Login o API fallen al mòbil:** Supabase encara apunta a `localhost`.
- **Warning Cross-origin / blocked:** falta el hostname a `allowedDevOrigins` (sense `https://`).
- **Agenda no notifica:** estàs fent `update` d’un log ja existent; cal `create`.
- **Avís/calendari no notifica:** audiència «Només equip» (`staff`) no envia push a famílies; usa «Tothom» / escola o aula.
- **No pugen fotos/PDF a PRE:** executar `apps/app/scripts/pre-storage-buckets.sql` al SQL Editor local (`localhost:8000`).
