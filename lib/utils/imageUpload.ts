/**
 * Build multipart part for RN FormData from a picked/captured image asset.
 */
export function buildPhotoFormDataPart(uri: string, mimeType?: string | null) {
  const type =
    mimeType && typeof mimeType === 'string' && mimeType.length > 0 ? mimeType : 'image/jpeg';

  let ext = 'jpg';
  if (type.includes('png')) ext = 'png';
  else if (type.includes('webp')) ext = 'webp';
  else if (type.includes('gif')) ext = 'gif';

  const fromUri = uri.split('/').pop() ?? '';
  const filename = fromUri.includes('.') ? fromUri : `photo.${ext}`;

  return {
    uri,
    name: filename,
    type,
  } as { uri: string; name: string; type: string };
}
