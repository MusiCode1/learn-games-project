import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import config from './config/config.js';
import cachePlugin from './plugins/cache.plugin.js';
import drivePlugin from './plugins/drive.plugin.js';
import videoRoutes from './routes/video.routes.js';
import { VideoError } from './types/index.js';

// יצירת שרת Fastify
// הגדרת קידוד
process.env.LANG = 'he_IL.UTF-8';
process.env.LC_ALL = 'he_IL.UTF-8';

const fastify = Fastify({
  logger: {
    level: config.logging.level,
    transport: config.logging.pretty
      ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            messageFormat: '{msg}',
            singleLine: true,
            colorize: true,
            messageKey: 'message'
          }
        }
      : undefined
  },
  forceCloseConnections: true,
  requestTimeout: config.performance.requestTimeout,
  bodyLimit: 1048576 * 10, // 10MB
  ajv: {
    customOptions: {
      removeAdditional: false,
      useDefaults: true,
      coerceTypes: false,
      allErrors: true
    }
  }
});

// הגדרת CORS
await fastify.register(cors, {
  origin: config.security.corsOrigin,
  methods: ['GET', 'DELETE']
});

// הגדרת Rate Limiting
await fastify.register(rateLimit, {
  max: config.security.rateLimit,
  timeWindow: '1 minute'
});

// רישום פלאגינים
await fastify.register(cachePlugin, {
  ttl: config.cache.ttl,
  maxSize: config.cache.maxSize,
  maxMemory: config.cache.maxMemory
});

await fastify.register(drivePlugin, {
  credentials: config.google.credentials
});

// רישום ראוטים
await fastify.register(videoRoutes);

// טיפול בשגיאות
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

  if (error instanceof VideoError) {
    reply.status(error.statusCode).send({
      error: {
        message: error.message,
        details: error.details
      }
    });
    return;
  }

  // שגיאות לא מוכרות
  reply.status(500).send({
    error: {
      message: 'שגיאת שרת פנימית',
      details: config.server.env === 'development' ? error.message : undefined
    }
  });
});

// הוספת hook למדידת זמן תגובה
fastify.addHook('onRequest', async (request) => {
  request.startTime = process.hrtime();
});

fastify.addHook('onResponse', async (request, reply) => {
  const hrtime = process.hrtime(request.startTime);
  const responseTime = hrtime[0] * 1000 + hrtime[1] / 1000000;

  fastify.log.info({
    responseTime,
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode
  });
});

// הפעלת השרת
try {
  await fastify.listen({
    port: config.server.port,
    host: config.server.host
  });

  fastify.log.info(`שרת רץ על http://${config.server.host}:${config.server.port}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

// טיפול בסגירה תקינה
const signals = ['SIGTERM', 'SIGINT'] as const;

for (const signal of signals) {
  process.on(signal, async () => {
    fastify.log.info(`התקבל אות ${signal}, סוגר את השרת...`);
    
    try {
      await fastify.close();
      fastify.log.info('השרת נסגר בהצלחה');
      process.exit(0);
    } catch (err) {
      fastify.log.error('שגיאה בסגירת השרת:', err);
      process.exit(1);
    }
  });
}
