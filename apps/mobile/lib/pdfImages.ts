/**
 * Inline inspection photos into PDF HTML as base64 data URIs.
 *
 * The report used to embed photos by remote URL (`<img src="https://…supabase…">`),
 * so expo-print's WebKit engine fetched every full-res image over the network at
 * render time — slow, timeout-prone, and broken entirely when offline. For a
 * legal-evidence document that must render reliably, we instead download each
 * photo once, downscale it for print, and base64-inline it. The PDF then contains
 * its own images and renders with zero network access.
 */
import * as FileSystem from 'expo-file-system/legacy';
import * as ImageManipulator from 'expo-image-manipulator';
import { getPhotoUrl } from './storage';
import { mapLimit } from './concurrency';

// Print resolution: photos sit 2–3 across a Letter page, so ~1000px wide is
// crisp at print DPI while keeping the base64 payload (and the PDF) small.
const PDF_IMAGE_WIDTH = 1000;
const PDF_IMAGE_QUALITY = 0.6;
const CONCURRENCY = 4;

// Shown in place of a photo that couldn't be downloaded (e.g. deleted in Storage).
// Inline SVG so it too needs no network.
export const PDF_IMAGE_FALLBACK =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150">' +
      '<rect width="100%" height="100%" fill="#e2e8f0"/>' +
      '<text x="50%" y="50%" fill="#64748b" font-family="sans-serif" font-size="11" ' +
      'text-anchor="middle" dominant-baseline="middle">Image unavailable</text></svg>'
  );

/**
 * Map each storage_path to a base64 JPEG data URI, ready to drop into an <img src>.
 * Missing/failed images are simply absent from the map — callers fall back to
 * PDF_IMAGE_FALLBACK so one bad photo never blocks the whole report.
 */
export async function buildPhotoDataUris(
  storagePaths: readonly string[]
): Promise<Map<string, string>> {
  const unique = Array.from(new Set(storagePaths.filter(Boolean)));
  const map = new Map<string, string>();

  await mapLimit(unique, CONCURRENCY, async (path) => {
    try {
      const url = getPhotoUrl(path);
      if (!url) return;

      const target = `${FileSystem.cacheDirectory}pdfsrc-${path.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const { uri } = await FileSystem.downloadAsync(url, target);

      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: PDF_IMAGE_WIDTH } }],
        { compress: PDF_IMAGE_QUALITY, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      if (result.base64) {
        map.set(path, `data:image/jpeg;base64,${result.base64}`);
      }
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (e) {
      console.warn('[pdf] failed to inline image', path, e);
    }
  });

  return map;
}
