import type { PhotoIssueInspectionBlock } from '../types';

export const PHOTO_STATUS_GOOD = 'Good';
export const PHOTO_STATUS_ATTENTION = 'Attention needed';

export function isPhotoIssueBlockComplete(
  block: PhotoIssueInspectionBlock | undefined,
  options: { requirePhoto: boolean; photoOnlyOk?: boolean },
): boolean {
  const hasPhoto = Boolean(block?.photos?.[0]);
  if (options.requirePhoto && !hasPhoto) {
    return false;
  }
  if (options.photoOnlyOk && hasPhoto) {
    return block?.status === PHOTO_STATUS_GOOD || (block?.issues?.length ?? 0) > 0;
  }
  if (block?.status === PHOTO_STATUS_GOOD) {
    return true;
  }
  if (block?.status === PHOTO_STATUS_ATTENTION && (block.issues?.length ?? 0) > 0) {
    return true;
  }
  return false;
}
