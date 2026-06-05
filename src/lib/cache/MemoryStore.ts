interface StoreItem<T> {
  value: T;
  expiresAt: number;
}

export class MemoryStore {
  private store: Map<string, StoreItem<any>> = new Map();
  private defaultTtl: number = 300;

  set<T>(key: string, value: T, ttlSeconds: number = this.defaultTtl): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value as T;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

export const memoryStore = new MemoryStore();
