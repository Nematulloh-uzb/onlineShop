import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';

import { env } from './config/env.js';
import { apiLimiter } from './middlewares/rateLimit.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { ApiError } from './utils/ApiError.js';
import { router as apiRoutes } from './routes/index.js';

export const app = express();

// Xavfsizlik sarlavhalari (Helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS sozlamalari
const allowedOrigins = new Set([
  env.CLIENT_URL,
  ...(env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173']),
]);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('CORS origin ruxsat etilmagan'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiting
app.use('/api', apiLimiter);

// Tana qismini o'qish (Body parser)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
  const isSafeMethod = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
  if (
    !isSafeMethod
    && (req.get('Sec-Fetch-Site') === 'cross-site'
      || (req.get('Origin') && req.get('X-Requested-With') !== 'XMLHttpRequest'))
  ) {
    return next(new ApiError(403, 'So‘rov manbasi tekshiruvdan o‘tmadi'));
  }
  next();
});

// NoSQL inyeksiya va parametr ifloslanishidan himoya
app.use(mongoSanitize());
app.use(hpp());

// Siqish (Gzip compression)
app.use(compression());

// Yuklangan fayllar statik katalogi
app.use('/uploads', express.static(path.resolve('uploads')));

// Salomatlik tekshiruvi (Health check)
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AURA Eco-Fashion API',
  });
});

// Asosiy API yo'nalishlari
app.use('/api/v1', apiRoutes);

// Mavjud bo'lmagan yo'nalishlar (404)
app.all('*', (req, res, next) => {
  next(new ApiError(404, `So‘ralgan yo‘nalish topilmadi: ${req.originalUrl}`));
});

// Markazlashgan xato handler
app.use(errorHandler);
