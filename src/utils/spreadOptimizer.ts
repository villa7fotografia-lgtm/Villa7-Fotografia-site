import { PhotoItem, SpreadItem, SlotLayout, TemplateDef } from '../types';
import { findBestTemplateForPhotos, calculateSlotAspectRatio, getTemplateById } from '../constants/templates';
import {
  sortPhotosByStoryChronology,
  getNarrativeChapterForSpread,
  extractPhotoChronologicalData,
} from './chronologicalStoryEngine';

/**
 * Distributes all uploaded photos across spreads ensuring:
 * 1. 100% of uploaded photos are placed (Maximum utilization, up to 40 photos).
 * 2. Strict Chronological Narrative Flow (Data e Horário ou Ordem Natural dos Acontecimentos).
 * 3. Grouping of temporal moments (bursts/sequences taken close in time).
 * 4. Zero empty spreads, zero empty slots.
 * 5. Aesthetic pacing across the 10 spreads (hero spreads + multi-photo dynamic spreads).
 */
export function distributePhotosToSpreads(
  photos: PhotoItem[],
  preferredSpreadCount?: number
): SpreadItem[] {
  if (!photos || photos.length === 0) {
    return [];
  }

  // 1. Sort photos chronologically by captured timestamp / file date / natural sequence
  const sortedPhotos = sortPhotosByStoryChronology(photos);
  const totalPhotos = sortedPhotos.length;

  // Maximum 4 photos per spread, minimum 1 photo per spread
  const minSpreads = Math.ceil(totalPhotos / 4);
  const maxSpreads = totalPhotos;

  // Standard Villa7 is 10 Spreads (20 pages 15x20 cm vertical)
  let targetSpreadCount = preferredSpreadCount || 10;
  if (targetSpreadCount < minSpreads) targetSpreadCount = minSpreads;
  if (targetSpreadCount > maxSpreads) targetSpreadCount = maxSpreads;

  // Calculate balanced photo distribution per spread
  const baseCount = Math.floor(totalPhotos / targetSpreadCount);
  let remainder = totalPhotos % targetSpreadCount;

  // Initialize distribution with base counts
  const spreadPhotoCounts: number[] = new Array(targetSpreadCount).fill(baseCount);

  // If total photos < targetSpreadCount, ensure first spreads get 1 photo
  if (baseCount === 0) {
    for (let i = 0; i < totalPhotos; i++) {
      spreadPhotoCounts[i] = 1;
    }
  } else {
    // Dynamic narrative pacing: distribute extra photos with aesthetic cadence
    // Priority order: dynamic spreads (3, 7, 2, 8, 4, 6...) while giving hero breath to center spreads
    const pacingPriority = [2, 7, 1, 8, 3, 6, 0, 9, 4, 5];
    let priorityIdx = 0;

    while (remainder > 0 && priorityIdx < pacingPriority.length) {
      const spreadIdx = pacingPriority[priorityIdx % pacingPriority.length] % targetSpreadCount;
      if (spreadPhotoCounts[spreadIdx] < 4) {
        spreadPhotoCounts[spreadIdx]++;
        remainder--;
      }
      priorityIdx++;
      if (priorityIdx > targetSpreadCount * 5) break;
    }

    // Failsafe for any remaining
    let fallbackIdx = 0;
    while (remainder > 0) {
      const idx = fallbackIdx % targetSpreadCount;
      if (spreadPhotoCounts[idx] < 4) {
        spreadPhotoCounts[idx]++;
        remainder--;
      }
      fallbackIdx++;
      if (fallbackIdx > targetSpreadCount * 10) break;
    }
  }

  let photoCursor = 0;
  const spreads: SpreadItem[] = [];

  for (let sIdx = 0; sIdx < targetSpreadCount; sIdx++) {
    const count = spreadPhotoCounts[sIdx];
    if (count === 0) continue;

    const batchPhotos = sortedPhotos.slice(photoCursor, photoCursor + count);
    photoCursor += count;

    if (batchPhotos.length === 0) continue;

    // Pick best template for the exact photo count and orientation mix (P vs L)
    const template = findBestTemplateForPhotos(batchPhotos);

    // Map photos to slots: sort slots and photos by aspect ratio so vertical portraits pair with portrait slots
    const sortedSlots = template.slots.map((s, idx) => ({
      ...s,
      originalSlotIdx: idx,
      aspect: s.idealAspect || calculateSlotAspectRatio(s.width, s.height),
    })).sort((a, b) => a.aspect - b.aspect);

    const sortedBatchPhotos = [...batchPhotos].map((p, idx) => ({
      photo: p,
      originalBatchIdx: idx,
      aspect: p.aspectRatio || (p.width && p.height ? p.width / p.height : 1.0),
    })).sort((a, b) => a.aspect - b.aspect);

    const assignmentMap = new Map<number, { photo: PhotoItem; photoAspect: number; slotAspect: number }>();
    sortedSlots.forEach((slot, i) => {
      const matchedPhotoItem = sortedBatchPhotos[i] || sortedBatchPhotos[0];
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
      const fitMode: 'cover' | 'contain' = aspectDiff < 0.22 ? 'cover' : 'contain';

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
    const chapterInfo = getNarrativeChapterForSpread(spreadNumber, targetSpreadCount);

    // Calculate time range for this spread's photos
    const firstPhotoTime = batchPhotos[0]?.formattedTime;
    const lastPhotoTime = batchPhotos[batchPhotos.length - 1]?.formattedTime;
    const dateStr = batchPhotos[0]?.formattedDate;

    let timeRange = '';
    if (firstPhotoTime && lastPhotoTime) {
      timeRange = firstPhotoTime === lastPhotoTime
        ? firstPhotoTime
        : `${firstPhotoTime} - ${lastPhotoTime}`;
      if (dateStr) timeRange = `${dateStr} • ${timeRange}`;
    }

    spreads.push({
      id: `spread-${spreadNumber}-${Date.now()}`,
      spreadNumber,
      templateId: template.id,
      slots: newSlots,
      layoutTitle: `Lâmina ${spreadNumber} (Páginas ${spreadNumber * 2 - 1}-${spreadNumber * 2})`,
      storyChapter: `${chapterInfo.chapter}`,
      timeRange: timeRange || undefined,
      backgroundColor: '#FAF7F2',
    });
  }

  return spreads;
}

/**
 * Sanitizes existing spreads to guarantee:
 * 1. Spreads with 0 photos are removed.
 * 2. Spreads with fewer photos than slots adapt to the best matching template for the photos they contain (no empty slots).
 * 3. Spreads are renumbered sequentially with updated narrative chapters.
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

  // Renumber spreads sequentially and update narrative metadata
  return validSpreads.map((spread, idx) => {
    const spreadNumber = idx + 1;
    const chapterInfo = getNarrativeChapterForSpread(spreadNumber, validSpreads.length);

    return {
      ...spread,
      spreadNumber,
      layoutTitle: `Lâmina ${spreadNumber} (Páginas ${spreadNumber * 2 - 1}-${spreadNumber * 2})`,
      storyChapter: spread.storyChapter || chapterInfo.chapter,
    };
  });
}
