import { GoogleAuth } from 'google-auth-library';
import { DRIVE_VIEWER_SERVICE_ACCOUNT_JSON, LEISURE_TIME_VIDEOS } from '$env/static/private';

type ServiceAccountCredentials = {
	client_email: string;
	private_key: string;
};

let auth: GoogleAuth | null = null;
let cachedToken: { token: string; expiresAt: number } | null = null;
let cachedCredentials: ServiceAccountCredentials | null = null;

function readEnv(name: 'DRIVE_VIEWER_SERVICE_ACCOUNT_JSON' | 'LEISURE_TIME_VIDEOS'): string {
	const value =
		name === 'DRIVE_VIEWER_SERVICE_ACCOUNT_JSON'
			? DRIVE_VIEWER_SERVICE_ACCOUNT_JSON
			: LEISURE_TIME_VIDEOS;
	if (!value) {
		throw new Error(`חסר משתנה סביבה: ${name}`);
	}
	return value;
}

function normalizeJsonString(raw: string): string {
	const trimmed = raw.trim();
	if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

function parseServiceAccount(): ServiceAccountCredentials {
	if (cachedCredentials) return cachedCredentials;

	const raw = readEnv('DRIVE_VIEWER_SERVICE_ACCOUNT_JSON');
	const normalized = normalizeJsonString(raw);

	let parsed: any;
	try {
		parsed = JSON.parse(normalized);
	} catch {
		console.log(normalized);
		
		parsed = JSON.parse(JSON.parse(raw));
	}

	if (!parsed?.client_email || !parsed?.private_key) {
		throw new Error('תוכן חשבון השירות אינו תקין');
	}

	const privateKey = String(parsed.private_key).replace(/\\n/g, '\n');
	cachedCredentials = {
		client_email: parsed.client_email,
		private_key: privateKey
	};
	return cachedCredentials;
}

async function getAuth(): Promise<GoogleAuth> {
	if (auth) return auth;
	const credentials = parseServiceAccount();
	auth = new GoogleAuth({
		credentials,
		scopes: ['https://www.googleapis.com/auth/drive.readonly']
	});
	return auth;
}

export async function getAccessToken(): Promise<string> {
	if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
		return cachedToken.token;
	}

	const authClient = await getAuth();
	const client = await authClient.getClient();
	const result = await client.getAccessToken();
	const token = typeof result === 'string' ? result : result?.token;

	if (!token) {
		throw new Error('לא הצלחנו לקבל טוקן מגוגל');
	}

	const expiry = client.credentials.expiry_date ?? Date.now() + 60 * 60 * 1000;
	cachedToken = { token, expiresAt: expiry };
	return token;
}

export function extractFolderId(input: string): string {
	if (!input) return '';

	try {
		const url = new URL(input);
		if (url.hostname.includes('drive.google.com')) {
			const folderMatch = url.pathname.match(/folders\/([a-zA-Z0-9-_]+)/);
			if (folderMatch?.[1]) return folderMatch[1];
			const id = url.searchParams.get('id');
			if (id) return id;
		}
	} catch {
		// allow fallthrough for raw IDs
	}

	return input;
}

export function getDefaultFolderId(): string {
	const raw = readEnv('LEISURE_TIME_VIDEOS');
	return extractFolderId(raw);
}
