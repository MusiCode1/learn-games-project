import { GoogleAuth } from 'google-auth-library';
import { request } from 'gaxios';

async function measureTime(fn: () => Promise<void>, iterations: number): Promise<number[]> {
  const times: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const start = process.hrtime.bigint();
    await fn();
    const end = process.hrtime.bigint();
    times.push(Number(end - start) / 1_000_000); // המרה למילישניות
  }
  return times;
}

function calculateStats(times: number[]) {
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  return { avg, min, max };
}

async function main() {
  // יצירת אובייקט אימות של גוגל
  const authClient = new GoogleAuth({
    keyFile: './credentials.json',
    scopes: ['https://www.googleapis.com/auth/drive.readonly']
  });

  // קבלת טוקן גישה
  const token = await authClient.getAccessToken();
  const fileId = '1njinl69RU5Bt_V4_yT6Fx3VaVu45yN7R';
  const iterations = 10;

  // פונקציה לבקשה ישירה
  const directRequest = async () => {
    await request({
      url: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Range': 'bytes=0-1000'
      },
      responseType: 'arraybuffer'
    });
  };

  // פונקציה לבקשה דרך הפרוקסי
  const proxyRequest = async () => {
    await request({
      url: `http://localhost:5000/test/${fileId}`,
      headers: {
        'Range': 'bytes=0-1000'
      },
      responseType: 'arraybuffer'
    });
  };

  console.log(`\n=== מדידת זמנים (${iterations} בקשות) ===`);

  console.log('\nבקשות ישירות לגוגל דרייב:');
  const directTimes = await measureTime(directRequest, iterations);
  const directStats = calculateStats(directTimes);
  console.log('זמנים:', directTimes.map(t => t.toFixed(2) + 'ms'));
  console.log('ממוצע:', directStats.avg.toFixed(2) + 'ms');
  console.log('מינימום:', directStats.min.toFixed(2) + 'ms');
  console.log('מקסימום:', directStats.max.toFixed(2) + 'ms');

  console.log('\nבקשות דרך שרת ה-POC:');
  const proxyTimes = await measureTime(proxyRequest, iterations);
  const proxyStats = calculateStats(proxyTimes);
  console.log('זמנים:', proxyTimes.map(t => t.toFixed(2) + 'ms'));
  console.log('ממוצע:', proxyStats.avg.toFixed(2) + 'ms');
  console.log('מינימום:', proxyStats.min.toFixed(2) + 'ms');
  console.log('מקסימום:', proxyStats.max.toFixed(2) + 'ms');

  console.log('\n=== השוואה ===');
  const overhead = proxyStats.avg - directStats.avg;
  console.log('תקורה ממוצעת:', overhead.toFixed(2) + 'ms');
  console.log('אחוז תקורה:', ((overhead / directStats.avg) * 100).toFixed(1) + '%');
}

main().catch(console.error);
