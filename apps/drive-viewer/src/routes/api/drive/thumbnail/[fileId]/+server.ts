import type { RequestHandler } from './$types';
import { getAccessToken } from '$lib/server/drive';

const passthroughHeaders = ['content-type', 'content-length', 'etag', 'last-modified', 'cache-control'];

function clampSize(value: string | null): number {
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return 640;
	return Math.min(2000, Math.max(64, Math.round(parsed)));
}

export const GET: RequestHandler = async ({ params, url, fetch }) => {
	const token = await getAccessToken();
	const size = clampSize(url.searchParams.get('size'));

	const metaUrl = new URL(`https://www.googleapis.com/drive/v3/files/${params.fileId}`);
	metaUrl.searchParams.set('fields', 'thumbnailLink');
	metaUrl.searchParams.set('supportsAllDrives', 'true');

	const metaResponse = await fetch(metaUrl.toString(), {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!metaResponse.ok) {
		return new Response('שגיאה בקבלת תמונה', { status: metaResponse.status });
	}

	const meta = (await metaResponse.json()) as { thumbnailLink?: string };
	if (!meta.thumbnailLink) {
		return new Response('אין תמונה זמינה', { status: 404 });
	}

	const thumbUrl = meta.thumbnailLink.replace(/=s\d+(?:-c)?/, `=s${size}`);
	const thumbResponse = await fetch(thumbUrl, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!thumbResponse.ok) {
		return new Response('שגיאה בקבלת תמונה', { status: thumbResponse.status });
	}

	const headers = new Headers();
	for (const key of passthroughHeaders) {
		const value = thumbResponse.headers.get(key);
		if (value) headers.set(key, value);
	}
	if (!headers.has('cache-control')) {
		headers.set('cache-control', 'public, max-age=600');
	}

	return new Response(thumbResponse.body, {
		status: thumbResponse.status,
		headers
	});
};
