/**
 * AQIOM Performance Monitor - نظام مراقبة الأداء
 * 
 * الميزات:
 * - تتبع وقت الاستجابة
 * - تحليل استخدام الذاكرة
 * - مراقبة CPU
 * - تتبع أخطاء API
 * - تقارير الأداء
 */

export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private startTime: number = Date.now();

  trackApiCall(endpoint: string, durationMs: number): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }
    this.metrics.get(endpoint)!.push(durationMs);
    
    // Keep only last 1000 metrics per endpoint
    if (this.metrics.get(endpoint)!.length > 1000) {
      this.metrics.set(endpoint, this.metrics.get(endpoint)!.slice(-1000));
    }
  }

  getAverageResponseTime(endpoint: string): number {
    const times = this.metrics.get(endpoint);
    if (!times || times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  getP95ResponseTime(endpoint: string): number {
    const times = this.metrics.get(endpoint);
    if (!times || times.length === 0) return 0;
    const sorted = [...times].sort((a, b) => a - b);
    const index = Math.floor(sorted.length * 0.95);
    return sorted[index];
  }

  getSystemUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }
}

export const performanceMonitor = new PerformanceMonitor();
