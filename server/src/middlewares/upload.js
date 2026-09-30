import multer from 'multer';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink } from 'node:fs/promises';
import { ApiError } from '../utils/ApiError.js';

const uploadDir = path.resolve('uploads');
const allowedTypes = new Map([
  ['image/jpeg', new Set(['.jpg', '.jpeg'])],
  ['image/png', new Set(['.png'])],
  ['image/webp', new Set(['.webp'])],
]);
const imageSignatures = {
  jpeg: (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  png: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  webp: (buffer) => buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP',
};

await mkdir(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = file.fieldname === 'avatar'
      ? `profile-${req.user._id}-${randomUUID()}${ext}`
      : `${file.fieldname}-${randomUUID()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const extensions = allowedTypes.get(file.mimetype);
  if (extensions?.has(path.extname(file.originalname).toLowerCase())) {
    return cb(null, true);
  }
  cb(new ApiError(400, 'Faqat JPG, PNG yoki WebP rasm yuklash mumkin'));
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter,
});

export const validateUploadedImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const content = await readFile(req.file.path);
    const isValidImage = (
      (req.file.mimetype === 'image/jpeg' && imageSignatures.jpeg(content))
      || (req.file.mimetype === 'image/png' && imageSignatures.png(content))
      || (req.file.mimetype === 'image/webp' && imageSignatures.webp(content))
    );
    if (isValidImage) return next();

    await unlink(req.file.path);
    return next(new ApiError(400, 'Fayl mazmuni tanlangan rasm formatiga mos emas'));
  } catch (error) {
    if (error.code !== 'ENOENT') {
      await unlink(req.file.path).catch((cleanupError) => {
        if (cleanupError.code !== 'ENOENT') console.error('[Upload] Vaqtinchalik faylni o‘chirish xatosi:', cleanupError);
      });
    }
    return next(error);
  }
};
