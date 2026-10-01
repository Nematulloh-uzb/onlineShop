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

## Elektron pochtani tasdiqlash va parolni tiklash

Hisobni tasdiqlash kodi hamda parolni yangilash havolasi Gmail orqali yuboriladi.
Buning uchun Google hisobingizda ikki bosqichli himoyani yoqing, so‘ng Google hisobining
Xavfsizlik bo‘limidagi Ilova parollari sahifasidan ushbu loyiha uchun alohida ilova parolini yarating.
Gmail’ga kirishdagi oddiy parolingizni ishlatmang. Ilova parolini chatga yozmang yoki
repozitoriyga joylamang. Lokal ishga tushirganda quyidagi qiymatlarni `server/.env`
fayliga, Docker’da esa loyihaning asosiy papkasidagi `.env` fayliga kiriting:

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-address@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=VERDE <your-address@gmail.com>
```

`SMTP_FROM` утгад `SMTP_USER`-тэй ижил Gmail хаягийг оруул, эсвэл хоосон үлдээ.
Утгуудыг хадгалсны дараа серверийг дахин эхлүүл. Бүртгүүлэхэд 10 минут хүчинтэй зургаан
оронтой код илгээнэ; хаягаа баталгаажуулаагүй хэрэглэгч нэвтэрч чадахгүй. Нууц үг
шинэчлэх холбоос нэг удаа ашиглагдах бөгөөд 30 минут хүчинтэй. Gmail илгээх тохиргоо
ороогүй эсвэл илгээлт амжилтгүй болбол үйлдэл амжилттай болсон мэт харуулахгүй, дэлгэцэд
ойлгомжтой алдаа үзүүлнэ. Хөгжүүлэлтийн орчинд ч нууц үг сэргээх холбоосыг дэлгэцэд
гаргахгүй; холбоос зөвхөн баталгаажсан хаяг руу имэйлээр очно. Gmail тохиргоогүй үед
бүртгэлийн код болон нууц үг сэргээх холбоос имэйлээр илгээгдэхгүй.

## Production deployment

The Compose stack expects Docker Compose, a public HTTPS origin, unique JWT secrets of at least 32 characters, and a URL-safe MongoDB root password. Copy `.env.example` to `.env`, set those values, and keep `.env` private. Put a TLS-terminating reverse proxy in front of the locally bound client port; set `CLIENT_URL` to that public HTTPS origin. The API and MongoDB are not published directly to the host.

```powershell
docker compose up --build -d
docker compose exec server npm run seed
```

Only cash on delivery is enabled until a real payment provider is configured.
