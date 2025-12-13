# הנחיות פיתוח

## סביבת פיתוח

### דרישות מערכת
- Node.js v18 ומעלה
- TypeScript 5.3 ומעלה
- VSCode (מומלץ)

### הרחבות מומלצות ל-VSCode
- ESLint
- Prettier
- TypeScript IDE Support
- Error Lens

## ארגון הקוד

### מבנה תיקיות
```
src/
├── plugins/        # פלאגינים של Fastify
├── routes/         # הגדרות נתיבים
├── config/         # קבצי קונפיגורציה
├── types/          # הגדרות טיפוסים
└── app.ts          # הקובץ הראשי
```

### קונבנציות קוד

#### שמות קבצים
- קבצי מודולים: `camelCase.ts`
- קבצי טיפוסים: `camelCase.types.ts`
- קבצי פלאגינים: `camelCase.plugin.ts`
- קבצי נתיבים: `camelCase.routes.ts`

#### סגנון קוד
```typescript
// אובייקטי קונפיגורציה
interface Config {
  // קבועים באותיות גדולות
  readonly MAX_CACHE_SIZE: number;
  // משתנים בcamelCase
  readonly serverPort: number;
}

// פונקציות
async function handleVideoStream(
  fileId: string,
  options: StreamOptions
): Promise<void> {
  // ...
}

// קבועים
const DEFAULT_QUALITY = 'high';

// טיפוסים
type VideoQuality = 'high' | 'medium' | 'low';
```

## פלאגינים

### יצירת פלאגין חדש

```typescript
import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';

interface PluginOptions {
  // אפשרויות הפלאגין
}

const plugin: FastifyPluginAsync<PluginOptions> = async (
  fastify,
  opts
) => {
  // מימוש הפלאגין
};

export default fp(plugin, {
  name: 'plugin-name',
  fastify: '4.x',
});
```

### דוגמה לפלאגין קאש

```typescript
import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';

interface CacheOptions {
  ttl: number;
  maxSize: number;
}

const cachePlugin: FastifyPluginAsync<CacheOptions> = async (
  fastify,
  opts
) => {
  // הגדרת דקורטורים
  fastify.decorate('cache', {
    // מימוש פונקציות הקאש
  });
};

export default fp(cachePlugin, {
  name: 'cache',
  fastify: '4.x',
});
```

## נתיבים

### הוספת נתיב חדש

```typescript
import { FastifyPluginAsync } from 'fastify';

const routes: FastifyPluginAsync = async (fastify) => {
  // הגדרת סכמה
  const schema = {
    params: {
      type: 'object',
      properties: {
        fileId: { type: 'string' }
      }
    },
    querystring: {
      type: 'object',
      properties: {
        quality: { type: 'string', enum: ['high', 'medium', 'low'] }
      }
    }
  };

  // רישום הנתיב
  fastify.get('/video/:fileId', { schema }, async (request, reply) => {
    // מימוש הלוגיקה
  });
};

export default routes;
```

## טיפול בשגיאות

### סוגי שגיאות
```typescript
// שגיאה מותאמת אישית
class VideoError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
  }
}

// שימוש בשגיאה
throw new VideoError('הקובץ לא נמצא', 404);
```

### טיפול גלובלי בשגיאות
```typescript
fastify.setErrorHandler((error, request, reply) => {
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
      message: 'שגיאת שרת פנימית'
    }
  });
});
```

## בדיקות

### בדיקות יחידה
```typescript
import { test } from 'tap';
import Fastify from 'fastify';
import videoRoutes from '../routes/video.routes';

test('GET /video/:fileId', async (t) => {
  const fastify = Fastify();
  await fastify.register(videoRoutes);

  const response = await fastify.inject({
    method: 'GET',
    url: '/video/123?quality=high'
  });

  t.equal(response.statusCode, 200);
});
```

### בדיקות אינטגרציה
```typescript
import { test } from 'tap';
import { build } from './helper';

test('מטמון עובד כמצופה', async (t) => {
  const app = await build(t);

  // בקשה ראשונה - פונה לגוגל דרייב
  const response1 = await app.inject({
    method: 'GET',
    url: '/video/123'
  });
  t.equal(response1.statusCode, 200);

  // בקשה שנייה - אמורה לבוא מהמטמון
  const response2 = await app.inject({
    method: 'GET',
    url: '/video/123'
  });
  t.equal(response2.statusCode, 200);
});
```

## ביצועים

### מדדי ביצועים מרכזיים
- זמן תגובה ראשוני
- שימוש בזיכרון
- ניצולת מטמון
- זמן טעינת סרטון

### ניטור
```typescript
// דוגמה למדידת זמן תגובה
fastify.addHook('onRequest', async (request) => {
  request.startTime = process.hrtime();
});

fastify.addHook('onResponse', async (request, reply) => {
  const hrtime = process.hrtime(request.startTime);
  const responseTime = hrtime[0] * 1000 + hrtime[1] / 1000000;
  
  fastify.log.info({
    responseTime,
    statusCode: reply.statusCode,
    url: request.url
  });
});
```

## תחזוקה

### רוטציית לוגים
```typescript
import path from 'path';
import { pino } from 'pino';

const transport = pino.transport({
  target: 'pino/file',
  options: {
    destination: path.join(__dirname, '../logs/app.log'),
    mkdir: true,
    sync: false
  }
});

const logger = pino(transport);
```

### ניקוי מטמון אוטומטי
```typescript
// הגדרת ניקוי תקופתי
setInterval(() => {
  fastify.cache.clear();
}, 3600000); // כל שעה
```

## אבטחה

### הגנה מפני התקפות
- הגבלת קצב בקשות
- סינון CORS
- וולידציה של קלט
- הגנה מפני XSS

### דוגמה להגדרת CORS
```typescript
await fastify.register(import('@fastify/cors'), {
  origin: ['http://localhost:3000'],
  methods: ['GET'],
  allowedHeaders: ['Content-Type']
});
```

## תהליך הפיתוח

1. **תכנון**
   - הגדרת דרישות
   - תכנון ארכיטקטורה
   - בחירת טכנולוגיות

2. **פיתוח**
   - כתיבת קוד נקי
   - תיעוד בקוד
   - בדיקות יחידה

3. **בדיקות**
   - בדיקות אינטגרציה
   - בדיקות עומסים
   - בדיקות אבטחה

4. **הטמעה**
   - בדיקת ביצועים
   - ניטור
   - תחזוקה שוטפת
