import { FastifyRequest } from 'fastify';

// הגדרות סרטון
export interface VideoMetadata {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  duration?: number;
  createdTime: string;
  modifiedTime: string;
}

// הרחבת טיפוס הבקשה של Fastify
declare module 'fastify' {
  interface FastifyRequest {
    startTime?: [number, number]; // עבור מדידת זמן תגובה
  }
}

// הגדרות קונפיגורציה
export interface Config {
  server: {
    port: number;
    host: string;
    env: string;
  };
  google: {
    credentials: string;
  };
  cache: {
    ttl: number;
    maxSize: number;
    maxMemory: number;
  };
  security: {
    rateLimit: number;
    corsOrigin: string;
  };
  performance: {
    threadPoolSize: number;
    requestTimeout: number;
  };
  logging: {
    level: string;
    pretty: boolean;
  };
}

// שגיאות מותאמות אישית
export class VideoError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'VideoError';
  }
}

// סטטיסטיקות מטמון
export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  usage: {
    memory: string;
    items: number;
  };
}

// הרחבת FastifyInstance עבור הפלאגינים שלנו
declare module 'fastify' {
  interface FastifyInstance {
    cache: {
      get(key: string): Promise<any>;
      set(key: string, value: any): Promise<void>;
      has(key: string): Promise<boolean>;
      delete(key: string): Promise<void>;
      clear(): Promise<void>;
      stats(): Promise<CacheStats>;
    };
  }
}
