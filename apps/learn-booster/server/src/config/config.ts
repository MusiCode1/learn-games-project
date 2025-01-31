import { config as dotenvConfig } from 'dotenv';
import { Config } from '../types/index.js';
import path from 'path';

// טעינת משתני סביבה מקובץ .env
dotenvConfig();

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue!;
}

function getEnvNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  const numValue = value ? parseInt(value, 10) : defaultValue;
  if (numValue === undefined || isNaN(numValue)) {
    throw new Error(`Invalid number value for environment variable: ${key}`);
  }
  return numValue;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

// קונפיגורציית המערכת
export const config: Config = {
  server: {
    port: getEnvNumber('PORT', 3000),
    host: getEnvVar('HOST', 'localhost'),
    env: getEnvVar('NODE_ENV', 'development'),
  },
  google: {
    credentials: path.resolve(getEnvVar('GOOGLE_APPLICATION_CREDENTIALS')),
  },
  cache: {
    ttl: getEnvNumber('CACHE_TTL', 10800),
    maxSize: getEnvNumber('CACHE_MAX_SIZE', 1000),
    maxMemory: getEnvNumber('CACHE_MAX_MEMORY', 1024),
  },
  security: {
    rateLimit: getEnvNumber('RATE_LIMIT', 100),
    corsOrigin: getEnvVar('CORS_ORIGIN', 'http://localhost:3000'),
  },
  performance: {
    threadPoolSize: getEnvNumber('UV_THREADPOOL_SIZE', 32),
    requestTimeout: getEnvNumber('REQUEST_TIMEOUT', 300000),
  },
  logging: {
    level: getEnvVar('LOG_LEVEL', 'info'),
    pretty: getEnvBoolean('LOG_PRETTY', true),
  },
};

// וולידציה בסיסית של הקונפיגורציה
function validateConfig(config: Config): void {
  // וולידציה של פורט
  if (config.server.port < 0 || config.server.port > 65535) {
    throw new Error('Invalid port number');
  }

  // וולידציה של זמן חיים במטמון
  if (config.cache.ttl < 0) {
    throw new Error('Cache TTL must be positive');
  }

  // וולידציה של גודל מטמון
  if (config.cache.maxSize < 0) {
    throw new Error('Cache max size must be positive');
  }

  // וולידציה של הגבלת קצב
  if (config.security.rateLimit < 0) {
    throw new Error('Rate limit must be positive');
  }

  // וולידציה של זמן timeout
  if (config.performance.requestTimeout < 0) {
    throw new Error('Request timeout must be positive');
  }

  // וולידציה של רמת לוגים
  const validLogLevels = ['debug', 'info', 'warn', 'error'];
  if (!validLogLevels.includes(config.logging.level)) {
    throw new Error('Invalid log level');
  }
}

// הרצת וולידציה
validateConfig(config);

export default config;
