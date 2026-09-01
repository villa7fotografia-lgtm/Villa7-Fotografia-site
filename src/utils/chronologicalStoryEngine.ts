import { PhotoItem } from '../types';

/**
 * Parses date and time from filename patterns or lastModified timestamp.
 * Supported patterns:
 * - YYYYMMDD_HHMMSS (e.g. IMG_20240518_143022.jpg)
 * - YYYY-MM-DD HH.MM.SS or YYYY-MM-DD_HH-MM-SS
 * - YYYYMMDD (e.g. PHOTO_20240518.jpg)
 * - DD-MM-YYYY or DD_MM_YYYY
 * - Numeric sequence prefixes (e.g. 01_preparacao.jpg, 02_cerimonia.jpg, DSC_0045.jpg)
 */
export function extractPhotoChronologicalData(
  filename: string,
  lastModified?: number,
  fallbackIndex = 0
): {
  timestamp: number;
  formattedDate: string;
  formattedTime: string;
  numericOrder: number;
} {
  const cleanName = filename.trim();
  let detectedTimestamp: number | null = null;
  let detectedTimeStr = '';
  let detectedDateStr = '';

  // 1. Pattern: YYYYMMDD_HHMMSS or YYYYMMDD-HHMMSS (e.g., IMG_20240518_143022.jpg, 20240518_143022.jpg)
  const patternFull = /(?:IMG_|VID_|PHOTO_|DSC_)?(\d{4})(\d{2})(\d{2})[_\s-T](\d{2})(\d{2})(\d{2})/i;
  const matchFull = cleanName.match(patternFull);
  if (matchFull) {
    const year = parseInt(matchFull[1], 10);
    const month = parseInt(matchFull[2], 10) - 1;
    const day = parseInt(matchFull[3], 10);
    const hour = parseInt(matchFull[4], 10);
    const minute = parseInt(matchFull[5], 10);
    const second = parseInt(matchFull[6], 10);

    const d = new Date(year, month, day, hour, minute, second);
    if (!isNaN(d.getTime())) {
      detectedTimestamp = d.getTime();
      detectedDateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
      detectedTimeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    }
  }

  // 2. Pattern: YYYY-MM-DD or YYYY.MM.DD with optional time
  if (!detectedTimestamp) {
    const patternDateWithDashes = /(\d{4})[-.](\d{2})[-.](\d{2})(?:[_\s-T](\d{2})[-.:](\d{2})(?:[-.:](\d{2}))?)?/;
    const matchDashes = cleanName.match(patternDateWithDashes);
    if (matchDashes) {
      const year = parseInt(matchDashes[1], 10);
      const month = parseInt(matchDashes[2], 10) - 1;
      const day = parseInt(matchDashes[3], 10);
      const hour = matchDashes[4] ? parseInt(matchDashes[4], 10) : 12;
      const minute = matchDashes[5] ? parseInt(matchDashes[5], 10) : 0;
      const second = matchDashes[6] ? parseInt(matchDashes[6], 10) : 0;

      const d = new Date(year, month, day, hour, minute, second);
      if (!isNaN(d.getTime())) {
        detectedTimestamp = d.getTime();
        detectedDateStr = `${String(day).padStart(2, '0')}/${String(month + 1).padStart(2, '0')}/${year}`;
        detectedTimeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      }
    }
  }

  // 3. Fallback to file.lastModified if valid
  if (!detectedTimestamp && lastModified && lastModified > 0) {
    const d = new Date(lastModified);
    if (!isNaN(d.getTime())) {
      detectedTimestamp = lastModified;
      detectedDateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      detectedTimeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
  }

  // 4. Extract numeric sequence order from filename (e.g. "01_...", "DSC_0123.jpg", "foto(3).jpg")
  const seqMatch = cleanName.match(/(?:^|\D)(\d{1,4})(?:\D|$)/);
  const numericOrder = seqMatch ? parseInt(seqMatch[1], 10) : fallbackIndex;

  // Final fallback timestamp
  if (!detectedTimestamp) {
    // Artificial spacing if no date is found (maintaining relative sequence order)
    detectedTimestamp = Date.now() - (1000 - fallbackIndex) * 60000;
    const d = new Date(detectedTimestamp);
    detectedDateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    detectedTimeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  return {
    timestamp: detectedTimestamp,
    formattedDate: detectedDateStr,
    formattedTime: detectedTimeStr,
    numericOrder,
  };
}

/**
 * Natural Alphanumeric + Chronological comparator for photos.
 * Analyzes:
 * 1. Timestamp (if differences are significant > 1 second).
 * 2. Natural filename numeric chunks (e.g., photo1 < photo2 < photo10).
 */
export function comparePhotosChronologically(a: PhotoItem, b: PhotoItem): number {
  const timeA = a.timestamp || a.createdAt || 0;
  const timeB = b.timestamp || b.createdAt || 0;

  // If timestamps differ by more than 2 seconds, use timestamp
  if (Math.abs(timeA - timeB) > 2000) {
    return timeA - timeB;
  }

  // Otherwise, use natural alphanumeric sorting on the filenames
  return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Sorts all photos into exact chronological & narrative story order.
 */
export function sortPhotosByStoryChronology(photos: PhotoItem[]): PhotoItem[] {
  return [...photos]
    .sort(comparePhotosChronologically)
    .map((photo, idx) => ({
      ...photo,
      chronologicalIndex: idx + 1,
    }));
}

/**
 * Narrative story chapter definitions across 10 spreads.
 */
export const NARRATIVE_CHAPTERS_10 = [
  { chapter: 'Início & Preparação', subtitle: 'Chegada, ambientação e detalhes iniciais' },
  { chapter: 'Preparação & Expectativa', subtitle: 'Momentos íntimos e making of' },
  { chapter: 'Encontro & Emoção', subtitle: 'Primeiros olhares e conexões' },
  { chapter: 'Cerimônia & Votos', subtitle: 'A celebração solene e emoção' },
  { chapter: 'Momento Clímax & Beijo', subtitle: 'O ápice da celebração' },
  { chapter: 'Retratos Oficiais', subtitle: 'Ensaio fotográfico dos protagonistas' },
  { chapter: 'Afetos & Família', subtitle: 'Padrinhos, familiares e abraços' },
  { chapter: 'Recepção & Brindes', subtitle: 'Celebração festiva e alegria' },
  { chapter: 'Festa & Espontaneidade', subtitle: 'Dança, descontração e momentos vivos' },
  { chapter: 'Desfecho & Memória Eterna', subtitle: 'Encerramento poético do álbum' },
];

/**
 * Assigns a narrative chapter title based on spread position (1-based index).
 */
export function getNarrativeChapterForSpread(spreadNumber: number, totalSpreads = 10): { chapter: string; subtitle: string } {
  if (totalSpreads === 10 && spreadNumber >= 1 && spreadNumber <= 10) {
    return NARRATIVE_CHAPTERS_10[spreadNumber - 1];
  }

  const ratio = (spreadNumber - 1) / Math.max(1, totalSpreads - 1);
  if (ratio < 0.2) return { chapter: 'Início & Preparação', subtitle: 'Ambientação e detalhes iniciais' };
  if (ratio < 0.4) return { chapter: 'Desenvolvimento da História', subtitle: 'Conexão e expectativa' };
  if (ratio < 0.6) return { chapter: 'Momento Alto & Clímax', subtitle: 'O ápice da celebração' };
  if (ratio < 0.8) return { chapter: 'Retratos & Família', subtitle: 'Laços afetivos e protagonistas' };
  return { chapter: 'Celebração & Desfecho', subtitle: 'Encerramento memorável da narrativa' };
}
