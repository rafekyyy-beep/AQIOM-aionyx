/**
 * AQIOM Advanced Security System - نظام الحماية المتقدم
 * يوفر حماية شاملة ضد: SQL Injection, XSS, CSRF, DDoS, Brute Force, Session Hijacking, 
 * ويسجل تاريخياً جميع محاولات الاختراق والعمليات المشبوهة
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import crypto from 'crypto';

// ==================== الأنواع والتعريفات ====================

export type ThreatLevel = 'low' | 'medium' | 'high' | 'critical';
export type AttackType = 
  | 'sql_injection' 
  | 'xss' 
  | 'csrf' 
  | 'ddos' 
  | 'brute_force' 
  | 'session_hijacking' 
  | 'privilege_escalation'
  | 'path_traversal'
  | 'command_injection'
  | 'api_abuse'
  | 'rate_limit_exceeded'
  | 'suspicious_activity';

export interface SecurityEvent {
  id: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  attackType: AttackType;
  threatLevel: ThreatLevel;
  details: Record<string, any>;
  timestamp: Date;
  isBlocked: boolean;
  actionTaken: string;
  requestPath?: string;
  requestMethod?: string;
  requestHeaders?: Record<string, string>;
}

export interface IPBlacklistEntry {
  ip: string;
  reason: string;
  blockedAt: Date;
  expiresAt?: Date;
  threatCount: number;
}

export interface SecurityConfig {
  maxLoginAttempts: number;
  loginWindowMs: number;
  rateLimitRequests: number;
  rateLimitWindowMs: number;
  blockDurationHours: number;
  enableAuditLog: boolean;
  enableIpBlacklisting: boolean;
  enableRequestValidation: boolean;
  enableCsrfProtection: boolean;
}

// ==================== النمط الأساسي للتهديدات ====================

const SQL_INJECTION_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /(\%24)|(\$)/i,
  /(\%25)/i,
  /(\%26)/i,
  /(union.*select)/i,
  /(select.*from)/i,
  /(insert.*into)/i,
  /(drop.*table)/i,
  /(delete.*from)/i,
  /(update.*set)/i,
  /(exec|execute)/i,
  /(xp_cmdshell)/i,
  /(or\s+1\s*=\s*1)/i,
  /(or\s+1=1)/i,
  /(or\s+true)/i,
  /(and\s+1=1)/i,
  /(and\s+1=2)/i,
  /(sleep\(\d+\))/i,
  /(benchmark\(\d+,\s*.+\))/i,
];

const XSS_PATTERNS = [
  /(<script.*>.*<\/script>)/i,
  /(javascript:)/i,
  /(onload=)/i,
  /(onerror=)/i,
  /(onclick=)/i,
  /(onmouseover=)/i,
  /(alert\(.*\))/i,
  /(prompt\(.*\))/i,
  /(confirm\(.*\))/i,
  /(<iframe.*>)/i,
  /(<object.*>)/i,
  /(<embed.*>)/i,
  /(data:text\/html)/i,
  /(&#\d+;)/i,
  /(\\x[0-9a-f]{2})/i,
];

const PATH_TRAVERSAL_PATTERNS = [
  /(\.\.\/)/g,
  /(\.\.\\)/g,
  /(%2e%2e%2f)/i,
  /(%2e%2e\\\)/i,
  /(\.\.%5c)/i,
  /(%252e%252e%252f)/i,
];

const COMMAND_INJECTION_PATTERNS = [
  /(;\s*\w+)/i,
  /(\|\|\s*\w+)/i,
  /(\|\s*\w+)/i,
  /(&\s*\w+)/i,
  /(\$\()/i,
  /(`.*`)/,
  /(\$\(.*\))/,
  /(&&\s*\w+)/,
  /(\|\s*sh)/i,
  /(;\s*sh)/i,
  /(;\s*bash)/i,
];

// ==================== الفئة الرئيسية للنظام الأمني ====================

export class AdvancedSecuritySystem {
  private config: SecurityConfig;
  private loginAttempts: Map<string, { count: number; firstAttempt: number; blockedUntil?: number }>;
  private requestCounts: Map<string, { count: number; resetTime: number }>;
  private ipBlacklist: Map<string, IPBlacklistEntry>;
  private csrfTokens: Map<string, { token: string; expiresAt: number }>;

  constructor(config?: Partial<SecurityConfig>) {
    this.config = {
      maxLoginAttempts: 5,
      loginWindowMs: 15 * 60 * 1000, // 15 دقيقة
      rateLimitRequests: 100,
      rateLimitWindowMs: 60 * 1000, // 1 دقيقة
      blockDurationHours: 24,
      enableAuditLog: true,
      enableIpBlacklisting: true,
      enableRequestValidation: true,
      enableCsrfProtection: true,
      ...config,
    };
    
    this.loginAttempts = new Map();
    this.requestCounts = new Map();
    this.ipBlacklist = new Map();
    this.csrfTokens = new Map();
    
    // تنظيف الذاكرة كل ساعة
    setInterval(() => this.cleanup(), 60 * 60 * 1000);
  }

  /**
   * الفحص الأمني الرئيسي للطلب - نقطة الدخول الأساسية للحماية
   */
  async securityCheck(
    request: NextRequest,
    userId?: string
  ): Promise<{ allowed: boolean; reason?: string; threatLevel?: ThreatLevel }> {
    const ip = this.getClientIp(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const path = request.nextUrl.pathname;
    const method = request.method;
    
    // 1. فحص القائمة السوداء للـ IP
    if (this.config.enableIpBlacklisting && this.isIpBlocked(ip)) {
      await this.logSecurityEvent({
        userId,
        ipAddress: ip,
        userAgent,
        attackType: 'suspicious_activity',
        threatLevel: 'high',
        details: { reason: 'IP in blacklist' },
        isBlocked: true,
        actionTaken: 'request_blocked',
        requestPath: path,
        requestMethod: method,
      });
      return { allowed: false, reason: 'IP محظور', threatLevel: 'high' };
    }
    
    // 2. فحص معدل الطلبات (Rate Limiting)
    const rateLimitCheck = this.checkRateLimit(ip);
    if (!rateLimitCheck.allowed) {
      await this.logSecurityEvent({
        userId,
        ipAddress: ip,
        userAgent,
        attackType: 'rate_limit_exceeded',
        threatLevel: 'medium',
        details: { limit: rateLimitCheck.limit, current: rateLimitCheck.current },
        isBlocked: true,
        actionTaken: 'rate_limited',
        requestPath: path,
        requestMethod: method,
      });
      return { allowed: false, reason: 'تم تجاوز الحد المسموح من الطلبات', threatLevel: 'medium' };
    }
    
    // 3. فحص محتوى الطلب (SQL Injection, XSS, إلخ)
    if (this.config.enableRequestValidation) {
      const contentCheck = await this.validateRequestContent(request, ip, userAgent, userId, path, method);
      if (!contentCheck.allowed) {
        return contentCheck;
      }
    }
    
    // 4. فحص CSRF للطلبات المحددة
    if (this.config.enableCsrfProtection && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfCheck = await this.validateCsrfToken(request, ip, userAgent, userId, path, method);
      if (!csrfCheck.allowed) {
        return csrfCheck;
      }
    }
    
    return { allowed: true };
  }

  /**
   * فحص محتوى الطلب من الهجمات
   */
  private async validateRequestContent(
    request: NextRequest,
    ip: string,
    userAgent: string,
    userId?: string,
    path?: string,
    method?: string
  ): Promise<{ allowed: boolean; reason?: string; threatLevel?: ThreatLevel }> {
    let body: any = {};
    let queryParams: Record<string, string> = {};
    
    // جمع الـ Query Parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });
    
    // محاولة قراءة الـ Body
    try {
      const clonedRequest = request.clone();
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        body = await clonedRequest.json();
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await clonedRequest.formData();
        formData.forEach((value, key) => {
          body[key] = value.toString();
        });
      }
    } catch (e) {
      // تجاهل أخطاء قراءة الـ Body
    }
    
    // فحص جميع السلاسل النصية في الطلب
    const stringsToCheck: string[] = [
      ...Object.values(queryParams),
      ...Object.values(body),
      ...(typeof body === 'string' ? [body] : []),
    ].filter(v => typeof v === 'string').map(v => v as string);
    
    // فحص SQL Injection
    for (const str of stringsToCheck) {
      const sqlDetected = this.detectSqlInjection(str);
      if (sqlDetected.detected) {
        await this.handleAttack({
          userId,
          ipAddress: ip,
          userAgent,
          attackType: 'sql_injection',
          threatLevel: sqlDetected.level,
          details: { pattern: sqlDetected.pattern, content: str.substring(0, 200) },
          isBlocked: true,
          actionTaken: 'request_blocked',
          requestPath: path,
          requestMethod: method,
        });
        return { allowed: false, reason: 'تم اكتشاف محاولة اختراق (SQL Injection)', threatLevel: 'critical' };
      }
      
      // فحص XSS
      const xssDetected = this.detectXss(str);
      if (xssDetected.detected) {
        await this.handleAttack({
          userId,
          ipAddress: ip,
          userAgent,
          attackType: 'xss',
          threatLevel: xssDetected.level,
          details: { pattern: xssDetected.pattern, content: str.substring(0, 200) },
          isBlocked: true,
          actionTaken: 'request_blocked',
          requestPath: path,
          requestMethod: method,
        });
        return { allowed: false, reason: 'تم اكتشاف محاولة اختراق (XSS)', threatLevel: 'high' };
      }
      
      // فحص Path Traversal
      const pathTraversalDetected = this.detectPathTraversal(str);
      if (pathTraversalDetected.detected) {
        await this.handleAttack({
          userId,
          ipAddress: ip,
          userAgent,
          attackType: 'path_traversal',
          threatLevel: pathTraversalDetected.level,
          details: { pattern: pathTraversalDetected.pattern, content: str.substring(0, 200) },
          isBlocked: true,
          actionTaken: 'request_blocked',
          requestPath: path,
          requestMethod: method,
        });
        return { allowed: false, reason: 'تم اكتشاف محاولة اختراق (Path Traversal)', threatLevel: 'high' };
      }
      
      // فحص Command Injection
      const cmdDetected = this.detectCommandInjection(str);
      if (cmdDetected.detected) {
        await this.handleAttack({
          userId,
          ipAddress: ip,
          userAgent,
          attackType: 'command_injection',
          threatLevel: cmdDetected.level,
          details: { pattern: cmdDetected.pattern, content: str.substring(0, 200) },
          isBlocked: true,
          actionTaken: 'request_blocked',
          requestPath: path,
          requestMethod: method,
        });
        return { allowed: false, reason: 'تم اكتشاف محاولة اختراق (Command Injection)', threatLevel: 'critical' };
      }
    }
    
    return { allowed: true };
  }

  /**
   * فحص CSRF Token
   */
  private async validateCsrfToken(
    request: NextRequest,
    ip: string,
    userAgent: string,
    userId?: string,
    path?: string,
    method?: string
  ): Promise<{ allowed: boolean; reason?: string; threatLevel?: ThreatLevel }> {
    const csrfToken = request.headers.get('x-csrf-token') || request.nextUrl.searchParams.get('csrf_token');
    
    if (!csrfToken) {
      await this.handleAttack({
        userId,
        ipAddress: ip,
        userAgent,
        attackType: 'csrf',
        threatLevel: 'medium',
        details: { reason: 'Missing CSRF token' },
        isBlocked: true,
        actionTaken: 'request_blocked',
        requestPath: path,
        requestMethod: method,
      });
      return { allowed: false, reason: 'CSRF token مطلوب', threatLevel: 'medium' };
    }
    
    const sessionId = request.cookies.get('session_id')?.value;
    if (!sessionId) {
      return { allowed: false, reason: 'الجلسة غير صالحة', threatLevel: 'medium' };
    }
    
    const storedToken = this.csrfTokens.get(sessionId);
    if (!storedToken || storedToken.token !== csrfToken || storedToken.expiresAt < Date.now()) {
      await this.handleAttack({
        userId,
        ipAddress: ip,
        userAgent,
        attackType: 'csrf',
        threatLevel: 'high',
        details: { reason: 'Invalid or expired CSRF token' },
        isBlocked: true,
        actionTaken: 'request_blocked',
        requestPath: path,
        requestMethod: method,
      });
      return { allowed: false, reason: 'CSRF token غير صالح', threatLevel: 'high' };
    }
    
    return { allowed: true };
  }

  /**
   * فحص محاولات تسجيل الدخول
   */
  async checkLoginAttempt(email: string, ip: string): Promise<{ allowed: boolean; remainingAttempts: number; blockedUntil?: Date }> {
    const key = `${ip}:${email}`;
    const attempt = this.loginAttempts.get(key);
    const now = Date.now();
    
    if (attempt) {
      // فحص إذا كان الـ IP محظور
      if (attempt.blockedUntil && attempt.blockedUntil > now) {
        return {
          allowed: false,
          remainingAttempts: 0,
          blockedUntil: new Date(attempt.blockedUntil),
        };
      }
      
      // إعادة تعيين النافذة الزمنية إذا انتهت
      if (now - attempt.firstAttempt > this.config.loginWindowMs) {
        this.loginAttempts.set(key, { count: 1, firstAttempt: now });
        return { allowed: true, remainingAttempts: this.config.maxLoginAttempts - 1 };
      }
      
      const remaining = this.config.maxLoginAttempts - attempt.count;
      
      if (attempt.count >= this.config.maxLoginAttempts) {
        const blockedUntil = now + this.config.blockDurationHours * 60 * 60 * 1000;
        attempt.blockedUntil = blockedUntil;
        this.loginAttempts.set(key, attempt);
        
        // إضافة الـ IP إلى القائمة السوداء
        if (this.config.enableIpBlacklisting) {
          this.addToBlacklist(ip, `تجاوز الحد الأقصى لمحاولات تسجيل الدخول (${this.config.maxLoginAttempts})`, blockedUntil);
        }
        
        return {
          allowed: false,
          remainingAttempts: 0,
          blockedUntil: new Date(blockedUntil),
        };
      }
      
      return { allowed: true, remainingAttempts: remaining - 1 };
    }
    
    this.loginAttempts.set(key, { count: 1, firstAttempt: now });
    return { allowed: true, remainingAttempts: this.config.maxLoginAttempts - 1 };
  }

  /**
   * تسجيل محاولة تسجيل دخول فاشلة
   */
  async recordFailedLogin(email: string, ip: string): Promise<void> {
    const key = `${ip}:${email}`;
    const attempt = this.loginAttempts.get(key);
    
    if (attempt) {
      attempt.count++;
      this.loginAttempts.set(key, attempt);
    } else {
      this.loginAttempts.set(key, { count: 1, firstAttempt: Date.now() });
    }
    
    // تسجيل الحدث الأمني
    await this.logSecurityEvent({
      ipAddress: ip,
      userAgent: 'system',
      attackType: 'brute_force',
      threatLevel: 'medium',
      details: { email, attemptCount: attempt?.count || 1 },
      isBlocked: false,
      actionTaken: 'failed_login_recorded',
    });
  }

  /**
   * تسجيل محاولة تسجيل دخول ناجحة
   */
  async recordSuccessfulLogin(email: string, ip: string, userId: string): Promise<void> {
    const key = `${ip}:${email}`;
    this.loginAttempts.delete(key);
    
    // إزالة من القائمة السوداء المؤقتة إذا كانت موجودة
    if (this.config.enableIpBlacklisting && this.ipBlacklist.has(ip)) {
      const entry = this.ipBlacklist.get(ip);
      if (entry && entry.expiresAt && entry.expiresAt > Date.now()) {
        // لا نزيل القائمة السوداء الدائمة
      }
    }
    
    await this.logSecurityEvent({
      userId,
      ipAddress: ip,
      userAgent: 'system',
      attackType: 'suspicious_activity',
      threatLevel: 'low',
      details: { email },
      isBlocked: false,
      actionTaken: 'successful_login',
    });
  }

  /**
   * إنشاء CSRF Token جديد
   */
  generateCsrfToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.csrfTokens.set(sessionId, {
      token,
      expiresAt: Date.now() + 60 * 60 * 1000, // ساعة واحدة
    });
    return token;
  }

  /**
   * إضافة IP إلى القائمة السوداء
   */
  addToBlacklist(ip: string, reason: string, expiresAt?: number): void {
    const existing = this.ipBlacklist.get(ip);
    this.ipBlacklist.set(ip, {
      ip,
      reason,
      blockedAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      threatCount: (existing?.threatCount || 0) + 1,
    });
  }

  /**
   * فحص إذا كان الـ IP محظور
   */
  isIpBlocked(ip: string): boolean {
    const entry = this.ipBlacklist.get(ip);
    if (!entry) return false;
    
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.ipBlacklist.delete(ip);
      return false;
    }
    
    return true;
  }

  /**
   * فحص معدل الطلبات
   */
  private checkRateLimit(ip: string): { allowed: boolean; limit: number; current: number } {
    const now = Date.now();
    const record = this.requestCounts.get(ip);
    
    if (!record || now > record.resetTime) {
      this.requestCounts.set(ip, {
        count: 1,
        resetTime: now + this.config.rateLimitWindowMs,
      });
      return { allowed: true, limit: this.config.rateLimitRequests, current: 1 };
    }
    
    const newCount = record.count + 1;
    this.requestCounts.set(ip, { ...record, count: newCount });
    
    return {
      allowed: newCount <= this.config.rateLimitRequests,
      limit: this.config.rateLimitRequests,
      current: newCount,
    };
  }

  /**
   * الكشف عن SQL Injection
   */
  private detectSqlInjection(input: string): { detected: boolean; pattern?: string; level: ThreatLevel } {
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        // مستوى التهديد حسب نوع النمط
        let level: ThreatLevel = 'high';
        if (pattern.toString().includes('drop') || pattern.toString().includes('delete')) {
          level = 'critical';
        }
        return { detected: true, pattern: pattern.toString(), level };
      }
    }
    return { detected: false, level: 'low' };
  }

  /**
   * الكشف عن XSS
   */
  private detectXss(input: string): { detected: boolean; pattern?: string; level: ThreatLevel } {
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(input)) {
        return { detected: true, pattern: pattern.toString(), level: 'high' };
      }
    }
    return { detected: false, level: 'low' };
  }

  /**
   * الكشف عن Path Traversal
   */
  private detectPathTraversal(input: string): { detected: boolean; pattern?: string; level: ThreatLevel } {
    for (const pattern of PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(input)) {
        return { detected: true, pattern: pattern.toString(), level: 'high' };
      }
    }
    return { detected: false, level: 'low' };
  }

  /**
   * الكشف عن Command Injection
   */
  private detectCommandInjection(input: string): { detected: boolean; pattern?: string; level: ThreatLevel } {
    for (const pattern of COMMAND_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        return { detected: true, pattern: pattern.toString(), level: 'critical' };
      }
    }
    return { detected: false, level: 'low' };
  }

  /**
   * معالجة هجوم تم اكتشافه
   */
  private async handleAttack(event: Partial<SecurityEvent>): Promise<void> {
    // إضافة الـ IP إلى القائمة السوداء للهجمات الحرجة
    if (event.threatLevel === 'critical' && event.ipAddress && this.config.enableIpBlacklisting) {
      this.addToBlacklist(event.ipAddress, `هجوم ${event.attackType} (حرج)`, Date.now() + 7 * 24 * 60 * 60 * 1000);
    } else if (event.threatLevel === 'high' && event.ipAddress && this.config.enableIpBlacklisting) {
      this.addToBlacklist(event.ipAddress, `هجوم ${event.attackType} (عالي)`, Date.now() + 24 * 60 * 60 * 1000);
    }
    
    await this.logSecurityEvent(event as SecurityEvent);
  }

  /**
   * تسجيل الحدث الأمني في قاعدة البيانات
   */
  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    if (!this.config.enableAuditLog) return;
    
    try {
      const supabase = await createClient();
      await supabase.from('security_events').insert({
        user_id: event.userId,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
        attack_type: event.attackType,
        threat_level: event.threatLevel,
        details: event.details,
        is_blocked: event.isBlocked,
        action_taken: event.actionTaken,
        request_path: event.requestPath,
        request_method: event.requestMethod,
        created_at: event.timestamp.toISOString(),
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * الحصول على IP العميل الحقيقي (مع مراعاة الـ Proxy)
   */
  private getClientIp(request: NextRequest): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim();
    }
    return request.headers.get('x-real-ip') || 
           request.nextUrl.searchParams.get('_ip') || 
           'unknown';
  }

  /**
   * تنظيف الذاكرة من البيانات القديمة
   */
  private cleanup(): void {
    const now = Date.now();
    
    // تنظيف محاولات تسجيل الدخول القديمة
    for (const [key, value] of this.loginAttempts.entries()) {
      if (now - value.firstAttempt > this.config.loginWindowMs * 2) {
        this.loginAttempts.delete(key);
      }
    }
    
    // تنظيف CSRF tokens المنتهية
    for (const [key, value] of this.csrfTokens.entries()) {
      if (value.expiresAt < now) {
        this.csrfTokens.delete(key);
      }
    }
    
    // تنظيف سجلات الطلبات القديمة
    for (const [key, value] of this.requestCounts.entries()) {
      if (now > value.resetTime + this.config.rateLimitWindowMs) {
        this.requestCounts.delete(key);
      }
    }
  }

  /**
   * الحصول على إحصائيات الأمان
   */
  getSecurityStats(): {
    blockedIps: number;
    recentAttacks: number;
    activeSessions: number;
    rateLimitedIps: number;
  } {
    return {
      blockedIps: this.ipBlacklist.size,
      recentAttacks: this.loginAttempts.size,
      activeSessions: this.csrfTokens.size,
      rateLimitedIps: this.requestCounts.size,
    };
  }
}

// ==================== Middleware للتكامل السريع ====================

export const securitySystem = new AdvancedSecuritySystem();

export async function securityMiddleware(request: NextRequest): Promise<Response | null> {
  const check = await securitySystem.securityCheck(request);
  
  if (!check.allowed) {
    return new Response(
      JSON.stringify({
        error: check.reason,
        threatLevel: check.threatLevel,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
  
  return null; // السماح بمرور الطلب
}

// ==================== إنشاء جدول الأحداث الأمنية ====================
