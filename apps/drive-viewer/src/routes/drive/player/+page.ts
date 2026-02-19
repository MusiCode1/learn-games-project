import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	return {
		fileId: url.searchParams.get('fileId') ?? '',
		name: url.searchParams.get('name') ?? 'סרטון',
		path: url.searchParams.get('path') ?? '',
		thumb: url.searchParams.get('thumb') ?? '',
		single: url.searchParams.get('single') === '1'
	};
};
