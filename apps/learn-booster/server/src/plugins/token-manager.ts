import { GoogleAuth } from 'google-auth-library';

import { FastifyInstance } from 'fastify';

export class TokenManager {
  private readonly authClient: GoogleAuth;
  private readonly cacheKey = 'google_drive_token';

  constructor(
    keyFile: string,
    private readonly fastify: FastifyInstance
  ) {
    this.authClient = new GoogleAuth({
      keyFile,
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    });
  }

  private async isTokenValid(): Promise<boolean> {
    const cached = await this.fastify.cache.get(this.cacheKey);
    if (!cached) {
      return false;
    }

    const { token, expiresAt } = cached;
    // נחדש 5 דקות לפני שפג
    const now = new Date();
    return new Date(expiresAt).getTime() - now.getTime() > 5 * 60 * 1000;
  }

  async getToken(): Promise<string> {
    if (await this.isTokenValid()) {
      const cached = await this.fastify.cache.get(this.cacheKey);
      return cached.token;
    }

    const client = await this.authClient.getClient();
    const response = await this.authClient.getAccessToken();
    
    // חישוב זמן התפוגה לפי הזמן הנוכחי + שעה
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = new Date((now + 3600) * 1000);

    if (!response) {
      throw new Error('שגיאה בקבלת טוקן גישה');
    }

    // שמירה במטמון
    await this.fastify.cache.set(this.cacheKey, {
      token: response,
      expiresAt: expiresAt
    });

    return response;
  }
}
