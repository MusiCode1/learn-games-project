import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { google } from 'googleapis';
import { Readable } from 'stream';
import { VideoError, VideoMetadata, StreamOptions } from '../types/index.js';

interface DrivePluginOptions {
  credentials: string;
  projectId: string;
}

class DriveManager {
  private drive;

  constructor(private options: DrivePluginOptions) {
    const auth = new google.auth.GoogleAuth({
      keyFile: options.credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    this.drive = google.drive({ version: 'v3', auth });
  }

  async getVideoMetadata(fileId: string): Promise<VideoMetadata> {
    try {
      const response = await this.drive.files.get({
        fileId,
        fields: 'id, name, mimeType, size, createdTime, modifiedTime, videoMediaMetadata'
      });

      const file = response.data;

      if (!file) {
        throw new VideoError('קובץ לא נמצא', 404);
      }

      if (!file.mimeType?.startsWith('video/')) {
        throw new VideoError('הקובץ אינו סרטון', 400);
      }

      return {
        id: file.id!,
        name: file.name!,
        mimeType: file.mimeType,
        size: parseInt(file.size || '0', 10),
        duration: file.videoMediaMetadata?.durationMillis
          ? Math.floor(Number(file.videoMediaMetadata.durationMillis) / 1000)
          : undefined,
        createdTime: file.createdTime!,
        modifiedTime: file.modifiedTime!
      };
    } catch (error: any) {
      if (error.code === 404) {
        throw new VideoError('קובץ לא נמצא', 404);
      }
      if (error.code === 403) {
        throw new VideoError('אין הרשאות גישה לקובץ', 403);
      }
      throw new VideoError('שגיאה בגישה לגוגל דרייב', 500, error);
    }
  }

  async getVideoStream(fileId: string, options: StreamOptions = {}): Promise<Readable> {
    try {
      // קבלת מידע על הקובץ
      const metadata = await this.getVideoMetadata(fileId);

      // הגדרת פרמטרים להורדה
      const downloadParams: any = {
        fileId,
        alt: 'media'
      };

      // הוספת headers לפי האפשרויות שהתקבלו
      const headers: { [key: string]: string } = {};

      // טיפול באיכות הסרטון
      if (options.quality) {
        switch (options.quality) {
          case 'low':
            headers['Range'] = 'bytes=0-'; // סטרימינג באיכות נמוכה
            break;
          case 'medium':
            // אפשר להוסיף הגדרות ספציפיות לאיכות בינונית
            break;
          case 'high':
            // ברירת מחדל - איכות מלאה
            break;
        }
      }

      // טיפול בנקודת זמן התחלתית
      if (options.timestamp && options.timestamp > 0) {
        // חישוב מיקום בקובץ לפי timestamp
        // זה אומדן פשוט - בפועל צריך לחשב לפי מבנה הקובץ
        const estimatedPosition = Math.floor(
          (options.timestamp / (metadata.duration || 0)) * metadata.size
        );
        headers['Range'] = `bytes=${estimatedPosition}-`;
      }

      if (Object.keys(headers).length > 0) {
        downloadParams.headers = headers;
      }

      // יצירת סטרים להורדה
      const response = await this.drive.files.get(
        downloadParams,
        { responseType: 'stream' }
      );

      return response.data as Readable;
    } catch (error: any) {
      if (error instanceof VideoError) {
        throw error;
      }
      throw new VideoError('שגיאה בהזרמת הסרטון', 500, error);
    }
  }

  async validateAccess(fileId: string): Promise<boolean> {
    try {
      await this.drive.files.get({
        fileId,
        fields: 'id'
      });
      return true;
    } catch {
      return false;
    }
  }
}

const drivePlugin: FastifyPluginAsync<DrivePluginOptions> = async (fastify, options) => {
  const driveManager = new DriveManager(options);

  // הוספת הפונקציות לאובייקט הfastify
  fastify.decorate('drive', {
    getVideoMetadata: (fileId: string) => driveManager.getVideoMetadata(fileId),
    getVideoStream: (fileId: string, options?: StreamOptions) => 
      driveManager.getVideoStream(fileId, options),
    validateAccess: (fileId: string) => driveManager.validateAccess(fileId)
  });
};

// הרחבת טיפוס FastifyInstance
declare module 'fastify' {
  interface FastifyInstance {
    drive: {
      getVideoMetadata(fileId: string): Promise<VideoMetadata>;
      getVideoStream(fileId: string, options?: StreamOptions): Promise<Readable>;
      validateAccess(fileId: string): Promise<boolean>;
    };
  }
}

export default fp(drivePlugin, {
  name: 'drive',
  fastify: '4.x'
});
