import { NextResponse, type NextRequest } from 'next/server';

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
};

export const CSP_HEADER = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://*.supabase.co",
    "frame-ancestors 'none'",
  ].join('; '),
};

export const HSTS_HEADER = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  Object.entries(CSP_HEADER).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  if (process.env.NODE_ENV === 'production') {
    Object.entries(HSTS_HEADER).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }
  return response;
}
