import { FastifyPluginAsync } from 'fastify';
import { StreamOptions, VideoError } from '../types/index.js';

const videoRoutes: FastifyPluginAsync = async (fastify) => {
  // סכמות עבור וולידציה
  const paramsSchema = {
    type: 'object',
    required: ['fileId'],
    properties: {
      fileId: { type: 'string', minLength: 1 }
    }
  };

  const querySchema = {
    type: 'object',
    properties: {
      quality: { type: 'string', enum: ['high', 'medium', 'low'] },
      timestamp: { type: 'number', minimum: 0 }
    }
  };

  // קבלת סרטון
  fastify.get<{
    Params: { fileId: string };
    Querystring: StreamOptions;
  }>('/video/:fileId', {
    schema: {
      params: paramsSchema,
      querystring: querySchema
    },
    handler: async (request, reply) => {
      const { fileId } = request.params;
      const { quality, timestamp } = request.query;

      try {
        // בדיקה אם הסרטון קיים במטמון
        const cacheKey = `video:${fileId}:${quality}:${timestamp}`;
        const cachedStream = await fastify.cache.get(cacheKey);
        
        if (cachedStream) {
          // שליחת הסרטון מהמטמון
          return reply
            .header('Content-Type', 'video/mp4')
            .send(cachedStream);
        }

        // קבלת סטרים מגוגל דרייב
        const stream = await fastify.drive.getVideoStream(fileId, {
          quality,
          timestamp
        });

        // שמירה במטמון אם הסרטון קטן מספיק
        const metadata = await fastify.drive.getVideoMetadata(fileId);
        if (metadata.size < 100 * 1024 * 1024) { // שמירה רק אם קטן מ-100MB
          await fastify.cache.set(cacheKey, stream);
        }

        // שליחת הסטרים
        return reply
          .header('Content-Type', metadata.mimeType)
          .send(stream);
      } catch (error) {
        if (error instanceof VideoError) {
          throw error;
        }
        throw new VideoError('שגיאה בהזרמת הסרטון', 500);
      }
    }
  });

  // קבלת מידע על סרטון
  fastify.get<{
    Params: { fileId: string };
  }>('/video/:fileId/info', {
    schema: {
      params: paramsSchema
    },
    handler: async (request, reply) => {
      const { fileId } = request.params;

      try {
        // בדיקה אם המידע קיים במטמון
        const cacheKey = `metadata:${fileId}`;
        const cachedMetadata = await fastify.cache.get(cacheKey);
        
        if (cachedMetadata) {
          return cachedMetadata;
        }

        // קבלת מידע מגוגל דרייב
        const metadata = await fastify.drive.getVideoMetadata(fileId);
        
        // שמירה במטמון
        await fastify.cache.set(cacheKey, metadata);
        
        return metadata;
      } catch (error) {
        if (error instanceof VideoError) {
          throw error;
        }
        throw new VideoError('שגיאה בקבלת מידע על הסרטון', 500);
      }
    }
  });

  // ניקוי מטמון
  fastify.delete('/cache', {
    handler: async (request, reply) => {
      await fastify.cache.clear();
      return { success: true };
    }
  });

  // סטטיסטיקות מטמון
  fastify.get('/cache/stats', {
    handler: async (request, reply) => {
      return await fastify.cache.stats();
    }
  });

  // בדיקת בריאות
  fastify.get('/health', {
    handler: async (request, reply) => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
    }
  });
}

export default videoRoutes;
