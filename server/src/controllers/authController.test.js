import { jest } from '@jest/globals';

const findOne = jest.fn();
const findById = jest.fn();
const create = jest.fn();
const updateOne = jest.fn();

jest.unstable_mockModule('../models/User.js', () => ({
  User: { findOne, findById, create, updateOne },
}));

const { register, login, logout, refreshToken, getMe } = await import('./authController.js');
const { User } = await import('../models/User.js');
const { generateRefreshToken, hashRefreshToken } = await import('../utils/token.js');

const makeUser = (overrides = {}) => ({
  _id: 'user-123',
  name: 'Ada',
  surname: 'Lovelace',
  email: 'ada@example.com',
  phone: '',
  role: 'customer',
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
});

describe('authentication and refresh sessions', () => {
  test('rejects malformed registration payloads as client errors', async () => {
    await expect(invoke(register, { body: null })).rejects.toMatchObject({ statusCode: 400 });
    expect(User.findOne).not.toHaveBeenCalled();
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
    expect(user.refreshTokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.response.cookies.refreshToken.options.httpOnly).toBe(true);
    expect(result.response.cookies.accessToken.options.path).toBe('/');
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
      role: user.role,
      addresses: [],
      newsletterOptIn: false,
    });
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
