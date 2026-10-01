export const EMAIL_REGEX = /^[^\s@]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const normalizeEmail = (email) => email.trim().toLowerCase();

export const isValidEmail = (email) => (
  typeof email === 'string' &&
  email.length <= 254 &&
  !email.includes('..') &&
  EMAIL_REGEX.test(email)
);
