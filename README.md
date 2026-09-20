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

Fotos del catálogo: [carpeta Botanica en Drive](https://drive.google.com/drive/folders/16S0q1RV9yKZaVDkV79d7KU395v6ADHvH?usp=sharing).

Precios del seed (850 collares, 2150 mazos, MXN) son de arranque. Cámbialos cuando confirmes la lista.

## Dokploy

Conecta el repo, usa el compose. Pon `SESSION_SECRET` en el entorno. No subas `.env`.
