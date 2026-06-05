import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET');
}

export interface SessionData {
  userId: string;
  sessionId: string;
  deviceId?: string;
  ipAddress: string;
  userAgent: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivity: Date;
}

export class SessionManager {
  private readonly JWT_SECRET: string;
  private readonly SESSION_DURATION = 7 * 24 * 60 * 60;

  constructor() {
    this.JWT_SECRET = JWT_SECRET;
  }

  async createSession(userId: string, ipAddress: string, userAgent: string): Promise<string> {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION * 1000);
    
    const supabase = await createClient();
    await supabase.from('user_sessions').insert({
      user_id: userId,
      session_token: sessionId,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt,
      last_activity: new Date()
    });
    
    const token = jwt.sign(
      { userId, sessionId },
      this.JWT_SECRET,
      { expiresIn: this.SESSION_DURATION }
    );
    
    return token;
  }

  async validateSession(token: string): Promise<SessionData | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      const supabase = await createClient();
      const { data: session, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('session_token', decoded.sessionId)
        .single();
      
      if (error || !session || new Date(session.expires_at) < new Date()) {
        return null;
      }
      
      await supabase
        .from('user_sessions')
        .update({ last_activity: new Date() })
        .eq('session_token', decoded.sessionId);
      
      return {
        userId: session.user_id,
        sessionId: session.session_token,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        expiresAt: new Date(session.expires_at),
        createdAt: new Date(session.created_at),
        lastActivity: new Date(session.last_activity)
      };
    } catch (error) {
      return null;
    }
  }

  async revokeSession(sessionId: string): Promise<void> {
    const supabase = await createClient();
    await supabase.from('user_sessions').delete().eq('session_token', sessionId);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    const supabase = await createClient();
    await supabase.from('user_sessions').delete().eq('user_id', userId);
  }
}

export const sessionManager = new SessionManager();
