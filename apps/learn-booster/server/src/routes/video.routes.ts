import { FastifyPluginAsync } from 'fastify';

const videoRoutes: FastifyPluginAsync = async (fastify) => {
  // סכמות וולידציה
  const fileIdSchema = {
    type: 'object',
    required: ['fileId'],
    properties: {
      fileId: { type: 'string', minLength: 1 }
    }
  };

  const folderIdSchema = {
    type: 'object',
    required: ['folderId'],
    properties: {
      folderId: { type: 'string', minLength: 1 }
    }
  };

  // הזרמת סרטון
  fastify.get<{
    Params: { fileId: string };
  }>('/video/:fileId', {
    schema: {
      params: fileIdSchema
    }
  }, async (request, reply) => {
    const { fileId } = request.params;
    try {
      return await fastify.drive.getFile(fileId, reply);
    } catch (error: any) {
      request.log.error(error);
      reply.code(500).send({
        error: 'שגיאה בהעברת הבקשה לגוגל דרייב',
        details: error.message
      });
    }
  });

  // קבלת רשימת סרטונים מתיקייה
  fastify.get<{
    Params: { folderId: string };
  }>('/videos/folder/:folderId', {
    schema: {
      params: folderIdSchema
    }
  }, async (request, reply) => {
    const { folderId } = request.params;
    try {
      return await fastify.drive.getFolderVideos(folderId, reply);
    } catch (error: any) {
      request.log.error(error);
      reply.code(500).send({
        error: 'שגיאה בקבלת רשימת הסרטונים',
        details: error.message
      });
    }
  });
};

export default videoRoutes;
