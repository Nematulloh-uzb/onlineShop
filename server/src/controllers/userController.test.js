import { jest } from '@jest/globals';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const findById = jest.fn();
const findByIdAndUpdate = jest.fn();
jest.unstable_mockModule('../models/User.js', () => ({
  User: { findById, findByIdAndUpdate },
}));

const { updateAvatar, updateMe } = await import('./userController.js');

const invoke = (handler, req) => new Promise((resolve, reject) => {
  const response = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      resolve({ body, statusCode: this.statusCode });
      return this;
    },
  };
  handler(req, response, (error) => error && reject(error));
});

describe('profile avatar upload', () => {
  beforeEach(() => jest.clearAllMocks());

  test('saves the new profile image and returns only public account fields', async () => {
    const userId = 'user-123';
    const suffix = randomUUID();
    const previousPath = path.resolve('uploads', `profile-${userId}-old.png`);
    const newPath = path.resolve('uploads', `profile-${userId}-${suffix}.png`);
    await mkdir(path.dirname(newPath), { recursive: true });
    await writeFile(previousPath, 'old-avatar');
    await writeFile(newPath, 'new-avatar');

    const user = {
      _id: userId,
      name: 'Ada',
      surname: 'Lovelace',
      email: 'ada@example.com',
      phone: '',
      role: 'customer',
      addresses: [],
      newsletterOptIn: false,
      avatarUrl: `/uploads/${path.basename(previousPath)}`,
      passwordHash: 'private',
      refreshTokenHash: 'private',
      save: jest.fn().mockResolvedValue(undefined),
    };
    findById.mockResolvedValue(user);

    try {
      const result = await invoke(updateAvatar, {
        user: { _id: userId },
        file: { filename: path.basename(newPath), path: newPath },
      });

      expect(user.avatarUrl).toBe(`/uploads/${path.basename(newPath)}`);
      expect(user.save).toHaveBeenCalledTimes(1);
      expect(result.statusCode).toBe(200);
      expect(result.body.data.user).toEqual({
        id: userId,
        name: 'Ada',
        surname: 'Lovelace',
        email: 'ada@example.com',
        phone: '',
        avatarUrl: `/uploads/${path.basename(newPath)}`,
        role: 'customer',
        addresses: [],
        newsletterOptIn: false,
      });
    } finally {
      await Promise.all([previousPath, newPath].map((filePath) => unlink(filePath).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
      })));
    }
  });

  test('rejects an empty upload without looking up an account', async () => {
    await expect(invoke(updateAvatar, { user: { _id: 'user-123' } }))
      .rejects.toMatchObject({ statusCode: 400 });
    expect(findById).not.toHaveBeenCalled();
  });
});

describe('profile editing', () => {
  beforeEach(() => jest.clearAllMocks());

  test('updates editable account fields and returns the public user', async () => {
    const user = {
      _id: 'user-123',
      name: 'Ada',
      surname: 'Byron',
      email: 'ada@example.com',
      phone: '123456',
      avatarUrl: '',
      role: 'customer',
      addresses: [],
      newsletterOptIn: true,
      passwordHash: 'private',
    };
    findByIdAndUpdate.mockResolvedValue(user);

    const result = await invoke(updateMe, {
      user: { _id: 'user-123' },
      body: { name: ' Ada ', surname: 'Byron', phone: '123456', newsletterOptIn: true },
    });

    expect(findByIdAndUpdate).toHaveBeenCalledWith(
      'user-123',
      { name: 'Ada', surname: 'Byron', phone: '123456', newsletterOptIn: true },
      { new: true, runValidators: true },
    );
    expect(result.body.data.user).toEqual({
      id: 'user-123',
      name: 'Ada',
      surname: 'Byron',
      email: 'ada@example.com',
      phone: '123456',
      avatarUrl: '',
      role: 'customer',
      addresses: [],
      newsletterOptIn: true,
    });
  });

  test('rejects malformed profile changes before database access', async () => {
    await expect(invoke(updateMe, {
      user: { _id: 'user-123' },
      body: { name: '   ' },
    })).rejects.toMatchObject({ statusCode: 400 });
    expect(findByIdAndUpdate).not.toHaveBeenCalled();
  });
});
