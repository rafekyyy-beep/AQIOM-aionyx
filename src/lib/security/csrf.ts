import crypto from 'crypto';

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function verifyCsrfToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken));
}

export function getCsrfTokenFromCookies(cookieHeader: string): string | null {
  const match = cookieHeader.match(/csrf-token=([^;]+)/);
  return match ? match[1] : null;
}
