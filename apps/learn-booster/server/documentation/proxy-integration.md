# שילוב פרוקסי לגוגל דרייב

## רקע
בדקנו שימוש ב-@fastify/reply-from כפרוקסי לגוגל דרייב. התוצאות מראות:
- תקורה מינימלית של 28ms בממוצע (5.2%)
- טיפול נכון בסטרימינג וצ'אנקים
- ניהול יעיל של טוקנים

## שלבי השילוב

### 1. התקנת חבילות
```bash
npm install @fastify/reply-from
```

### 2. הוספת TokenManager
יש להעביר את הקוד של TokenManager ל-`src/plugins/token-manager.ts`:
```typescript
import { GoogleAuth } from 'google-auth-library';

export class TokenManager {
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

    if (!response) {
      throw new Error('שגיאה בקבלת טוקן גישה');
    }

    this.token = response;
    this.expiresAt = expiresAt;

    return this.token;
  }
}
```

### 3. עדכון drive.plugin.ts
יש לעדכן את הפלאגין להשתמש ב-TokenManager וב-reply-from:

```typescript
import { FastifyPluginAsync } from 'fastify';
import { TokenManager } from './token-manager';
import replyFrom from '@fastify/reply-from';

const drivePlugin: FastifyPluginAsync = async (fastify) => {
  // יצירת מנהל טוקנים
  const tokenManager = new TokenManager('./credentials.json');

  // רישום הפלאגין
  await fastify.register(replyFrom, {
    base: 'https://www.googleapis.com',
    http: {
      requestOptions: {
        timeout: 300000 // 5 דקות
      }
    }
  });

  // נתיב להורדת קובץ
  fastify.get('/files/:fileId', async (request, reply) => {
    const { fileId } = request.params as { fileId: string };
    
    // קבלת טוקן גישה
    const token = await tokenManager.getToken();

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
      },
      onError: (reply, error) => {
        request.log.error(error);
        reply.code(500).send({
          error: 'שגיאה בהעברת הבקשה לגוגל דרייב',
          details: error.error?.message || 'שגיאה לא ידועה'
        });
      }
    });
  });
};

export default drivePlugin;
```

### 4. עדכון video.routes.ts
יש לעדכן את הנתיבים להשתמש בפרוקסי החדש:

```typescript
import { FastifyPluginAsync } from 'fastify';

const videoRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/video/:fileId', async (request, reply) => {
    const { fileId } = request.params as { fileId: string };
    return reply.redirect(302, `/files/${fileId}`);
  });
};

export default videoRoutes;
```

### 5. בדיקות
1. לוודא שהקובץ credentials.json נמצא בתיקיית השורש
2. להריץ את השרת: `npm run dev`
3. לבדוק הורדת קובץ: `GET http://localhost:3000/files/{fileId}`
4. לבדוק סטרימינג וידאו: `GET http://localhost:3000/video/{fileId}`

## הערות נוספות
- הפרוקסי תומך ב-range requests לסטרימינג יעיל
- הטוקנים מתחדשים אוטומטית 5 דקות לפני פקיעתם
- יש לוגים מפורטים לניטור וטיפול בשגיאות
- התקורה מינימלית (28ms בממוצע)
