import Fastify from 'fastify';
import replyFrom from '@fastify/reply-from';
import { GoogleAuth } from 'google-auth-library';

class TokenManager {
  private token: string | null = null;
  private expiresAt: Date | null = null;
  private readonly authClient: GoogleAuth;

  constructor(keyFile: string) {
    this.authClient = new GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
  }

  private isTokenValid(): boolean {
    if (!this.token || !this.expiresAt) {
      return false;
    }
    // נחדש 5 דקות לפני שפג
    const now = new Date();
    return this.expiresAt.getTime() - now.getTime() > 5 * 60 * 1000;
  }

  async getToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.token!;
    }

    const client = await this.authClient.getClient();
    const response = await this.authClient.getAccessToken();
    
    // חישוב זמן התפוגה לפי הזמן הנוכחי + שעה
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = new Date((now + 3600) * 1000);

    console.log('Got new token:', {
      token: response,
      client: client.constructor.name,
      expiresAt
    });

    if (!response) {
      throw new Error('שגיאה בקבלת טוקן גישה');
    }

    this.token = response;
    this.expiresAt = expiresAt;

    return this.token;
  }
}

const fastify = Fastify({
  logger: true
});

// יצירת מנהל טוקנים
const tokenManager = new TokenManager('./credentials.json');

// רישום הפלאגין
fastify.register(replyFrom, {
  base: 'https://www.googleapis.com',
  http: {
    requestOptions: {
      timeout: 300000 // 5 דקות
    }
  }
});

// נתיב לבדיקה
fastify.get('/video/:fileId', async (request, reply) => {
  const { fileId } = request.params as { fileId: string };
  
  // קבלת טוקן גישה
  const token = await tokenManager.getToken();

  const driveUrl = `/drive/v3/files/${fileId}?alt=media`;
  console.log('Full request URL:', {
    url: `https://www.googleapis.com${driveUrl}`,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Range': request.headers.range
    }
  });

  // העברת הבקשה לגוגל דרייב
  return reply.from(driveUrl, {
    queryString: {
      alt: 'media'
    },
    rewriteRequestHeaders: (req, headers) => {
      // שימוש בheaders המקוריים
      headers['authorization'] = `Bearer ${token}`;
      headers['accept-encoding'] = 'gzip';
      headers['accept'] = '*/*';
      return headers;
    },
    rewriteHeaders: (headers) => {
      // לוג של headers מגוגל דרייב
      request.log.info({
        msg: 'Google Drive response headers',
        headers
      });
      
      // החזרת ה-headers כמו שהם
      return headers;
    },
    onError: (reply, error: { error: Error }) => {
      request.log.error(error);
      reply.code(500).send({
        error: 'שגיאה בהעברת הבקשה לגוגל דרייב',
        details: error.error?.message || 'שגיאה לא ידועה'
      });
    }
  });
});

// הפעלת השרת
const start = async () => {
  try {
    await fastify.listen({ port: 5000 });
    console.log('שרת POC רץ על פורט 5000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
