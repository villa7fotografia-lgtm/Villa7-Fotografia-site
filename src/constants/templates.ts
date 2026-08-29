import { TemplateDef, SlotLayout } from '../types';

export type TemplateSlotDef = Omit<SlotLayout, 'id' | 'photoId' | 'zoom' | 'panX' | 'panY' | 'fit'>;

export const SPREAD_TEMPLATES: TemplateDef[] = [
  // =========================================================================
  // --- 1 PHOTO TEMPLATES ---
  // =========================================================================
  {
    id: '1-full-bleed-panoramic',
    name: 'Panorâmica Total Sangrada',
    category: '1 Foto',
    photoCount: 1,
    orientationPattern: 'PAN',
    description: 'Foto horizontal ampla que ocupa toda a lâmina aberta 20x30 cm com impacto visual.',
    slots: [
      { x: 0, y: 0, width: 100, height: 100, orientation: 'panoramic', idealAspect: 1.5 }
    ]
  },
  {
    id: '1-center-hero-landscape',
    name: 'Paisagem Horizontal Centralizada',
    category: '1 Foto',
    photoCount: 1,
    orientationPattern: 'L',
    description: 'Foto horizontal (3:2) centralizada na lâmina com margem nobre estilo galeria de arte (sem cortes).',
    slots: [
      { x: 6, y: 6, width: 88, height: 88, orientation: 'landscape', idealAspect: 1.5 }
    ]
  },
  {
    id: '1-left-page-portrait',
    name: 'Retrato Vertical na Página Esquerda',
    category: '1 Foto',
    photoCount: 1,
    orientationPattern: 'P',
    description: 'Retrato vertical (2:3) na página esquerda 15x20 e espaço de respiro sereno na direita.',
    slots: [
      { x: 6.5, y: 8, width: 37, height: 84, orientation: 'portrait', idealAspect: 0.66 }
    ]
  },
  {
    id: '1-right-page-portrait',
    name: 'Retrato Vertical na Página Direita',
    category: '1 Foto',
    photoCount: 1,
    orientationPattern: 'P',
    description: 'Espaço sereno na esquerda e retrato vertical (2:3) em destaque na página direita 15x20.',
    slots: [
      { x: 56.5, y: 8, width: 37, height: 84, orientation: 'portrait', idealAspect: 0.66 }
    ]
  },

  // =========================================================================
  // --- 2 PHOTOS TEMPLATES ---
  // =========================================================================
  {
    id: '2-duo-vertical-portraits',
    name: '2 Verticais Clássicas (2:3 Sem Cortes)',
    category: '2 Fotos',
    photoCount: 2,
    orientationPattern: 'P-P',
    description: 'Duas fotos verticais na proporção exata 2:3 (uma em cada página 15x20), sem nenhum corte.',
    slots: [
      { x: 6.5, y: 8, width: 37, height: 84, orientation: 'portrait', idealAspect: 0.66 },
      { x: 56.5, y: 8, width: 37, height: 84, orientation: 'portrait', idealAspect: 0.66 }
    ]
  },
  {
    id: '2-duo-landscape-pages',
    name: '2 Horizontais Clássicas (3:2 Sem Cortes)',
    category: '2 Fotos',
    photoCount: 2,
    orientationPattern: 'L-L',
    description: 'Duas fotos horizontais na proporção exata 3:2 harmonizadas nas páginas esquerda e direita.',
    slots: [
      { x: 4, y: 29, width: 42, height: 42, orientation: 'landscape', idealAspect: 1.5 },
      { x: 54, y: 29, width: 42, height: 42, orientation: 'landscape', idealAspect: 1.5 }
    ]
  },
  {
    id: '2-mixed-left-portrait-right-landscape',
    name: '1 Vertical na Esquerda + 1 Horizontal na Direita',
    category: '2 Fotos',
    photoCount: 2,
    orientationPattern: 'P-L',
    description: 'Combina perfeitamente um retrato vertical na esquerda com uma foto horizontal na direita.',
    slots: [
      { x: 6.5, y: 8, width: 37, height: 84, orientation: 'portrait', idealAspect: 0.66 },
      { x: 54, y: 29, width: 42, height: 42, orientation: 'landscape', idealAspect: 1.5 }
    ]
  },
  {
    id: '2-mixed-left-landscape-right-portrait',
    name: '1 Horizontal na Esquerda + 1 Vertical na Direita',
    category: '2 Fotos',
    photoCount: 2,
    orientationPattern: 'L-P',
    description: 'Combina uma foto horizontal na esquerda com um retrato vertical na direita.',
    slots: [
      { x: 4, y: 29, width: 42, height: 42, orientation: 'landscape', idealAspect: 1.5 },
      { x: 56.5, y: 8, width: 37, height: 84, orientation: 'portrait', idealAspect: 0.66 }
    ]
  },
  {
    id: '2-duo-balanced-pages',
    name: 'Duo Nobre Amplo',
    category: '2 Fotos',
    photoCount: 2,
    orientationPattern: 'P-P',
    description: 'Fotos amplas em cada página 15x20 com margens refinadas.',
    slots: [
      { x: 4, y: 6, width: 42, height: 88, orientation: 'portrait', idealAspect: 0.72 },
      { x: 54, y: 6, width: 42, height: 88, orientation: 'portrait', idealAspect: 0.72 }
    ]
  },
  {
    id: '2-right-duo-vertical',
    name: '2 Verticais Emparelhadas à Direita',
    category: '2 Fotos',
    photoCount: 2,
    orientationPattern: 'P-P',
    description: 'Página esquerda aberta para respiro e duas verticais emparelhadas na página direita.',
    slots: [
      { x: 53, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 76, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 }
    ]
  },

  // =========================================================================
  // --- 3 PHOTOS TEMPLATES ---
  // =========================================================================
  {
    id: '3-triptych-vertical',
    name: 'Tríptico 3 Verticais (2:3 Sem Cortes)',
    category: '3 Fotos',
    photoCount: 3,
    orientationPattern: 'P-P-P',
    description: 'Três retratos verticais alinhados em proporção 2:3, perfeitos para sequências de ensaio ou família.',
    slots: [
      { x: 4, y: 8, width: 28, height: 84, orientation: 'portrait', idealAspect: 0.5 },
      { x: 36, y: 8, width: 28, height: 84, orientation: 'portrait', idealAspect: 0.5 },
      { x: 68, y: 8, width: 28, height: 84, orientation: 'portrait', idealAspect: 0.5 }
    ]
  },
  {
    id: '3-hero-portrait-two-horizontal',
    name: '1 Vertical na Esquerda + 2 Horizontais na Direita',
    category: '3 Fotos',
    photoCount: 3,
    orientationPattern: 'P-L-L',
    description: '1 retrato vertical de corpo inteiro na esquerda e 2 fotos horizontais empilhadas na direita.',
    slots: [
      { x: 6.5, y: 8, width: 37, height: 84, orientation: 'portrait', idealAspect: 0.66 },
      { x: 54, y: 8, width: 42, height: 39, orientation: 'landscape', idealAspect: 1.61 },
      { x: 54, y: 53, width: 42, height: 39, orientation: 'landscape', idealAspect: 1.61 }
    ]
  },
  {
    id: '3-two-horizontal-hero-portrait',
    name: '2 Horizontais na Esquerda + 1 Vertical na Direita',
    category: '3 Fotos',
    photoCount: 3,
    orientationPattern: 'L-L-P',
    description: '2 fotos horizontais empilhadas na esquerda e 1 retrato vertical de corpo inteiro na direita.',
    slots: [
      { x: 4, y: 8, width: 42, height: 39, orientation: 'landscape', idealAspect: 1.61 },
      { x: 4, y: 53, width: 42, height: 39, orientation: 'landscape', idealAspect: 1.61 },
      { x: 56.5, y: 8, width: 37, height: 84, orientation: 'portrait', idealAspect: 0.66 }
    ]
  },
  {
    id: '3-hero-landscape-two-portraits',
    name: '1 Horizontal na Esquerda + 2 Verticais na Direita',
    category: '3 Fotos',
    photoCount: 3,
    orientationPattern: 'L-P-P',
    description: '1 foto horizontal na página esquerda e 2 retratos verticais na página direita.',
    slots: [
      { x: 4, y: 29, width: 42, height: 42, orientation: 'landscape', idealAspect: 1.5 },
      { x: 53, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 76, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 }
    ]
  },

  // =========================================================================
  // --- 4 PHOTOS TEMPLATES ---
  // =========================================================================
  {
    id: '4-quad-portrait-row',
    name: '4 Retratos Verticais Alinhados (2:3 Sem Cortes)',
    category: '4 Fotos',
    photoCount: 4,
    orientationPattern: 'P-P-P-P',
    description: 'Quatro retratos verticais (2 na página esquerda, 2 na página direita) com alinhamento refinado.',
    slots: [
      { x: 4, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 26, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 54, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 76, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 }
    ]
  },
  {
    id: '4-quad-gallery-grid',
    name: 'Galeria 4 Fotos Horizontais (Grid 2x2)',
    category: '4 Fotos',
    photoCount: 4,
    orientationPattern: 'L-L-L-L',
    description: 'Quatro fotos horizontais distribuídas em grid simétrico 2x2.',
    slots: [
      { x: 4, y: 8, width: 42, height: 39, orientation: 'landscape', idealAspect: 1.61 },
      { x: 4, y: 53, width: 42, height: 39, orientation: 'landscape', idealAspect: 1.61 },
      { x: 54, y: 8, width: 42, height: 39, orientation: 'landscape', idealAspect: 1.61 },
      { x: 54, y: 53, width: 42, height: 39, orientation: 'landscape', idealAspect: 1.61 }
    ]
  },
  {
    id: '4-mixed-2horizontal-2vertical',
    name: '2 Horizontais na Esquerda + 2 Verticais na Direita',
    category: '4 Fotos',
    photoCount: 4,
    orientationPattern: 'L-L-P-P',
    description: 'Composição mista: 2 horizontais empilhadas na esquerda e 2 retratos verticais na direita.',
    slots: [
      { x: 4, y: 8, width: 42, height: 39, orientation: 'landscape', idealAspect: 1.61 },
      { x: 4, y: 53, width: 42, height: 39, orientation: 'landscape', idealAspect: 1.61 },
      { x: 53, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 76, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 }
    ]
  },
  {
    id: '4-mixed-2vertical-2horizontal',
    name: '2 Verticais na Esquerda + 2 Horizontais na Direita',
    category: '4 Fotos',
    photoCount: 4,
    orientationPattern: 'P-P-L-L',
    description: '2 retratos verticais na página esquerda e 2 horizontais empilhadas na página direita.',
    slots: [
      { x: 4, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 26, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 54, y: 8, width: 42, height: 39, orientation: 'landscape', idealAspect: 1.61 },
      { x: 54, y: 53, width: 42, height: 39, orientation: 'landscape', idealAspect: 1.61 }
    ]
  }
];

export const DEFAULT_TEMPLATE_ID = '2-duo-vertical-portraits';

export function getTemplateById(id: string): TemplateDef {
  const found = SPREAD_TEMPLATES.find((t) => t.id === id);
  return found || SPREAD_TEMPLATES[0];
}

export function getTemplatesByPhotoCount(count: 1 | 2 | 3 | 4): TemplateDef[] {
  return SPREAD_TEMPLATES.filter((t) => t.photoCount === count);
}

/**
 * Calculates slot aspect ratio on a 3:2 spread (20x30 cm aberta / 15x20 vertical fechada)
 */
export function calculateSlotAspectRatio(slotWidthPct: number, slotHeightPct: number): number {
  return (slotWidthPct * 1.5) / Math.max(1, slotHeightPct);
}

/**
 * Finds best matching template for a specific list of photos based on their orientations
 */
export function findBestTemplateForPhotos(
  photos: { aspectRatio?: number; width?: number; height?: number }[]
): TemplateDef {
  const count = Math.min(4, Math.max(1, photos.length)) as 1 | 2 | 3 | 4;
  const templates = getTemplatesByPhotoCount(count);
  if (templates.length === 1) return templates[0];

  const photoAspects = photos.slice(0, count).map((p) => {
    if (p.aspectRatio && p.aspectRatio > 0) return p.aspectRatio;
    if (p.width && p.height && p.height > 0) return p.width / p.height;
    return 1.0;
  });

  // Calculate score for each candidate template (lower difference = better match)
  let bestTemplate = templates[0];
  let lowestDiff = Infinity;

  for (const t of templates) {
    let diff = 0;
    for (let i = 0; i < count; i++) {
      const slot = t.slots[i] || t.slots[0];
      const slotAspect = slot.idealAspect || calculateSlotAspectRatio(slot.width, slot.height);
      const photoAspect = photoAspects[i] || 1.0;
      // Penalize aspect mismatch log ratio
      diff += Math.abs(Math.log(Math.max(0.1, photoAspect) / Math.max(0.1, slotAspect)));
    }

    if (diff < lowestDiff) {
      lowestDiff = diff;
      bestTemplate = t;
    }
  }

  return bestTemplate;
}
