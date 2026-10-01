import { jest } from '@jest/globals';

const sendMail = jest.fn();
const createTransport = jest.fn(() => ({ sendMail }));
const emailEnv = {
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: 465,
  SMTP_SECURE: true,
  SMTP_USER: '',
  SMTP_PASS: '',
  SMTP_FROM: '',
  CLIENT_URL: 'http://localhost:5173',
};

jest.unstable_mockModule('nodemailer', () => ({
  default: { createTransport },
}));
jest.unstable_mockModule('../config/env.js', () => ({ env: emailEnv }));

const {
  getMissingEmailSettings,
  isEmailConfigured,
  sendPasswordResetLink,
  sendVerificationCode,
} = await import('./emailService.js');

beforeEach(() => {
  jest.clearAllMocks();
  emailEnv.SMTP_USER = '';
  emailEnv.SMTP_PASS = '';
  sendMail.mockResolvedValue({ messageId: 'test-message' });
});

describe('email delivery configuration', () => {
  test('reports missing setting names without exposing their values', () => {
    emailEnv.SMTP_USER = 'private-address@gmail.com';
    emailEnv.SMTP_PASS = 'private-app-password';

    expect(getMissingEmailSettings()).toEqual([]);
    expect(isEmailConfigured()).toBe(true);
    expect(JSON.stringify(getMissingEmailSettings())).not.toContain('private');
  });

  test('returns 503 and never creates a mail transport when credentials are missing', async () => {
    expect(getMissingEmailSettings()).toEqual(['SMTP_USER', 'SMTP_PASS']);
    await expect(sendVerificationCode({
      email: 'user@example.com',
      name: 'Foydalanuvchi',
      code: '123456',
    })).rejects.toMatchObject({
      statusCode: 503,
      message: 'Elektron xat yuborish xizmati sozlanmagan.',
    });
    expect(createTransport).not.toHaveBeenCalled();
    expect(sendMail).not.toHaveBeenCalled();
  });

  test('does not include SMTP error details or credentials in delivery logs', async () => {
    emailEnv.SMTP_USER = 'private-address@gmail.com';
    emailEnv.SMTP_PASS = 'private-app-password';
    sendMail.mockRejectedValue(Object.assign(
      new Error('SMTP rejected private-app-password for private-address@gmail.com'),
      { code: 'EAUTH' },
    ));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await expect(sendPasswordResetLink({
        email: 'user@example.com',
        name: 'Foydalanuvchi',
        token: 'one-time-token',
      })).rejects.toMatchObject({
        statusCode: 503,
        message: 'Elektron xat yuborilmadi. Birozdan so‘ng qayta urinib ko‘ring yoki sayt ma’muriga murojaat qiling.',
      });

      const loggedText = consoleError.mock.calls.flat().join(' ');
      expect(loggedText).toContain('EAUTH');
      expect(loggedText).not.toContain('private-app-password');
      expect(loggedText).not.toContain('private-address@gmail.com');
      expect(loggedText).not.toContain('SMTP rejected');
    } finally {
      consoleError.mockRestore();
    }
  });

  test('sends a confirmation email when valid SMTP credentials are configured', async () => {
    emailEnv.SMTP_USER = 'sender@gmail.com';
    emailEnv.SMTP_PASS = 'app-password';

    await expect(sendVerificationCode({
      email: 'user@example.com',
      name: 'Dilshod',
      code: '123456',
    })).resolves.toBeUndefined();

    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: 'smtp.gmail.com',
      auth: { user: 'sender@gmail.com', pass: 'app-password' },
    }));
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      to: 'user@example.com',
      subject: 'VERDE hisobingizni tasdiqlang',
      text: expect.stringContaining('123456'),
      html: expect.stringContaining('123456'),
    }));
  });
});
