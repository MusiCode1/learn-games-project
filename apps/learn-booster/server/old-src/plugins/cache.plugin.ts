import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { CacheStats, VideoError } from '../types/index.js';

interface CacheItem {
  value: any;
  timestamp: number;
  size: number;
}

interface CacheOptions {
  ttl: number;        // זמן חיים בשניות
  maxSize: number;    // מספר מקסימלי של פריטים
  maxMemory: number;  // גודל מקסימלי בMB
}

interface CacheMetrics {
  hits: number;
  misses: number;
  totalMemoryUsed: number;
}

class CacheManager {
  private cache: Map<string, CacheItem>;
  private metrics: CacheMetrics;

  constructor(private options: CacheOptions) {
    this.cache = new Map();
    this.metrics = {
      hits: 0,
      misses: 0,
      totalMemoryUsed: 0
    };

    // הפעלת ניקוי אוטומטי כל דקה
    setInterval(() => this.cleanup(), 60000);
  }

  async get(key: string): Promise<any> {
    const item = this.cache.get(key);
    
    if (!item) {
      this.metrics.misses++;
      return null;
    }

    // בדיקה אם הפריט פג תוקף
    if (this.isExpired(item)) {
      this.delete(key);
      this.metrics.misses++;
      return null;
    }

    this.metrics.hits++;
    return item.value;
  }

  async set(key: string, value: any): Promise<void> {
    const size = this.calculateSize(value);

    // בדיקה אם יש מספיק מקום
    if (this.metrics.totalMemoryUsed + size > this.options.maxMemory * 1024 * 1024) {
      throw new VideoError('Cache memory limit exceeded', 507);
    }

    // פינוי מקום אם צריך
    while (this.cache.size >= this.options.maxSize) {
      this.evictOldest();
    }

    const item: CacheItem = {
      value,
      timestamp: Date.now(),
      size
    };

    this.cache.set(key, item);
    this.metrics.totalMemoryUsed += size;
  }

  async has(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (this.isExpired(item)) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  async delete(key: string): Promise<void> {
    const item = this.cache.get(key);
    if (item) {
      this.metrics.totalMemoryUsed -= item.size;
      this.cache.delete(key);
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.metrics.totalMemoryUsed = 0;
  }

  async stats(): Promise<CacheStats> {
    return {
      size: this.cache.size,
      hits: this.metrics.hits,
      misses: this.metrics.misses,
      usage: {
        memory: `${Math.round(this.metrics.totalMemoryUsed / (1024 * 1024))}MB`,
        items: this.cache.size
      }
    };
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > this.options.ttl * 1000;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  private calculateSize(value: any): number {
    // חישוב גודל בבתים (הערכה פשוטה)
    const str = JSON.stringify(value);
    return str.length * 2; // הערכה של 2 בתים לכל תו
  }

  private cleanup(): void {
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.delete(key);
      }
    }
  }
}

const cachePlugin: FastifyPluginAsync<CacheOptions> = async (fastify, options) => {
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

  // ניקוי המטמון בסגירת השרת
  fastify.addHook('onClose', async () => {
    await cacheManager.clear();
  });
};

export default fp(cachePlugin, {
  name: 'cache',
  fastify: '4.x'
});
