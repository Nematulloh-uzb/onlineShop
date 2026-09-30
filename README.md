# AURA online shop

React/Vite storefront with an Express API and MongoDB. Catalog, cart, wishlist, orders, customer accounts, and product reviews use the API; order totals and stock checks are calculated on the server.

## Local development

Requirements: Node.js 20 or newer and npm.

```powershell
npm run install:all
npm run dev
```

The storefront is at `http://localhost:5173` and the API health check is at `http://localhost:5000/health`. The server uses a local MongoDB at `127.0.0.1:27017` when available. If it is unavailable in development, the server starts an embedded MongoDB whose files are stored under `server/data/mongodb` and retained across restarts.

Initialize the catalog and promo codes with:

```powershell
npm run seed
```

Seeding is repeatable and does not delete or overwrite existing products, accounts, carts, or orders. Configure a persistent MongoDB in `server/.env` for shared or non-development data.

Run backend tests and the frontend production build with:

```powershell
npm run test:server
npm run build --prefix client
```

## Production deployment

The Compose stack expects Docker Compose, a public HTTPS origin, unique JWT secrets of at least 32 characters, and a URL-safe MongoDB root password. Copy `.env.example` to `.env`, set those values, and keep `.env` private. Put a TLS-terminating reverse proxy in front of the locally bound client port; set `CLIENT_URL` to that public HTTPS origin. The API and MongoDB are not published directly to the host.

```powershell
docker compose up --build -d
docker compose exec server npm run seed
```

Only cash on delivery is enabled until a real payment provider is configured. Password reset requests return `503` until an email-delivery provider is configured; the application does not report unsupported payment or email actions as successful.
