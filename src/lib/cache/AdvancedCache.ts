export interface CacheEntry<T> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
  tags: string[];
}

export class AdvancedCache {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private readonly DEFAULT_TTL = 300;
  
  set<T>(key: string, value: T, ttlSeconds: number = this.DEFAULT_TTL, tags: string[] = []): void {
    const entry: CacheEntry<T> = {
      key,
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      createdAt: Date.now(),
      tags
    };
    
    this.memoryCache.set(key, entry as CacheEntry<unknown>);
    this.invalidateByTags(tags);
  }
  
  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key);
    
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    
    return (entry as CacheEntry<T>).value;
  }
  
  delete(key: string): void {
    this.memoryCache.delete(key);
  }
  
  clear(): void {
    this.memoryCache.clear();
  }
  
  invalidateByTag(tag: string): void {
    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.tags.includes(tag)) {
        this.memoryCache.delete(key);
      }
    }
  }
  
  private invalidateByTags(tags: string[]): void {
    for (const tag of tags) {
      this.invalidateByTag(tag);
    }
  }
  
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys())
    };
  }
}

export const cache = new AdvancedCache();
