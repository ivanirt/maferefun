# maferefun

Botánica Maferefun: catálogo, carrito, tratados, consultas y cuenta.

## Stack

Next.js 15, Postgres, Prisma. En producción: Hostinger VPS + Dokploy (`docker-compose.yml`).

## Local

1. Copia `.env.example` a `.env`.
2. `docker compose up db -d` (o Postgres local).
3. `npx prisma migrate dev`
4. `npx prisma db seed`
5. `npm run dev`

Demo: `devoto@maferefun.com` / `maferefun`.

Fotos: [Drive](https://drive.google.com/drive/folders/16S0q1RV9yKZaVDkV79d7KU395v6ADHvH?usp=sharing). Precios: [hoja Productos](https://docs.google.com/spreadsheets/d/17iOJNxoqkm6fEF8AdPbiQywxpNobXbsSxitZBwvd00Y/edit?usp=sharing) (`PRECIO UNITARIO`).

## Dokploy

Conecta el repo, usa el compose. Pon `SESSION_SECRET` en el entorno. No subas `.env`.
