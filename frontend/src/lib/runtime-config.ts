const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!rawApiBaseUrl) {
  throw new Error('NEXT_PUBLIC_API_URL is required. No fallback is allowed.');
}

let parsedApiBaseUrl: URL;

try {
  parsedApiBaseUrl = new URL(rawApiBaseUrl);
} catch {
  throw new Error('NEXT_PUBLIC_API_URL must be a valid absolute URL.');
}

export const apiBaseUrl = parsedApiBaseUrl.toString().replace(/\/$/, '');
export const backendOrigin = parsedApiBaseUrl.origin;
export const browserApiBaseUrl = '/api/proxy';
