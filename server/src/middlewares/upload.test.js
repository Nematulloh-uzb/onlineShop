import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { validateUploadedImage } from './upload.js';

const invoke = (req) => new Promise((resolve, reject) => {
  validateUploadedImage(req, {}, (error) => {
    if (error) reject(error);
    else resolve();
  });
});

describe('uploaded image validation', () => {
  test('rejects files whose content does not match the declared image type', async () => {
    const filePath = path.resolve('uploads', `invalid-${randomUUID()}.png`);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, 'not a png image');

    await expect(invoke({
      file: { path: filePath, mimetype: 'image/png' },
    })).rejects.toMatchObject({ statusCode: 400 });
    await expect(readFile(filePath)).rejects.toMatchObject({ code: 'ENOENT' });
  });

  test('accepts a PNG with a matching file signature', async () => {
    const filePath = path.resolve('uploads', `valid-${randomUUID()}.png`);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));

    try {
      await expect(invoke({
        file: { path: filePath, mimetype: 'image/png' },
      })).resolves.toBeUndefined();
    } finally {
      await unlink(filePath);
    }
  });
});
