import { jest } from '@jest/globals';
import { createHash, createHmac } from 'node:crypto';
import bcrypt from 'bcryptjs';

const findOne = jest.fn();
const findById = jest.fn();
const create = jest.fn();
const updateOne = jest.fn();
const isEmailConfigured = jest.fn(() => true);
const getMissingEmailSettings = jest.fn(() => []);
const sendPasswordResetLink = jest.fn().mockResolvedValue(undefined);
const sendVerificationCode = jest.fn().mockResolvedValue(undefined);

jest.unstable_mockModule('../models/User.js', () => ({
  User: { findOne, findById, create, updateOne },
}));
jest.unstable_mockModule('../services/emailService.js', () => ({
  getMissingEmailSettings,
  isEmailConfigured,
  sendPasswordResetLink,
  sendVerificationCode,
}));

const { register, login, logout, refreshToken, getMe, forgotPassword, resetPassword, verifyEmail } = await import('./authController.js');
const { User } = await import('../models/User.js');
const { generateRefreshToken, hashRefreshToken } = await import('../utils/token.js');
const { env } = await import('../config/env.js');

const makeUser = (overrides = {}) => ({
  _id: 'user-123',
  name: 'Ada',
  surname: 'Lovelace',
  email: 'ada@example.com',
  phone: '',
  role: 'customer',
  emailVerified: true,
  addresses: [],
  newsletterOptIn: false,
  isActive: true,
  save: jest.fn().mockResolvedValue(undefined),
  comparePassword: jest.fn().mockResolvedValue(true),
  ...overrides,
});

const invoke = (handler, req) => new Promise((resolve, reject) => {
  const response = {
    cookies: {},
    clearedCookies: [],
    statusCode: 200,
    cookie(name, value, options) {
      this.cookies[name] = { value, options };
      return this;
    },
    clearCookie(name, options) {
      this.clearedCookies.push({ name, options });
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      resolve({ response: this, body, statusCode: this.statusCode });
      return this;
    },
  };

  handler(req, response, (error) => {
    if (error) reject(error);
    else resolve({ response, statusCode: response.statusCode });
  });
});

beforeEach(() => {
  jest.clearAllMocks();
  isEmailConfigured.mockReturnValue(true);
  getMissingEmailSettings.mockReturnValue([]);
  sendPasswordResetLink.mockResolvedValue(undefined);
  sendVerificationCode.mockResolvedValue(undefined);
});

describe('authentication and refresh sessions', () => {
  test('rejects malformed email addresses before database lookup in all credential flows', async () => {
    await expect(invoke(register, {
      body: { name: 'Ada', email: 'not-an-email', password: 'secret123' },
    })).rejects.toMatchObject({ statusCode: 400 });

    await expect(invoke(login, {
      body: { email: 'ada..byron@gmail.com', password: 'secret123' },
    })).rejects.toMatchObject({ statusCode: 400 });

    await expect(invoke(forgotPassword, {
      body: { email: 'ada@gmail' },
    })).rejects.toMatchObject({ statusCode: 400 });

    expect(User.findOne).not.toHaveBeenCalled();
  });

  test('logs the reset link through the development email service and never returns it in the API response', async () => {
    const originalNodeEnv = env.NODE_ENV;
    const user = makeUser();
    env.NODE_ENV = 'development';
    isEmailConfigured.mockReturnValue(false);
    getMissingEmailSettings.mockReturnValue(['SMTP_USER', 'SMTP_PASS']);
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    try {
      const result = await invoke(forgotPassword, { body: { email: user.email } });

      expect(result.statusCode).toBe(200);
      expect(result.body.message).toMatch(/havolasi yuborildi/);
      expect(JSON.stringify(result.body)).not.toContain('/parolni-tiklash/');
      expect(sendPasswordResetLink).toHaveBeenCalledWith(expect.objectContaining({
        email: user.email,
        token: expect.any(String),
      }));
      expect(User.create).not.toHaveBeenCalled();
    } finally {
      env.NODE_ENV = originalNodeEnv;
    }
  });

  test('rejects malformed registration payloads as client errors', async () => {
    await expect(invoke(register, { body: null })).rejects.toMatchObject({ statusCode: 400 });
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test('checks confirmed database emails before requiring configured email delivery on registration', async () => {
    const user = makeUser({ emailVerified: true });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    isEmailConfigured.mockReturnValue(false);
    const originalNodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'development';

    try {
      await expect(invoke(register, {
        body: { name: 'Ada', email: user.email, password: 'secret123' },
      })).rejects.toMatchObject({ statusCode: 409 });
      expect(User.create).not.toHaveBeenCalled();
      expect(sendVerificationCode).not.toHaveBeenCalled();
    } finally {
      env.NODE_ENV = originalNodeEnv;
    }
  });

  test('normalizes registration email and stores a refresh-token hash', async () => {
    const user = makeUser();
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue(user);

    const result = await invoke(register, {
      body: {
        name: 'Ada',
        email: ' ADA@Example.com ',
        password: 'secret123',
      },
    });

    expect(User.findOne).toHaveBeenCalledWith({ email: 'ada@example.com' });
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'ada@example.com' }));
    const storedPasswordHash = User.create.mock.calls[0][0].passwordHash;
    expect(storedPasswordHash).not.toBe('secret123');
    await expect(bcrypt.compare('secret123', storedPasswordHash)).resolves.toBe(true);
    expect(result.body.data.user).not.toHaveProperty('passwordHash');
    expect(user.refreshTokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.response.cookies.refreshToken.options.httpOnly).toBe(true);
    expect(result.response.cookies.accessToken.options.path).toBe('/');
  });

  test('sends a hashed, expiring verification code without creating a session', async () => {
    const user = makeUser({ emailVerified: false });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    User.create.mockResolvedValue(user);
    const originalNodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'development';

    try {
      const result = await invoke(register, {
        body: { name: 'Ada', email: user.email, password: 'secret123' },
      });

      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        email: user.email,
        emailVerified: false,
      }));
      expect(user.emailVerificationCodeHash).toMatch(/^[a-f0-9]{64}$/);
      expect(user.emailVerificationExpires.getTime()).toBeGreaterThan(Date.now());
      expect(sendVerificationCode).toHaveBeenCalledWith({
        email: user.email,
        name: user.name,
        code: expect.stringMatching(/^\d{6}$/),
      });
      expect(result.statusCode).toBe(201);
      expect(result.body.data.email).toBe(user.email);
      expect(result.response.cookies.refreshToken).toBeUndefined();
    } finally {
      env.NODE_ENV = originalNodeEnv;
    }
  });

  test('normalizes login email and rejects an incorrect password', async () => {
    const user = makeUser();
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    const result = await invoke(login, { body: { email: ' ADA@Example.com ', password: 'secret123' } });
    expect(User.findOne).toHaveBeenCalledWith({ email: 'ada@example.com' });
    expect(user.comparePassword).toHaveBeenCalledWith('secret123');
    expect(result.statusCode).toBe(200);

    user.comparePassword.mockResolvedValue(false);
    await expect(invoke(login, { body: { email: 'ada@example.com', password: 'wrong' } }))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  test('prevents unverified accounts from logging in', async () => {
    const user = makeUser({ emailVerified: false });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    await expect(invoke(login, { body: { email: user.email, password: 'secret123' } }))
      .rejects.toMatchObject({ statusCode: 403 });
    expect(user.comparePassword).toHaveBeenCalledWith('secret123');

    user.comparePassword.mockResolvedValue(false);
    await expect(invoke(login, { body: { email: user.email, password: 'wrong' } }))
      .rejects.toMatchObject({ statusCode: 401 });

    user.comparePassword.mockResolvedValue(true);
    user.emailVerified = undefined;
    await expect(invoke(login, { body: { email: user.email, password: 'secret123' } }))
      .rejects.toMatchObject({ statusCode: 403 });
  });

  test('counts invalid email verification codes and never authenticates', async () => {
    const user = makeUser({
      emailVerified: false,
      emailVerificationCodeHash: 'a'.repeat(64),
      emailVerificationExpires: new Date(Date.now() + 60_000),
      emailVerificationAttempts: 1,
    });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    await expect(invoke(verifyEmail, { body: { email: user.email, code: '000000' } }))
      .rejects.toMatchObject({ statusCode: 400 });
    expect(user.emailVerificationAttempts).toBe(2);
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(user.refreshTokenHash).toBeUndefined();
  });

  test('verifies a valid email code and creates a session', async () => {
    const code = '582104';
    const user = makeUser({
      emailVerified: false,
      emailVerificationCodeHash: createHmac('sha256', env.JWT_ACCESS_SECRET).update(code).digest('hex'),
      emailVerificationExpires: new Date(Date.now() + 60_000),
      emailVerificationAttempts: 0,
    });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    const result = await invoke(verifyEmail, { body: { email: user.email, code } });

    expect(user.emailVerified).toBe(true);
    expect(user.emailVerificationCodeHash).toBeUndefined();
    expect(user.emailVerificationExpires).toBeUndefined();
    expect(user.emailVerificationAttempts).toBe(0);
    expect(result.response.cookies.refreshToken.options.httpOnly).toBe(true);
  });

  test('returns only the public fields for the current user', async () => {
    const user = makeUser({
      passwordHash: 'must-not-be-returned',
      refreshTokenHash: 'must-not-be-returned',
    });

    const result = await invoke(getMe, { user });
    expect(result.body.data.user).toEqual({
      id: user._id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      phone: user.phone,
      avatarUrl: '',
      role: user.role,
      addresses: [],
      newsletterOptIn: false,
    });
  });

  test('forgot password returns 503 without looking up users or creating reset tokens', async () => {
    await expect(invoke(forgotPassword, { body: { email: 'ada@example.com' } }))
      .rejects.toMatchObject({
        statusCode: 503,
        message: 'Parolni tiklash xizmati hozircha mavjud emas',
      });
    expect(User.findOne).not.toHaveBeenCalled();
    expect(User.create).not.toHaveBeenCalled();
  });

  test('emails a short-lived password reset token without revealing it in the response', async () => {
    const user = makeUser({ emailVerified: true });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    const originalNodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'development';

    try {
      const result = await invoke(forgotPassword, { body: { email: user.email } });
      const [{ token }] = sendPasswordResetLink.mock.calls[0];

      expect(user.resetPasswordTokenHash).toBe(createHash('sha256').update(token).digest('hex'));
      expect(user.resetPasswordExpires.getTime()).toBeGreaterThan(Date.now());
      expect(user.resetPasswordExpires.getTime()).toBeLessThanOrEqual(Date.now() + 30 * 60 * 1000);
      expect(result.statusCode).toBe(200);
      expect(result.body.data).toBeUndefined();
      expect(result.body.message).toMatch(/havolasi yuborildi/);
    } finally {
      env.NODE_ENV = originalNodeEnv;
    }
  });

  test('does not report reset success and clears the token when email delivery fails', async () => {
    const user = makeUser({ emailVerified: true });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    const originalNodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'development';
    sendPasswordResetLink.mockRejectedValue(Object.assign(
      new Error('Elektron xat yuborilmadi. Birozdan so‘ng qayta urinib ko‘ring.'),
      { statusCode: 503 },
    ));

    try {
      await expect(invoke(forgotPassword, { body: { email: user.email } }))
        .rejects.toMatchObject({ statusCode: 503 });

      expect(user.resetPasswordTokenHash).toBeUndefined();
      expect(user.resetPasswordExpires).toBeUndefined();
      expect(user.save).toHaveBeenCalledTimes(2);
    } finally {
      env.NODE_ENV = originalNodeEnv;
    }
  });

  test('returns a clear SMTP configuration error without creating reset state', async () => {
    const originalNodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'production';
    isEmailConfigured.mockReturnValue(false);

    try {
      await expect(invoke(forgotPassword, { body: { email: 'ada@example.com' } }))
        .rejects.toMatchObject({
          statusCode: 503,
          message: 'Email xizmati vaqtincha ishlamayapti. Keyinroq qayta urinib ko‘ring.',
        });
      expect(User.findOne).not.toHaveBeenCalled();
    } finally {
      env.NODE_ENV = originalNodeEnv;
    }
  });

  test('sends reset links by email in development when SMTP is configured', async () => {
    const user = makeUser({ emailVerified: true });
    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });
    const originalNodeEnv = env.NODE_ENV;
    env.NODE_ENV = 'development';
    isEmailConfigured.mockReturnValue(true);

    try {
      const result = await invoke(forgotPassword, { body: { email: user.email } });
      const [{ token }] = sendPasswordResetLink.mock.calls[0];

      expect(user.resetPasswordTokenHash).toBe(createHash('sha256').update(token).digest('hex'));
      expect(user.resetPasswordExpires.getTime()).toBeGreaterThan(Date.now());
      expect(result.body.data).toBeUndefined();
      expect(result.body.message).toMatch(/havolasi yuborildi/);
      expect(sendPasswordResetLink).toHaveBeenCalledWith({
        email: user.email,
        name: user.name,
        token,
      });
    } finally {
      env.NODE_ENV = originalNodeEnv;
    }
  });

  test('reset password only finds a matching, unexpired token hash', async () => {
    const token = 'cryptographically-generated-reset-token';
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const user = makeUser({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: new Date(Date.now() + 60_000),
    });
    const select = jest.fn().mockResolvedValue(user);
    User.findOne.mockReturnValue({ select });

    const result = await invoke(resetPassword, {
      params: { token },
      body: { password: 'newpass123' },
    });

    expect(User.findOne).toHaveBeenCalledWith({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: expect.any(Number) },
    });
    expect(user.passwordHash).not.toBe('must-not-be-returned');
    await expect(bcrypt.compare('newpass123', user.passwordHash)).resolves.toBe(true);
    expect(user.resetPasswordTokenHash).toBeUndefined();
    expect(user.resetPasswordExpires).toBeUndefined();
    expect(user.save).toHaveBeenCalledTimes(2);
    expect(result.statusCode).toBe(200);
    expect(result.body.data.user).not.toHaveProperty('passwordHash');
    expect(result.response.cookies.refreshToken).toBeDefined();

    User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
    await expect(invoke(resetPassword, {
      params: { token: 'wrong-token' },
      body: { password: 'newpass123' },
    })).rejects.toMatchObject({ statusCode: 400 });
  });

  test('rotates refresh tokens and rejects reuse of the prior token', async () => {
    const oldToken = generateRefreshToken('user-123');
    const user = makeUser({ refreshTokenHash: hashRefreshToken(oldToken) });
    User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(user) });

    const result = await invoke(refreshToken, { cookies: { refreshToken: oldToken } });
    const rotatedToken = result.response.cookies.refreshToken.value;
    expect(rotatedToken).not.toBe(oldToken);
    expect(user.refreshTokenHash).toBe(hashRefreshToken(rotatedToken));
    expect(result.body.data.accessToken).toBeTruthy();

    await expect(invoke(refreshToken, { cookies: { refreshToken: oldToken } }))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  test('logout revokes the matching refresh token and clears cookies on the same path', async () => {
    const token = generateRefreshToken('user-123');
    User.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const result = await invoke(logout, { cookies: { refreshToken: token } });

    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: 'user-123', refreshTokenHash: hashRefreshToken(token) },
      { $unset: { refreshTokenHash: 1 } }
    );
    expect(result.response.clearedCookies).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'accessToken', options: expect.objectContaining({ path: '/' }) }),
      expect.objectContaining({ name: 'refreshToken', options: expect.objectContaining({ path: '/' }) }),
    ]));
    expect(result.body.success).toBe(true);
  });
});
