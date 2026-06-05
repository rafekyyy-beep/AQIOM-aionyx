export const APP_CONFIG = {
  NAME: 'AQIOM',
  VERSION: '1.0.0',
  ENV: process.env.NODE_ENV || 'development',
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_DEV: process.env.NODE_ENV === 'development',
} as const;

export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 4000,
  MAX_CONVERSATION_TITLE: 100,
  DEFAULT_TEMPERATURE: 0.7,
  MAX_TOKENS: 2048,
} as const;

export const SECURITY_CONFIG = {
  JWT_EXPIRY_DAYS: 7,
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW_MS: 60 * 1000,
} as const;
