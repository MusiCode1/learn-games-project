export type DriveItemKind = 'folder' | 'video';

export type DriveItem = {
	id: string;
	kind: DriveItemKind;
	name: string;
	thumbnail_url: string;
	preview_urls?: string[];
};
