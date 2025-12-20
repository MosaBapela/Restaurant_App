import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const IMAGES_DIR = `${(FileSystem as any).documentDirectory}images/`;
const META_PREFIX = 'local_image:';

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(IMAGES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(IMAGES_DIR, { intermediates: true });
  }
}

function extFromUri(uri: string) {
  const m = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return m ? m[1] : 'jpg';
}

async function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  // btoa may not be typed in this environment; call via globalThis any-cast
  return (globalThis as any).btoa(binary);
}

/**
 * Save an image to local app storage and return a stable local URI.
 * - fileUri can be file://, content:// (Android), http(s) (we download it), or object URLs.
 * - key: a short id (e.g. foodId or userId) used as metadata key.
 */
export async function saveImage(fileUri: string, key: string): Promise<string> {
  await ensureDir();
  const ext = extFromUri(fileUri);
  const dest = `${IMAGES_DIR}${key}_${Date.now()}.${ext}`;
  // Web: persist as data URL (base64) in AsyncStorage because blob/object URLs
  // are not persistent across reloads and Expo FileSystem on web doesn't
  // provide a stable file:// path accessible after reload.
  if (Platform.OS === 'web') {
    // fetch the resource (handles blob: object URLs and http(s) URLs)
    const resp = await fetch(fileUri);
    const buffer = await resp.arrayBuffer();
    const base64 = await arrayBufferToBase64(buffer);
    const mime = `image/${ext}`;
    const dataUrl = `data:${mime};base64,${base64}`;
    await AsyncStorage.setItem(META_PREFIX + key, dataUrl);
    return dataUrl;
  }

  if (fileUri.startsWith('http://') || fileUri.startsWith('https://')) {
    await FileSystem.downloadAsync(fileUri, dest);
  } else if (fileUri.startsWith('file://')) {
    await FileSystem.copyAsync({ from: fileUri, to: dest });
  } else {
    // attempt fetch + write as base64 (handles blob: and object URLs)
    const resp = await fetch(fileUri);
    const buffer = await resp.arrayBuffer();
    const base64 = await arrayBufferToBase64(buffer);
    await FileSystem.writeAsStringAsync(dest, base64, { encoding: 'base64' });
  }

  await AsyncStorage.setItem(META_PREFIX + key, dest);
  return dest;
}

export async function getImageUri(key: string): Promise<string | null> {
  const uri = await AsyncStorage.getItem(META_PREFIX + key);
  return uri;
}

export async function deleteImage(key: string): Promise<void> {
  const uri = await getImageUri(key);
  if (uri) {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (e) {
      // ignore
    }
    await AsyncStorage.removeItem(META_PREFIX + key);
  }
}

export default {
  saveImage,
  getImageUri,
  deleteImage,
};
