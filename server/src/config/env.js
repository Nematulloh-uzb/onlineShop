import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const developmentAccessSecret = 'aura_eco_luxury_super_secret_access_jwt_key_2026';
const developmentRefreshSecret = 'aura_eco_luxury_super_secret_refresh_jwt_key_2026';
const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production' && (!process.env.MONGODB_URI || !process.env.CLIENT_URL)) {
  throw new Error('MONGODB_URI and CLIENT_URL must be configured in production');
}

const getJwtSecret = (name, developmentDefault) => {
  const secret = process.env[name];

  if (nodeEnv === 'production' && (!secret || secret === developmentDefault || secret.length < 32)) {
    throw new Error(`${name} must be configured with a unique secret of at least 32 characters in production`);
  }

  return secret || developmentDefault;
};

const accessSecret = getJwtSecret('JWT_ACCESS_SECRET', developmentAccessSecret);
const refreshSecret = getJwtSecret('JWT_REFRESH_SECRET', developmentRefreshSecret);

if (nodeEnv === 'production' && accessSecret === refreshSecret) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different in production');
}

export const env = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aura_db',
  JWT_ACCESS_SECRET: accessSecret,
  JWT_REFRESH_SECRET: refreshSecret,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  NODE_ENV: nodeEnv,
  VAT_RATE: parseFloat(process.env.VAT_RATE || '0.08'),
  FREE_SHIPPING_THRESHOLD: parseInt(process.env.FREE_SHIPPING_THRESHOLD || '1000000', 10),
  SHIPPING_FEE: parseInt(process.env.SHIPPING_FEE || '35000', 10),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
  SMTP_PORT: Number.parseInt(process.env.SMTP_PORT || '465', 10),
  SMTP_SECURE: process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE.toLowerCase() === 'true'
    : Number.parseInt(process.env.SMTP_PORT || '465', 10) === 465,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || '',
};
