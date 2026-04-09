import { getApiOrigin } from '@/lib/constants/network';

function normalizeStorageRelativePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\/+/, '');
}

/**
 * Relative path inside Laravel `public/storage` (e.g. photos/1/3/abc.jpg).
 */
function storagePathFromPhoto(photo: { url?: string | null; path?: string | null }): string | undefined {
  if (photo.path != null && String(photo.path).trim() !== '') {
    return normalizeStorageRelativePath(String(photo.path));
  }
  if (!photo.url) return undefined;
  try {
    const u = new URL(photo.url);
    const mark = '/storage/';
    const i = u.pathname.indexOf(mark);
    if (i !== -1) {
      return normalizeStorageRelativePath(u.pathname.slice(i + mark.length));
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

/**
 * Laravel returns `url` from `Storage::disk(...)->url()` using APP_URL (often http:// on the server).
 * iOS ATS blocks cleartext HTTP, so images appear grey even though files exist.
 * For the `public` disk we always build the client-visible URL from `getApiOrigin()` + `/storage/` + `path`.
 */
export function resolvePhotoDisplayUrl(photo: {
  url?: string | null;
  path?: string | null;
  disk?: string | null;
}): string | undefined {
  const origin = getApiOrigin().replace(/\/$/, '');
  const disk = photo.disk ?? 'public';

  if (disk === 'public') {
    const rel = storagePathFromPhoto(photo);
    if (rel) {
      return `${origin}/storage/${rel}`;
    }
  }

  if (photo.url) {
    try {
      const u = new URL(photo.url);
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        const o = new URL(origin);
        u.protocol = o.protocol;
        u.hostname = o.hostname;
        u.port = o.port;
        return u.toString();
      }
      // Same host as API but server emitted http — upgrade for iOS ATS when app uses https
      if (origin.startsWith('https:') && u.protocol === 'http:') {
        const o = new URL(origin);
        if (u.hostname === o.hostname && (u.port || '') === (o.port || '')) {
          u.protocol = 'https:';
          return u.toString();
        }
      }
      return photo.url;
    } catch {
      return photo.url;
    }
  }

  return undefined;
}
