import { getApiOrigin } from '@/lib/constants/network';

/**
 * Laravel often returns photo `url` with APP_URL (e.g. http://localhost:8000/storage/...).
 * The app calls the API via LAN IP, so the device cannot reach localhost — rewrite to match API origin.
 */
export function resolvePhotoDisplayUrl(photo: {
  url?: string | null;
  path?: string | null;
}): string | undefined {
  const origin = getApiOrigin();

  const rewriteLocalhost = (urlStr: string): string => {
    try {
      const u = new URL(urlStr);
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        const o = new URL(origin);
        u.protocol = o.protocol;
        u.hostname = o.hostname;
        u.port = o.port;
        return u.toString();
      }
      return urlStr;
    } catch {
      return urlStr;
    }
  };

  if (photo.url) {
    return rewriteLocalhost(photo.url);
  }

  if (photo.path) {
    const p = photo.path.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${origin}/storage/${p}`;
  }

  return undefined;
}
