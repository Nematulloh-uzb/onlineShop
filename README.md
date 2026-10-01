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

## Email tasdiqlash va parolni tiklash

Ro‘yxatdan o‘tish va parolni tiklash email yuborish uchun Gmail SMTP talab qiladi.
Google hisobingizda 2 bosqichli himoyani yoqing, so‘ng Google Account → Xavfsizlik →
2 bosqichli himoya → Ilova parollari bo‘limidan server uchun App Password yarating.
Oddiy Gmail parolingizni ishlatmang. App Password’ni chatga yoki repoga yubormang.
Lokal ishga tushirishda quyidagi sozlamalarni `server/.env` fayliga, Docker ishlatilganda
loyiha boshidagi `.env` fayliga kiriting:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-address@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=AURA <your-address@gmail.com>
```

`SMTP_FROM` qiymatini `SMTP_USER` dagi Gmail manziliga moslang yoki qoldirib keting.
Sozlamalarni saqlagach serverni qayta ishga tushiring. Yangi hisobga 10 daqiqada eskiradigan
6 xonali kod yuboriladi; email tasdiqlanmaguncha tizimga kirib bo‘lmaydi. Parolni tiklash
havolasi bir martalik va 30 daqiqada eskiradi. SMTP sozlanmagan yoki email yuborish
muvaffaqiyatsiz bo‘lsa, API aniq xato qaytaradi va email yuborilgandek ko‘rsatmaydi.
Lokal `development` muhitida SMTP sozlanmagan bo‘lsa, tiklash emailga yuborilmaydi; uning
o‘rniga faqat shu muhitdagi sahifada sinov uchun havola ko‘rsatiladi. Bu imkoniyat production’da
o‘chirilgan, u yerda SMTP sozlanishi shart.

## Production deployment

The Compose stack expects Docker Compose, a public HTTPS origin, unique JWT secrets of at least 32 characters, and a URL-safe MongoDB root password. Copy `.env.example` to `.env`, set those values, and keep `.env` private. Put a TLS-terminating reverse proxy in front of the locally bound client port; set `CLIENT_URL` to that public HTTPS origin. The API and MongoDB are not published directly to the host.

```powershell
docker compose up --build -d
docker compose exec server npm run seed
```

Only cash on delivery is enabled until a real payment provider is configured.
