export interface AppException {
  id: string;
  message: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export class ExceptionHandler {
  private exceptions: AppException[] = [];

  log(exception: AppException): void {
    this.exceptions.push(exception);
    if (exception.severity === 'critical') {
      console.error('[CRITICAL]', exception);
    }
    if (this.exceptions.length > 1000) {
      this.exceptions = this.exceptions.slice(-1000);
    }
  }

  getAll(): AppException[] {
    return this.exceptions;
  }

  clear(): void {
    this.exceptions = [];
  }
}

export const exceptionHandler = new ExceptionHandler();
