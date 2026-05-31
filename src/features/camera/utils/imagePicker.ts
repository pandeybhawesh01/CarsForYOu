/**
 * imagePicker — defensive wrapper around react-native-image-picker.
 *
 * WHY THIS EXISTS:
 * Same philosophy as visionCamera.ts — we never want a missing/mislinked
 * native module to hard-crash the camera flow. The picker is resolved at
 * runtime; if it can't load, `pickFromGallery` resolves to `null` and the
 * caller simply behaves as if the user cancelled.
 */

import type { CameraMode } from '../types';

let imagePicker: any = null;

const loadImagePicker = () => {
  try {
    // Defer native module resolution until runtime.
    return require('react-native-image-picker');
  } catch (error) {
    console.warn(
      '[Camera] Failed to load react-native-image-picker:',
      (error as Error).message,
    );
    return null;
  }
};

imagePicker = loadImagePicker();

export interface PickedMedia {
  uri: string;
}

/**
 * Opens the system gallery and lets the user pick a single image or video,
 * matching the current camera `mode`.
 *
 * @returns the picked media URI, or `null` if the user cancelled, the picker
 *          is unavailable, or an error occurred.
 */
export async function pickFromGallery(mode: CameraMode): Promise<PickedMedia | null> {
  if (!imagePicker?.launchImageLibrary) {
    console.warn('[Camera] launchImageLibrary not available');
    return null;
  }

  try {
    const response = await imagePicker.launchImageLibrary({
      mediaType: mode === 'video' ? 'video' : 'photo',
      selectionLimit: 1,
      // We want the actual file URI so it flows through the existing
      // upload pipeline; base64 would bloat memory for videos.
      includeBase64: false,
    });

    if (response?.didCancel) {
      return null;
    }

    if (response?.errorCode) {
      console.warn(
        '[Camera] Gallery picker error:',
        response.errorCode,
        response.errorMessage,
      );
      return null;
    }

    const asset = response?.assets?.[0];
    if (!asset?.uri) {
      return null;
    }

    return { uri: asset.uri };
  } catch (error) {
    console.error('[Camera] pickFromGallery failed:', error);
    return null;
  }
}
