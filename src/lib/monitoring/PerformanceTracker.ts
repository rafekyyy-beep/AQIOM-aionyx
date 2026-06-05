export class PerformanceTracker {
  private metrics: Map<string, number[]> = new Map();
  private startTime: number = Date.now();

  trackApiCall(endpoint: string, durationMs: number): void {
    if (!this.metrics.has(endpoint)) {
      this.metrics.set(endpoint, []);
    }
    this.metrics.get(endpoint)!.push(durationMs);
    
    if (this.metrics.get(endpoint)!.length > 1000) {
      this.metrics.set(endpoint, this.metrics.get(endpoint)!.slice(-1000));
    }
  }

  getAverageResponseTime(endpoint: string): number {
    const times = this.metrics.get(endpoint);
    if (!times || times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }

  getSystemUptime(): number {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
}

export const performanceTracker = new PerformanceTracker();
