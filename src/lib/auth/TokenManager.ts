import jwt from 'jsonwebtoken';
import { createClient } from '@/lib/supabase/server';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET');
}

export class TokenManager {
  private readonly JWT_SECRET: string;
  private readonly TOKEN_DURATION = 7 * 24 * 60 * 60;

  constructor() {
    this.JWT_SECRET = JWT_SECRET;
  }

  async createToken(userId: string, sessionId: string): Promise<string> {
    return jwt.sign({ userId, sessionId }, this.JWT_SECRET, {
      expiresIn: this.TOKEN_DURATION,
    });
  }

  verifyToken(token: string): any {
    return jwt.verify(token, this.JWT_SECRET);
  }
}

export const tokenManager = new TokenManager();
