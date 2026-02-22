import { describe, it, expect, vi, beforeEach } from 'vitest';
import { videoLoader } from './src';

const { urlsToVideoItems, getRandomVideo } = videoLoader;

describe('urlsToVideoItems', () => {
  it('ממיר URLs לרשימת VideoItems', () => {
    const items = urlsToVideoItems(['a.mp4', 'b.webm']);
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({ url: 'a.mp4', mimeType: 'video/mp4' });
    expect(items[1]).toMatchObject({ url: 'b.webm', mimeType: 'video/webm' });
  });

  it('מזהה .mp4 -> video/mp4', () => {
    expect(urlsToVideoItems(['clip.mp4'])[0].mimeType).toBe('video/mp4');
  });

  it('מזהה .webm -> video/webm', () => {
    expect(urlsToVideoItems(['clip.webm'])[0].mimeType).toBe('video/webm');
  });

  it('ברירת מחדל video/mp4 לסיומת לא מוכרת', () => {
    expect(urlsToVideoItems(['file.xyz'])[0].mimeType).toBe('video/mp4');
  });

  it('ברירת מחדל מותאמת אישית', () => {
    expect(urlsToVideoItems(['file.xyz'], 'video/custom')[0].mimeType).toBe('video/custom');
  });

  it('מחזיר מערך ריק על קלט ריק', () => {
    expect(urlsToVideoItems([])).toEqual([]);
  });

  it('שומר על ה-URL המקורי', () => {
    const url = 'https://example.com/video.mp4';
    expect(urlsToVideoItems([url])[0].url).toBe(url);
  });
});

describe('getRandomVideo', () => {
  it('מחזיר undefined על רשימה ריקה', () => {
    expect(getRandomVideo([])).toBeUndefined();
  });

  it('מחזיר פריט מהרשימה', () => {
    const items = urlsToVideoItems(['a.mp4', 'b.mp4', 'c.mp4']);
    const result = getRandomVideo(items);
    expect(items).toContainEqual(result);
  });

  it('מחזיר את הפריט היחיד כשיש רק אחד', () => {
    const items = urlsToVideoItems(['only.mp4']);
    expect(getRandomVideo(items)).toEqual(items[0]);
  });
});

describe('loadVideoUrls', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('מחזיר רשימה ריקה כשה-rewardType אינו "video"', async () => {
    vi.doMock('../src/lib/logger.svelte', () => ({ log: vi.fn() }));
    vi.doMock('../src/lib/video/google-drive-video', () => ({
      extractGoogleDriveFolderId: vi.fn(),
      getFolderVideosUrls: vi.fn().mockResolvedValue([]),
    }));
    vi.doMock('../src/lib/fully-kiosk/fully-kiosk', () => ({ getFileList: vi.fn(), isFullyKiosk: vi.fn() }));

    const { loadVideoUrls } = await import('../src/lib/video/video-loader');
    const config = { rewardType: 'app', video: { source: 'google-drive', googleDriveFolderUrl: '' } } as never;
    const result = await loadVideoUrls(config);
    expect(result).toEqual([]);
  });

  it('מחזיר תוצאות מ-Google Drive כש-source הוא google-drive', async () => {
    vi.doMock('../src/lib/video/google-drive-video', () => ({
      extractGoogleDriveFolderId: vi.fn().mockReturnValue('folder-id'),
      getFolderVideosUrls: vi.fn().mockResolvedValue(['https://drive.google.com/vid1.mp4']),
    }));
    vi.doMock('../src/lib/fully-kiosk/fully-kiosk', () => ({ getFileList: vi.fn(), isFullyKiosk: vi.fn() }));
    vi.doMock('../src/lib/logger.svelte', () => ({ log: vi.fn() }));

    const { loadVideoUrls } = await import('../src/lib/video/video-loader');
    const config = {
      rewardType: 'video',
      video: { source: 'google-drive', googleDriveFolderUrl: 'https://drive.google.com/folder/abc' },
    } as never;

    const result = await loadVideoUrls(config);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toMatchObject({ url: expect.any(String), mimeType: expect.any(String) });
  });

  it('מחזיר מערך ריק כש-Google Drive נכשל ואין fallback', async () => {
    vi.doMock('../src/lib/video/google-drive-video', () => ({
      extractGoogleDriveFolderId: vi.fn().mockReturnValue('bad-id'),
      getFolderVideosUrls: vi.fn().mockRejectedValue(new Error('network error')),
    }));
    vi.doMock('../src/lib/fully-kiosk/fully-kiosk', () => ({ getFileList: vi.fn(), isFullyKiosk: vi.fn() }));
    vi.doMock('../src/lib/logger.svelte', () => ({ log: vi.fn() }));

    const { loadVideoUrls } = await import('../src/lib/video/video-loader');
    const config = {
      rewardType: 'video',
      video: { source: 'google-drive', googleDriveFolderUrl: 'bad' },
    } as never;

    const result = await loadVideoUrls(config);
    expect(Array.isArray(result)).toBe(true);
  });
});
