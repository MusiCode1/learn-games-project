import type { PageLoad } from './$types';
import type { DriveItem } from '$lib/drive/types';

export const load: PageLoad = async ({ fetch, url }) => {
	const path = url.searchParams.get('path') ?? '';
	const segments = path.split(',').filter(Boolean);
	const folderId = segments.at(-1) ?? 'root';
	const single = url.searchParams.get('single') === '1';

	let items: DriveItem[] = [];
	let errorMessage = '';

	try {
		const response = await fetch(`/api/drive/list?folderId=${encodeURIComponent(folderId)}`);
		if (!response.ok) {
			throw new Error('bad-response');
		}
		const data = (await response.json()) as { items?: DriveItem[] };
		items = data.items ?? [];
	} catch (error) {
		errorMessage = 'לא הצלחנו לטעון את התיקייה.';
	}

	return {
		items,
		folderId,
		path,
		single,
		errorMessage
	};
};
