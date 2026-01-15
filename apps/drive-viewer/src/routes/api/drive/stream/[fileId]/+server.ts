import type { RequestHandler } from './$types';
import { getAccessToken } from '$lib/server/drive';

const passthroughHeaders = [
	'content-type',
	'content-length',
	'content-range',
	'accept-ranges',
	'etag',
	'last-modified'
];

export const GET: RequestHandler = async ({ params, request, fetch }) => {
	const { fileId } = params;
	const token = await getAccessToken();

	const upstreamUrl = new URL(`https://www.googleapis.com/drive/v3/files/${fileId}`);
	upstreamUrl.searchParams.set('alt', 'media');
	upstreamUrl.searchParams.set('supportsAllDrives', 'true');

	const range = request.headers.get('range');
	const response = await fetch(upstreamUrl.toString(), {
		headers: {
			Authorization: `Bearer ${token}`,
			...(range ? { Range: range } : {})
		}
	});

	const headers = new Headers();
	for (const key of passthroughHeaders) {
		const value = response.headers.get(key);
		if (value) headers.set(key, value);
	}

	return new Response(response.body, {
		status: response.status,
		headers
	});
};
