import { FastifyPluginAsync, FastifyInstance, FastifyReply } from 'fastify';
import { TokenManager } from './token-manager.js';
import replyFrom from '@fastify/reply-from';
import fp from 'fastify-plugin';

interface DrivePluginOptions {
  credentials: string;
}

// מחלקת שירות לעבודה מול גוגל דרייב
class DriveService {
  constructor(private tokenManager: TokenManager, private fastify: FastifyInstance) {}

  async getFile(fileId: string, reply: FastifyReply) {
    try {
      // קבלת טוקן גישה
      const token = await this.tokenManager.getToken();

      // העברת הבקשה לגוגל דרייב
      return reply.from(`/drive/v3/files/${fileId}`, {
        queryString: {
          alt: 'media'
        },
        rewriteRequestHeaders: (req, headers) => {
          headers['authorization'] = `Bearer ${token}`;
          headers['accept-encoding'] = 'gzip';
          headers['accept'] = '*/*';
          return headers;
        }
      });
    } catch (error: any) {
      throw new Error(`שגיאה בהעברת הבקשה לגוגל דרייב: ${error.message}`);
    }
  }

  async getFolderVideos(folderId: string, reply: FastifyReply) {
    try {
      // קבלת טוקן גישה
      const token = await this.tokenManager.getToken();

      // העברת הבקשה לגוגל דרייב
      return reply.from('/drive/v3/files', {
        queryString: {
          q: `'${folderId}' in parents and mimeType contains 'video/'`,
          fields: 'files(id,name,mimeType,size,createdTime,modifiedTime)',
          pageSize: '100'
        },
        rewriteRequestHeaders: (req, headers) => {
          headers['authorization'] = `Bearer ${token}`;
          return headers;
        }
      });
    } catch (error: any) {
      throw new Error(`שגיאה בקבלת רשימת הסרטונים: ${error.message}`);
    }
  }
}

const drivePlugin: FastifyPluginAsync<DrivePluginOptions> = async (fastify, options) => {
  // יצירת מנהל טוקנים
  const tokenManager = new TokenManager(options.credentials, fastify);

  // רישום הפלאגין
  await fastify.register(replyFrom, {
    base: 'https://www.googleapis.com',
    http: {
      requestOptions: {
        timeout: 300000 // 5 דקות
      }
    }
  });

  // יצירת שירות והוספתו לפלאגין
  const driveService = new DriveService(tokenManager, fastify);
  fastify.decorate('drive', driveService);
};

// הרחבת טיפוס FastifyInstance
declare module 'fastify' {
  interface FastifyInstance {
    drive: DriveService;
  }
}

export default fp(drivePlugin, {
  name: 'drive',
  fastify: '4.x'
});
