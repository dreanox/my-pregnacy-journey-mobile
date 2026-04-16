import { getApiOrigin } from '@/lib/constants/network';

function normalizeStorageRelativePath(p: string): string {
  return p.replace(/\\/g, '/').replace(/^\/+/, '');
}

/** Encode each path segment for URLs (spaces, unicode file names) without double-encoding slashes. */
function encodeStoragePathForUrl(rel: string): string {
  const norm = normalizeStorageRelativePath(rel);
  if (!norm) return '';
  return norm
    .split('/')
    .map((seg) => {
      try {
        return encodeURIComponent(decodeURIComponent(seg));
      } catch {
        return encodeURIComponent(seg);
      }
    })
    .join('/');
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
 * Laravel returns `url` from `Storage::disk(...)->url()` using APP_URL.
 * For the `public` disk we build the client URL from `getApiOrigin()` + encoded `/storage/` + `path`
 * so iOS always hits the same HTTPS host as the API and special characters in filenames work.
 */
export function resolvePhotoDisplayUrl(photo: {
  url?: string | null;
  path?: string | null;
  disk?: string | null;
}): string | undefined {
  const origin = getApiOrigin().replace(/\/$/, '');
  const diskNorm = String(photo.disk ?? 'public')
    .trim()
    .toLowerCase();

  if (diskNorm === 'public') {
    const rel = storagePathFromPhoto(photo);
    if (rel) {
      const encoded = encodeStoragePathForUrl(rel);
      if (encoded) {
        return `${origin}/storage/${encoded}`;
      }
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
