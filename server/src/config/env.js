import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aura_db',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'aura_eco_luxury_super_secret_access_jwt_key_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'aura_eco_luxury_super_secret_refresh_jwt_key_2026',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: process.env.NODE_ENV || 'development',
  VAT_RATE: parseFloat(process.env.VAT_RATE || '0.08'),
  FREE_SHIPPING_THRESHOLD: parseInt(process.env.FREE_SHIPPING_THRESHOLD || '1000000', 10),
  SHIPPING_FEE: parseInt(process.env.SHIPPING_FEE || '35000', 10),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@aura.uz',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin123!',
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'mock',
};
