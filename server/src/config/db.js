import mongoose from 'mongoose';
import { env } from './env.js';

let embeddedMongo = null;

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Muvaffaqiyatli ulandi: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    if (env.NODE_ENV === 'development' || !env.NODE_ENV) {
      console.log('[MongoDB] Lokal MongoDB serveri aniqlanmadi. Avtomatik Embedded MongoDB ishga tushirilmoqda...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        embeddedMongo = await MongoMemoryServer.create({
          instance: {
            port: 27017,
            dbName: 'aura_db',
          },
        });
        const uri = embeddedMongo.getUri() + 'aura_db';
        const conn = await mongoose.connect(uri);
        console.log(`[MongoDB] Embedded MongoDB muvaffaqiyatli ishga tushdi va ulandi: ${uri}`);
        return conn;
      } catch (embedError) {
        console.error(`[MongoDB] Embedded server xatoligi: ${embedError.message}`);
        process.exit(1);
      }
    }
    console.error(`[MongoDB] Ulanishda xatolik yuz berdi: ${error.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (embeddedMongo) {
    await embeddedMongo.stop();
  }
};
