import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const isConfigured = () => Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const getTransport = () => {
  if (!isConfigured()) {
    const error = new Error('Elektron xat yuborish xizmati sozlanmagan.');
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

const createEmailHtml = ({ preheader, content }) => `
  <!doctype html>
  <html lang="uz">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>VERDE — LUXE NATURE</title>
    </head>
    <body style="margin:0;padding:24px 12px;background:#f4f4f0;color:#25271f;font-family:Arial,Helvetica,sans-serif">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e7e8e0">
        <tr>
          <td style="padding:28px 32px;border-bottom:1px solid #e7e8e0">
            <div style="font-family:Georgia,'Times New Roman',serif;font-size:25px;font-weight:bold;letter-spacing:6px;color:#1a1a1a">VERDE</div>
            <div style="margin-top:5px;font-size:10px;font-weight:bold;letter-spacing:4px;color:#78884a">LUXE NATURE</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;line-height:1.65;font-size:15px">${content}</td>
        </tr>
        <tr>
          <td style="padding:18px 32px;background:#f8f8f5;color:#73756c;font-size:12px;line-height:1.5">
            Ushbu xat avtomatik yuborildi. Javob yozishingiz shart emas.
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

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
    const deliveryError = new Error('Elektron xat yuborilmadi. Birozdan so‘ng qayta urinib ko‘ring yoki sayt ma’muriga murojaat qiling.');
    deliveryError.statusCode = 503;
    throw deliveryError;
  }
};

export const isEmailConfigured = isConfigured;

export const sendVerificationCode = ({ email, name, code }) => {
  const safeName = escapeHtml(name);
  return sendEmail({
    to: email,
    subject: 'VERDE hisobingizni tasdiqlang',
    text: [
      `Assalomu alaykum, ${name}!`,
      '',
      'VERDE hisobingizni tasdiqlash uchun quyidagi kodni kiriting:',
      '',
      code,
      '',
      'Kod 10 daqiqa amal qiladi va faqat bir marta ishlatiladi.',
      'Agar bu hisobni siz yaratmagan bo‘lsangiz, ushbu xatni e’tiborsiz qoldiring.',
      '',
      'Hurmat bilan, VERDE jamoasi',
    ].join('\n'),
    html: createEmailHtml({
      preheader: 'VERDE hisobingizni tasdiqlash kodi',
      content: `
        <p style="margin:0 0 16px">Assalomu alaykum, ${safeName}!</p>
        <p style="margin:0 0 18px">VERDE hisobingizni tasdiqlash uchun quyidagi kodni kiriting:</p>
        <p style="margin:0 0 20px;padding:14px 16px;background:#f4f5ef;border:1px solid #e6e9dc;text-align:center;font-size:30px;font-weight:bold;letter-spacing:10px;color:#56642b">${code}</p>
        <p style="margin:0 0 12px;color:#62645c">Kod 10 daqiqa amal qiladi va faqat bir marta ishlatiladi.</p>
        <p style="margin:0;color:#62645c">Agar bu hisobni siz yaratmagan bo‘lsangiz, ushbu xatni e’tiborsiz qoldiring.</p>
        <p style="margin:24px 0 0">Hurmat bilan,<br><strong>VERDE jamoasi</strong></p>
      `,
    }),
  });
};

export const sendPasswordResetLink = ({ email, name, token }) => {
  const safeName = escapeHtml(name);
  const resetUrl = `${env.CLIENT_URL.replace(/\/$/, '')}/parolni-tiklash/${encodeURIComponent(token)}`;
  return sendEmail({
    to: email,
    subject: 'VERDE hisobingiz parolini tiklash',
    text: [
      `Assalomu alaykum, ${name}!`,
      '',
      'VERDE hisobingiz uchun parolni tiklash so‘rovi yuborildi.',
      'Yangi parol o‘rnatish uchun quyidagi havolani oching:',
      resetUrl,
      '',
      'Havola 30 daqiqa amal qiladi va faqat bir marta ishlatiladi.',
      'Agar parolni tiklashni siz so‘ramagan bo‘lsangiz, ushbu xatni e’tiborsiz qoldiring. Hisobingiz paroli o‘zgarmaydi.',
      '',
      'Hurmat bilan, VERDE jamoasi',
    ].join('\n'),
    html: createEmailHtml({
      preheader: 'VERDE hisobingiz uchun parolni tiklash havolasi',
      content: `
        <p style="margin:0 0 16px">Assalomu alaykum, ${safeName}!</p>
        <p style="margin:0 0 20px">VERDE hisobingiz uchun parolni tiklash so‘rovi yuborildi. Yangi parol o‘rnatish uchun quyidagi tugmani bosing:</p>
        <p style="margin:0 0 22px;text-align:center">
          <a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:13px 24px;background:#56642b;color:#fff;text-decoration:none;font-weight:bold">Parolni tiklash</a>
        </p>
        <p style="margin:0 0 12px;color:#62645c">Havola 30 daqiqa amal qiladi va faqat bir marta ishlatiladi.</p>
        <p style="margin:0;color:#62645c">Agar parolni tiklashni siz so‘ramagan bo‘lsangiz, ushbu xatni e’tiborsiz qoldiring. Hisobingiz paroli o‘zgarmaydi.</p>
        <p style="margin:24px 0 0">Hurmat bilan,<br><strong>VERDE jamoasi</strong></p>
      `,
    }),
  });
};
