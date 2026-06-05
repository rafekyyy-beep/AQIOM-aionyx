type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private level: LogLevel = 'info';

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private format(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${data ? ' ' + JSON.stringify(data) : ''}`;
  }

  debug(message: string, data?: any) {
    if (this.shouldLog('debug')) console.debug(this.format('debug', message, data));
  }

  info(message: string, data?: any) {
    if (this.shouldLog('info')) console.info(this.format('info', message, data));
  }

  warn(message: string, data?: any) {
    if (this.shouldLog('warn')) console.warn(this.format('warn', message, data));
  }

  error(message: string, data?: any) {
    if (this.shouldLog('error')) console.error(this.format('error', message, data));
  }
}

export const logger = new Logger();
