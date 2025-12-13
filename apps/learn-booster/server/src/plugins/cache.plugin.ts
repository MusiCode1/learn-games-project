import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { CacheStats } from '../types/index.js';

interface CachePluginOptions {
  ttl: number;
  maxSize: number;
  maxMemory: number;
}

interface CacheItem {
  value: any;
  timestamp: number;
  size: number;
}

class CacheManager {
  private cache: Map<string, CacheItem>;
  private hits: number;
  private misses: number;

  constructor(private options: CachePluginOptions) {
    this.cache = new Map();
    this.hits = 0;
    this.misses = 0;
  }

  private calculateSize(value: any): number {
    // חישוב גודל בסיסי של אובייקט
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    return str.length * 2; // הערכה בסיסית של גודל בבתים
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.options.ttl * 1000) {
        this.cache.delete(key);
      }
    }
  }

  private enforceMemoryLimit(): void {
    let totalSize = 0;
    const items: [string, CacheItem][] = [...this.cache.entries()];
    
    // מיון לפי זמן - הישנים ביותר קודם
    items.sort((a, b) => a[1].timestamp - b[1].timestamp);

    for (const [key, item] of items) {
      totalSize += item.size;
      if (totalSize > this.options.maxMemory * 1024 * 1024) {
        this.cache.delete(key);
      }
    }
  }

  async get(key: string): Promise<any> {
    this.cleanup();

    const item = this.cache.get(key);
    if (!item) {
      this.misses++;
      return null;
    }

    this.hits++;
    return item.value;
  }

  async set(key: string, value: any): Promise<void> {
    // בדיקת מגבלת גודל המטמון
    if (this.cache.size >= this.options.maxSize) {
      const oldestKey = [...this.cache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    const size = this.calculateSize(value);
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      size
    });

    this.enforceMemoryLimit();
  }

  async has(key: string): Promise<boolean> {
    this.cleanup();
    return this.cache.has(key);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  async stats(): Promise<CacheStats> {
    let totalMemory = 0;
    for (const item of this.cache.values()) {
      totalMemory += item.size;
    }

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      usage: {
        memory: `${(totalMemory / (1024 * 1024)).toFixed(2)}MB`,
        items: this.cache.size
      }
    };
  }
}

const cachePlugin: FastifyPluginAsync<CachePluginOptions> = async (fastify, options) => {
  const cacheManager = new CacheManager(options);

  // הוספת הפונקציות לאובייקט הfastify
  fastify.decorate('cache', {
    get: (key: string) => cacheManager.get(key),
    set: (key: string, value: any) => cacheManager.set(key, value),
    has: (key: string) => cacheManager.has(key),
    delete: (key: string) => cacheManager.delete(key),
    clear: () => cacheManager.clear(),
    stats: () => cacheManager.stats()
  });
};

export default fp(cachePlugin, {
  name: 'cache',
  fastify: '4.x'
});
