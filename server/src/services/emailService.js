import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const isConfigured = () => Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const getTransport = () => {
  if (!isConfigured()) {
    const error = new Error('Email yuborilmadi: Gmail SMTP sozlanmagan. Lokal ishga tushirishda server/.env, Dockerda loyiha boshidagi .env fayliga SMTP_USER (Gmail manzili) va SMTP_PASS (Google App Password) kiriting, so‘ng serverni qayta ishga tushiring.');
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
};

const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character]);

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await getTransport().sendMail({
      from: env.SMTP_FROM || `VERDE <${env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    if (error.code === 'EMAIL_NOT_CONFIGURED') {
      const configurationError = new Error(error.message);
      configurationError.statusCode = 503;
      throw configurationError;
    }

    console.error('[Email] Xat yuborilmadi:', error);
    const deliveryError = new Error('Email yuborilmadi. Gmail manzili, Google App Password, SMTP_HOST/PORT sozlamalari va internet aloqasini tekshirib, qayta urinib ko‘ring.');
    deliveryError.statusCode = 503;
    throw deliveryError;
  }
};

export const isEmailConfigured = isConfigured;

export const sendVerificationCode = ({ email, name, code }) => {
  const safeName = escapeHtml(name);
  return sendEmail({
    to: email,
    subject: 'VERDE hisobini tasdiqlash kodi',
    text: `Salom, ${name}. VERDE hisobingizni tasdiqlash kodi: ${code}. Kod 10 daqiqa amal qiladi.`,
    html: `<p>Salom, ${safeName}.</p><p>VERDE hisobingizni tasdiqlash uchun ushbu kodni kiriting:</p><p style="font-size:28px;font-weight:bold;letter-spacing:8px">${code}</p><p>Kod 10 daqiqa amal qiladi. Agar bu so‘rovni siz yubormagan bo‘lsangiz, xatni e’tiborsiz qoldiring.</p>`,
  });
};

export const sendPasswordResetLink = ({ email, name, token }) => {
  const safeName = escapeHtml(name);
  const resetUrl = `${env.CLIENT_URL.replace(/\/$/, '')}/parolni-tiklash/${encodeURIComponent(token)}`;
  return sendEmail({
    to: email,
    subject: 'VERDE parolini tiklash',
    text: `Salom, ${name}. VERDE parolini tiklash uchun ushbu havolani oching: ${resetUrl}. Havola 30 daqiqa amal qiladi.`,
    html: `<p>Salom, ${safeName}.</p><p>VERDE hisobingiz parolini tiklash uchun quyidagi havolani oching. Havola 30 daqiqa amal qiladi:</p><p><a href="${escapeHtml(resetUrl)}">Parolni tiklash</a></p><p>Agar bu so‘rovni siz yubormagan bo‘lsangiz, xatni e’tiborsiz qoldiring.</p>`,
  });
};
