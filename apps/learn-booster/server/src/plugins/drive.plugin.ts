import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { drive_v3, auth } from '@googleapis/drive';
import { Readable } from 'stream';
import { VideoError, VideoMetadata, StreamOptions } from '../types/index.js';

interface DrivePluginOptions {
  credentials: string;
}

export class DriveManager {
  private driveClient;

  constructor(private options: DrivePluginOptions) {
    const authClient = new auth.GoogleAuth({
      keyFile: options.credentials,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });

    this.driveClient = new drive_v3.Drive({
      auth: authClient,
      // אופציונלי - שימוש ב-HTTP/2 לביצועים טובים יותר
      http2: true
    });
  }

  async getVideoMetadata(fileId: string): Promise<VideoMetadata> {
    try {
      const response = await this.driveClient.files.get({
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
    const startTime = process.hrtime();
    try {
      // קבלת מידע על הקובץ
      const metadataStartTime = process.hrtime();
      const metadata = await this.getVideoMetadata(fileId);
      const metadataTime = process.hrtime(metadataStartTime);
      const metadataDuration = (metadataTime[0] * 1e9 + metadataTime[1]) / 1e6;

      // הגדרת פרמטרים להורדה
      const downloadParams: any = {
        fileId,
        alt: 'media'
      };

      // הגדרת headers
      const headers: { [key: string]: string } = {};

      // טיפול בבקשת טווח ספציפי
      if (options.range) {
        headers['Range'] = `bytes=${options.range.start}-${options.range.end}`;
      }
      // אם אין טווח ספציפי, בדוק אפשרויות אחרות
      else {
        // טיפול בנקודת זמן התחלתית
        if (options.timestamp && options.timestamp > 0 && metadata.duration) {
          const estimatedPosition = Math.floor(
            (options.timestamp / metadata.duration) * metadata.size
          );
          headers['Range'] = `bytes=${estimatedPosition}-`;
        }
      }

      // הוספת headers לפרמטרים של הבקשה
      downloadParams.headers = headers;

      // יצירת סטרים להורדה
      const streamStartTime = process.hrtime();
      const response = await this.driveClient.files.get(
        downloadParams,
        { responseType: 'stream' }
      );
      const streamTime = process.hrtime(streamStartTime);
      const streamDuration = (streamTime[0] * 1e9 + streamTime[1]) / 1e6;

      // מדידת זמן כולל
      const totalTime = process.hrtime(startTime);
      const totalDuration = (totalTime[0] * 1e9 + totalTime[1]) / 1e6;

      console.log({
        msg: 'זמני ביצוע getVideoStream',
        fileId,
        metadata: `${metadataDuration.toFixed(2)}ms`,
        stream: `${streamDuration.toFixed(2)}ms`,
        total: `${totalDuration.toFixed(2)}ms`,
        hasRange: !!options.range,
        ...(options.range && {
          rangeStart: options.range.start,
          rangeEnd: options.range.end
        })
      });

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
      await this.driveClient.files.get({
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
