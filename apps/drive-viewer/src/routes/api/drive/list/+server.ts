import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { DriveItem, DriveItemKind } from '$lib/drive/types';
import { getAccessToken, getDefaultFolderId } from '$lib/server/drive';

type DriveApiFile = {
	id: string;
	name: string;
	mimeType: string;
	thumbnailLink?: string;
};

type DriveApiPreview = {
	id: string;
	thumbnailLink?: string;
	mimeType?: string;
};

function makeThumbnail(label: string, kind: DriveItemKind) {
	const shortLabel = label.length > 10 ? `${label.slice(0, 10)}...` : label;
	const palette =
		kind === 'folder'
			? { bg: '#d8e4ee', accent: '#385a6f', soft: '#f5f9fc' }
			: { bg: '#f7d6b3', accent: '#d2693c', soft: '#fff1e0' };

	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.soft}"/>
      <stop offset="100%" stop-color="${palette.bg}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="600" rx="40" fill="url(#g)"/>
  <rect x="46" y="48" width="708" height="504" rx="32" fill="none" stroke="${palette.accent}" stroke-width="6" opacity="0.5"/>
  <text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" font-family="Rubik, Assistant, sans-serif" font-size="72" fill="${palette.accent}">${shortLabel}</text>
  <text x="50%" y="76%" text-anchor="middle" dominant-baseline="middle" font-family="Rubik, Assistant, sans-serif" font-size="32" fill="#4b3527">${kind === 'folder' ? 'תיקייה' : 'סרטון'}</text>
</svg>`;

	return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

async function fetchFolderPreview(folderId: string, token: string, fetcher: typeof fetch): Promise<string[]> {
	const query = [
		`'${folderId}' in parents`,
		'trashed = false',
		"(mimeType contains 'video/' or mimeType contains 'image/')"
	].join(' and ');

	const driveUrl = new URL('https://www.googleapis.com/drive/v3/files');
	driveUrl.searchParams.set('q', query);
	driveUrl.searchParams.set('fields', 'files(id,thumbnailLink,mimeType)');
	driveUrl.searchParams.set('pageSize', '4');
	driveUrl.searchParams.set('orderBy', 'modifiedTime desc');
	driveUrl.searchParams.set('supportsAllDrives', 'true');
	driveUrl.searchParams.set('includeItemsFromAllDrives', 'true');

	const response = await fetcher(driveUrl.toString(), {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!response.ok) return [];
	const payload = (await response.json()) as { files?: DriveApiPreview[] };
	return (payload.files ?? [])
		.filter((file) => Boolean(file.thumbnailLink))
		.map((file) => `/api/drive/thumbnail/${file.id}?size=320`);
}

function pickThumbnail(item: DriveApiFile, kind: DriveItemKind) {
	if (kind === 'folder' || !item.thumbnailLink) return makeThumbnail(item.name, kind);
	return `/api/drive/thumbnail/${item.id}?size=640`;
}

async function toDriveItem(
	item: DriveApiFile,
	token: string,
	fetcher: typeof fetch
): Promise<DriveItem | null> {
	const isFolder = item.mimeType === 'application/vnd.google-apps.folder';
	const isVideo = item.mimeType.startsWith('video/');
	if (!isFolder && !isVideo) return null;

	const kind: DriveItemKind = isFolder ? 'folder' : 'video';
	const thumbnail_url = pickThumbnail(item, kind);
	if (!isFolder) {
		return {
			id: item.id,
			kind,
			name: item.name,
			thumbnail_url
		};
	}

	const preview_urls = await fetchFolderPreview(item.id, token, fetcher);
	return {
		id: item.id,
		kind,
		name: item.name,
		thumbnail_url,
		preview_urls
	};
}

export const GET: RequestHandler = async ({ url, fetch }) => {
	const folderParam = url.searchParams.get('folderId');
	const folderId = folderParam === 'root' || !folderParam ? getDefaultFolderId() : folderParam;

	if (!folderId) {
		return json({ error: 'חסר מזהה תיקייה' }, { status: 400 });
	}

	const token = await getAccessToken();
	const query = [
		`'${folderId}' in parents`,
		'trashed = false',
		"(mimeType contains 'video/' or mimeType = 'application/vnd.google-apps.folder')"
	].join(' and ');

	const driveUrl = new URL('https://www.googleapis.com/drive/v3/files');
	driveUrl.searchParams.set('q', query);
	driveUrl.searchParams.set('fields', 'files(id,name,mimeType,thumbnailLink)');
	driveUrl.searchParams.set('pageSize', '200');
	driveUrl.searchParams.set('supportsAllDrives', 'true');
	driveUrl.searchParams.set('includeItemsFromAllDrives', 'true');

	const response = await fetch(driveUrl.toString(), {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!response.ok) {
		return json({ error: 'שגיאה בקבלת רשימת קבצים' }, { status: response.status });
	}

	const payload = (await response.json()) as { files?: DriveApiFile[] };
	const items = (await Promise.all(
		(payload.files ?? []).map((item) => toDriveItem(item, token, fetch))
	)).filter((item): item is DriveItem => Boolean(item));

	return json({ items });
};
