# maferefun

Botánica Maferefun: catálogo, carrito, tratados, consultas y cuenta.

## Stack

Next.js 15, Postgres 18, Prisma. En producción: Hostinger VPS + Dokploy (`docker-compose.yml`).

## Local

1. Copia `.env.example` a `.env`.
2. `docker compose up db -d` (o Postgres local).
3. `npx prisma migrate dev`
4. `npx prisma db seed`
5. `npm run dev`

Demo: `devoto@maferefun.com` / `maferefun`.

Fotos: [Drive](https://drive.google.com/drive/folders/16S0q1RV9yKZaVDkV79d7KU395v6ADHvH?usp=sharing). Precios: [hoja Productos](https://docs.google.com/spreadsheets/d/17iOJNxoqkm6fEF8AdPbiQywxpNobXbsSxitZBwvd00Y/edit?usp=sharing) (`PRECIO UNITARIO`).

## Dokploy

Si Postgres 18 ya está en el VPS, usa **Build Type: Dockerfile** (no Compose).

1. Provider GitHub, repo `maferefun`, branch `main`, Build Path `/`.
2. En **Environment** (no en el build):
   - `DATABASE_URL` — la URL de tu Postgres 18 (usuario, clave, host interno de Dokploy y base).
   - `SESSION_SECRET` — 32+ caracteres aleatorios.
3. Puerto de la app: `3000`.
4. Guarda y **Deploy**. Autodeploy puede quedar apagado.

El contenedor corre `prisma migrate deploy` y el seed al arrancar. Admin: `admin` / `admin`.

Si eliges Compose, Dokploy también levanta el Postgres del `docker-compose.yml`; no lo uses si la base 18 ya existe aparte.
