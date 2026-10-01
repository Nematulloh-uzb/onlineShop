import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB, closeDB } from './config/db.js';
import { getMissingEmailSettings } from './services/emailService.js';

const startServer = async () => {
  await connectDB();

  const missingEmailSettings = getMissingEmailSettings();
  if (missingEmailSettings.length > 0) {
    console.warn(`[VERDE Server] Gmail orqali xat yuborish sozlamalari yetishmaydi: ${missingEmailSettings.join(', ')}`);
  }

  const server = app.listen(env.PORT, () => {
    console.log(`[AURA Server] Server http://localhost:${env.PORT} da muvaffaqiyatli ishga tushdi`);
    console.log(`[AURA Server] Muhit: ${env.NODE_ENV}`);
  });

  const gracefulShutdown = async () => {
    console.log('\n[AURA Server] Server to‘xtatilmoqda...');
    server.close(async () => {
      await closeDB();
      console.log('[AURA Server] Barcha ulanishlar yopildi.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);
};

startServer();
