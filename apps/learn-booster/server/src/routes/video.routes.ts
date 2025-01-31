import { FastifyPluginAsync } from 'fastify';
import { VideoError } from '../types/index.js';

const videoRoutes: FastifyPluginAsync = async (fastify) => {
  // סכמות וולידציה
  const paramsSchema = {
    type: 'object',
    required: ['fileId'],
    properties: {
      fileId: { type: 'string', minLength: 1 }
    }
  };


  // קבלת מידע על סרטון
  fastify.get<{
    Params: { fileId: string };
  }>('/video/:fileId/info', {
    schema: {
      params: paramsSchema
    }
  }, async (request, reply) => {
    const { fileId } = request.params;
    const cacheKey = `info:${fileId}`;

    // בדיקה במטמון
    const cachedData = await fastify.cache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // קבלת מידע מגוגל דרייב
    const metadata = await fastify.drive.getVideoMetadata(fileId);

    // שמירה במטמון
    await fastify.cache.set(cacheKey, metadata);

    return metadata;
  });

  // הוק לפני כל בקשה - הוספת זמן התחלה
  fastify.addHook('onRequest', async (request) => {
    request.startTime = process.hrtime();
  });

  // הזרמת סרטון
  fastify.get<{
    Params: { fileId: string };
    Querystring: { timestamp?: number };
  }>('/video/:fileId', {
    schema: {
      params: paramsSchema,
      querystring: {
        type: 'object',
        properties: {
          timestamp: { type: 'number', minimum: 0 }
        }
      }
    }
  }, async (request, reply) => {
    const { fileId } = request.params;
    const { timestamp } = request.query;

    try {
      // בדיקת הרשאות גישה
      const hasAccess = await fastify.drive.validateAccess(fileId);
      if (!hasAccess) {
        throw new VideoError('אין הרשאות גישה לקובץ', 403);
      }

      // קבלת סטרים מגוגל דרייב
      const stream = await fastify.drive.getVideoStream(fileId, {
        timestamp
      });

      // קבלת מטא-דאטה של הקובץ לצורך גודל
      const metadata = await fastify.drive.getVideoMetadata(fileId);
      const fileSize = Number(metadata.size);

      // בדיקת Range header
      const range = request.headers.range;
      if (!range) {
        // ללא Range - שליחת כל הקובץ
        reply.header('Content-Length', fileSize);
        reply.header('Cache-Control', 'public, max-age=31536000');
        reply.header('Accept-Ranges', 'bytes');
        reply.type(metadata.mimeType || 'video/mp4');
        return stream;
      }

      // פירוק טווח הבקשה
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      // וידוא טווח תקין
      if (start >= fileSize || end >= fileSize) {
        reply.code(416); // Range Not Satisfiable
        reply.header('Content-Range', `bytes */${fileSize}`);
        throw new VideoError('טווח לא תקין', 416);
      }

      // קבלת סטרים חלקי מגוגל דרייב
      const partialStream = await fastify.drive.getVideoStream(fileId, {
        timestamp,
        range: { start, end }
      });

      // הגדרת headers לתוכן חלקי
      reply.code(206);
      reply.header('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      reply.header('Content-Length', chunkSize);
      reply.header('Cache-Control', 'public, max-age=31536000');
      reply.header('Accept-Ranges', 'bytes');
      reply.type(metadata.mimeType || 'video/mp4');

      // מדידת זמן הטיפול בבקשה
      const endTime = process.hrtime(request.startTime!);
      const duration = (endTime[0] * 1e9 + endTime[1]) / 1e6; // המרה למילישניות
      
      // לוג עם פרטי הבקשה
      fastify.log.info({
        msg: 'סיום טיפול בבקשת וידאו',
        fileId,
        isPartial: !!range,
        timestamp,
        duration: `${duration.toFixed(2)}ms`,
        ...(range && {
          rangeStart: start,
          rangeEnd: end,
          chunkSize
        })
      });

      return partialStream;
    } catch (error) {
      // מדידת זמן במקרה של שגיאה
      const endTime = process.hrtime(request.startTime!);
      const duration = (endTime[0] * 1e9 + endTime[1]) / 1e6;
      
      fastify.log.error({
        msg: 'שגיאה בטיפול בבקשת וידאו',
        fileId,
        duration: `${duration.toFixed(2)}ms`,
        error: error instanceof Error ? error.message : 'שגיאה לא ידועה'
      });

      if (error instanceof VideoError) {
        throw error;
      }
      throw new VideoError('שגיאה בהזרמת הסרטון', 500, error);
    }
  });

  // ניהול מטמון

  // ניקוי מטמון
  fastify.delete('/cache', async () => {
    await fastify.cache.clear();
    return { success: true };
  });

  // סטטיסטיקות מטמון
  fastify.get('/cache/stats', async () => {
    return fastify.cache.stats();
  });
};

export default videoRoutes;
