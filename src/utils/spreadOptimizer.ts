import { PhotoItem, SpreadItem, SlotLayout, TemplateDef } from '../types';
import { findBestTemplateForPhotos, calculateSlotAspectRatio, getTemplateById } from '../constants/templates';

/**
 * Distributes all uploaded photos across spreads ensuring that:
 * 1. EVERY spread has at least 1 photo.
 * 2. EVERY slot in every template has an assigned photo (0 empty slots).
 * 3. The number of spreads matches the photos sent (no empty/blank spreads at the end).
 */
export function distributePhotosToSpreads(
  photos: PhotoItem[],
  preferredSpreadCount?: number
): SpreadItem[] {
  if (!photos || photos.length === 0) {
    return [];
  }

  const totalPhotos = photos.length;
  // Maximum 4 photos per spread, minimum 1 photo per spread
  const minSpreads = Math.ceil(totalPhotos / 4);
  const maxSpreads = totalPhotos;

  // If a preferredSpreadCount was set (e.g. 10 to 20), clamp to valid range for the number of photos
  let targetSpreadCount = preferredSpreadCount
    ? Math.max(minSpreads, Math.min(maxSpreads, preferredSpreadCount))
    : Math.max(minSpreads, Math.min(maxSpreads, Math.ceil(totalPhotos / 2)));

  // If targetSpreadCount * 4 < totalPhotos, spreadCount must be at least minSpreads
  if (targetSpreadCount < minSpreads) targetSpreadCount = minSpreads;
  if (targetSpreadCount > maxSpreads) targetSpreadCount = maxSpreads;

  // Initialize each spread with 1 photo
  const spreadPhotoCounts: number[] = new Array(targetSpreadCount).fill(1);
  let remaining = totalPhotos - targetSpreadCount;

  // Distribute remaining photos with dynamic aesthetic pacing
  // (e.g., spreads 2, 3, 2, 4, 1, 2, 3...)
  let loopIdx = 0;
  while (remaining > 0) {
    const sIdx = loopIdx % targetSpreadCount;
    if (spreadPhotoCounts[sIdx] < 4) {
      spreadPhotoCounts[sIdx]++;
      remaining--;
    }
    loopIdx++;
    // Failsafe
    if (loopIdx > targetSpreadCount * 10) break;
  }

  let photoCursor = 0;
  const spreads: SpreadItem[] = [];

  for (let sIdx = 0; sIdx < targetSpreadCount; sIdx++) {
    const count = spreadPhotoCounts[sIdx];
    const batchPhotos = photos.slice(photoCursor, photoCursor + count);
    photoCursor += count;

    if (batchPhotos.length === 0) continue;

    // Pick best template for these exact photos
    const template = findBestTemplateForPhotos(batchPhotos);

    // Map photos to slots: sort slots and photos by aspect ratio so portraits pair with portrait slots
    const sortedSlots = template.slots.map((s, idx) => ({
      ...s,
      originalSlotIdx: idx,
      aspect: s.idealAspect || calculateSlotAspectRatio(s.width, s.height),
    })).sort((a, b) => a.aspect - b.aspect);

    const sortedPhotos = [...batchPhotos].map((p, idx) => ({
      photo: p,
      originalBatchIdx: idx,
      aspect: p.aspectRatio || (p.width && p.height ? p.width / p.height : 1.0),
    })).sort((a, b) => a.aspect - b.aspect);

    const assignmentMap = new Map<number, { photo: PhotoItem; photoAspect: number; slotAspect: number }>();
    sortedSlots.forEach((slot, i) => {
      const matchedPhotoItem = sortedPhotos[i] || sortedPhotos[0];
      if (matchedPhotoItem) {
        assignmentMap.set(slot.originalSlotIdx, {
          photo: matchedPhotoItem.photo,
          photoAspect: matchedPhotoItem.aspect,
          slotAspect: slot.aspect,
        });
      }
    });

    const newSlots: SlotLayout[] = template.slots.map((s, slotIdx) => {
      const match = assignmentMap.get(slotIdx);
      const photo = match?.photo || batchPhotos[slotIdx % batchPhotos.length];
      const photoAspect = match?.photoAspect || 1.0;
      const slotAspect = match?.slotAspect || calculateSlotAspectRatio(s.width, s.height);

      const aspectDiff = Math.abs(Math.log(photoAspect / slotAspect));
      const fitMode: 'cover' | 'contain' = aspectDiff < 0.18 ? 'cover' : 'contain';

      return {
        id: `slot-${sIdx + 1}-${slotIdx + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        x: s.x,
        y: s.y,
        width: s.width,
        height: s.height,
        photoId: photo.id,
        zoom: 1,
        panX: 0,
        panY: 0,
        fit: fitMode,
        filter: 'none' as const,
      };
    });

    const spreadNumber = sIdx + 1;
    spreads.push({
      id: `spread-${spreadNumber}-${Date.now()}`,
      spreadNumber,
      templateId: template.id,
      slots: newSlots,
      layoutTitle: `Lâmina ${spreadNumber} (Páginas ${spreadNumber * 2 - 1}-${spreadNumber * 2})`,
      backgroundColor: '#FAF7F2',
    });
  }

  return spreads;
}

/**
 * Sanitizes existing spreads to guarantee:
 * 1. Spreads with 0 photos are removed.
 * 2. Spreads with fewer photos than slots adapt to the best matching template for the photos they contain (no empty slots).
 * 3. Spreads are renumbered sequentially.
 */
export function sanitizeSpreads(spreads: SpreadItem[], photos: PhotoItem[]): SpreadItem[] {
  const photoMap = new Map<string, PhotoItem>();
  photos.forEach((p) => photoMap.set(p.id, p));

  const validSpreads: SpreadItem[] = [];

  for (const spread of spreads) {
    // Filter slots that have valid photos
    const populatedSlots = spread.slots.filter(
      (s) => s.photoId && photoMap.has(s.photoId)
    );

    // If spread is empty, discard it
    if (populatedSlots.length === 0) {
      continue;
    }

    const currentPhotos = populatedSlots
      .map((s) => photoMap.get(s.photoId!))
      .filter((p): p is PhotoItem => p !== undefined);

    // If template slots count matches populated count exactly, keep it
    if (populatedSlots.length === spread.slots.length) {
      validSpreads.push(spread);
      continue;
    }

    // Otherwise, adapt template to the exact number of photos present (1..4)
    const template = findBestTemplateForPhotos(currentPhotos);

    const newSlots: SlotLayout[] = template.slots.map((sDef, idx) => {
      const existingSlot = populatedSlots[idx];
      const photo = currentPhotos[idx];

      return {
        id: existingSlot?.id || `slot-${spread.spreadNumber}-${idx + 1}-${Date.now()}`,
        x: sDef.x,
        y: sDef.y,
        width: sDef.width,
        height: sDef.height,
        photoId: photo?.id,
        zoom: existingSlot?.zoom || 1,
        panX: existingSlot?.panX || 0,
        panY: existingSlot?.panY || 0,
        fit: existingSlot?.fit || 'cover',
        filter: existingSlot?.filter || 'none',
      };
    });

    validSpreads.push({
      ...spread,
      templateId: template.id,
      slots: newSlots,
    });
  }

  // Renumber spreads sequentially
  return validSpreads.map((spread, idx) => {
    const spreadNumber = idx + 1;
    return {
      ...spread,
      spreadNumber,
      layoutTitle: `Lâmina ${spreadNumber} (Páginas ${spreadNumber * 2 - 1}-${spreadNumber * 2})`,
    };
  });
}
