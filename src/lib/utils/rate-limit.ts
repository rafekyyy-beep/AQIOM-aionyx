interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(key: string, config: RateLimitConfig): { success: boolean; remaining: number; resetAt: Date } {
  const now = Date.now();
  const record = store[key];

  if (!record || now > record.resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    return { success: true, remaining: config.maxRequests - 1, resetAt: new Date(now + config.windowMs) };
  }

  if (record.count >= config.maxRequests) {
    return { success: false, remaining: 0, resetAt: new Date(record.resetTime) };
  }

  record.count++;
  return { success: true, remaining: config.maxRequests - record.count, resetAt: new Date(record.resetTime) };
}
