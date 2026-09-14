/**
 * Image compression for inspection photos.
 *
 * Resizes the longest side to PHOTO_CONFIG.maxDimension and re-encodes JPEG at
 * PHOTO_CONFIG.compressionQuality — typically a 5-10x storage reduction while
 * keeping damage/detail legible. Runs on-device before upload so we never send
 * multi-MB originals to Storage.
 *
 * Note: re-encoding strips EXIF (including GPS). The photo's immutable DB
 * `created_at` remains the chain-of-custody timestamp.
 */
import { Image } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { PHOTO_CONFIG } from '@propertycheck/shared';

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

/**
 * Returns a URI to a compressed JPEG copy. On any failure, returns the original
 * URI so a photo is never lost to a compression error.
 */
export async function compressImage(uri: string): Promise<string> {
  const { maxDimension, compressionQuality } = PHOTO_CONFIG;
  try {
    let resize: ImageManipulator.Action[] = [];
    try {
      const { width, height } = await getImageSize(uri);
      const longest = Math.max(width, height);
      if (longest > maxDimension) {
        resize = [{ resize: width >= height ? { width: maxDimension } : { height: maxDimension } }];
      }
    } catch {
      // Couldn't read dimensions — fall back to constraining width.
      resize = [{ resize: { width: maxDimension } }];
    }

    const result = await ImageManipulator.manipulateAsync(uri, resize, {
      compress: compressionQuality,
      format: ImageManipulator.SaveFormat.JPEG,
    });
    return result.uri;
  } catch (err) {
    console.warn('[image] compression failed, uploading original', err);
    return uri;
  }
}
