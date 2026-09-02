import { TemplateDef, SlotLayout } from '../types';

export type TemplateSlotDef = Omit<SlotLayout, 'id' | 'photoId' | 'zoom' | 'panX' | 'panY' | 'fit'>;

export const SPREAD_TEMPLATES: TemplateDef[] = [
  // =========================================================================
  // --- 1 FOTO (DESTAQUE / HERO NA LÂMINA) ---
  // =========================================================================
  {
    id: '1-full-bleed-panoramic',
    name: 'Foto Panorâmica Total (1 Destaque)',
    category: '1 Foto (Destaque)',
    photoCount: 1,
    orientationPattern: 'PAN',
    description: 'Foto horizontal ampla que ocupa toda a lâmina aberta 20x30 cm com grande impacto visual.',
    slots: [
      { x: 0, y: 0, width: 100, height: 100, orientation: 'panoramic', idealAspect: 1.5 }
    ]
  },
  {
    id: '1-center-hero-landscape',
    name: 'Paisagem Centralizada com Margem (1 Destaque)',
    category: '1 Foto (Destaque)',
    photoCount: 1,
    orientationPattern: 'L',
    description: 'Foto horizontal centralizada na lâmina com margem elegante (sem cortes).',
    slots: [
      { x: 6, y: 6, width: 88, height: 88, orientation: 'landscape', idealAspect: 1.5 }
    ]
  },
  {
    id: '1-left-page-portrait',
    name: 'Retrato Destaque na Página Esquerda',
    category: '1 Foto (Destaque)',
    photoCount: 1,
    orientationPattern: 'P',
    description: 'Retrato vertical na página esquerda 15x20 e espaço em branco elegante na direita.',
    slots: [
      { x: 6.5, y: 8, width: 37, height: 84, orientation: 'portrait', idealAspect: 0.66 }
    ]
  },
  {
    id: '1-right-page-portrait',
    name: 'Retrato Destaque na Página Direita',
    category: '1 Foto (Destaque)',
    photoCount: 1,
    orientationPattern: 'P',
    description: 'Espaço em branco na esquerda e retrato vertical em destaque na página direita 15x20.',
    slots: [
      { x: 56.5, y: 8, width: 37, height: 84, orientation: 'portrait', idealAspect: 0.66 }
    ]
  },

  // =========================================================================
  // --- 2 FOTOS (1 FOTO POR PÁGINA) ---
  // =========================================================================
  {
    id: '2-duo-vertical-portraits',
    name: '2 Verticais Clássicas (1 por Página)',
    category: '2 Fotos (1 por Página)',
    photoCount: 2,
    orientationPattern: 'P-P',
    description: 'Duas fotos verticais (uma em cada página 15x20), sem nenhum corte.',
    slots: [
      { x: 6.5, y: 8, width: 37, height: 84, orientation: 'portrait', idealAspect: 0.66 },
      { x: 56.5, y: 8, width: 37, height: 84, orientation: 'portrait', idealAspect: 0.66 }
    ]
  },
  {
    id: '2-duo-landscape-pages',
    name: '2 Horizontais Clássicas (1 por Página)',
    category: '2 Fotos (1 por Página)',
    photoCount: 2,
    orientationPattern: 'L-L',
    description: 'Duas fotos horizontais harmonizadas nas páginas esquerda e direita.',
    slots: [
      { x: 4, y: 29, width: 42, height: 42, orientation: 'landscape', idealAspect: 1.5 },
      { x: 54, y: 29, width: 42, height: 42, orientation: 'landscape', idealAspect: 1.5 }
    ]
  },
  {
    id: '2-mixed-left-portrait-right-landscape',
    name: '1 Vertical na Esquerda + 1 Horizontal na Direita',
    category: '2 Fotos (1 por Página)',
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
    category: '2 Fotos (1 por Página)',
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
    name: 'Duo Nobre Amplo (1 por Página)',
    category: '2 Fotos (1 por Página)',
    photoCount: 2,
    orientationPattern: 'P-P',
    description: 'Fotos amplas em cada página 15x20 com margens refinadas de alta costura.',
    slots: [
      { x: 4, y: 6, width: 42, height: 88, orientation: 'portrait', idealAspect: 0.72 },
      { x: 54, y: 6, width: 42, height: 88, orientation: 'portrait', idealAspect: 0.72 }
    ]
  },
  {
    id: '2-right-duo-vertical',
    name: '2 Verticais na Página Direita',
    category: '2 Fotos (1 por Página)',
    photoCount: 2,
    orientationPattern: 'P-P',
    description: 'Página esquerda livre para respiro editorial e duas verticais emparelhadas na página direita.',
    slots: [
      { x: 53, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 76, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 }
    ]
  },
  {
    id: '2-left-duo-vertical',
    name: '2 Verticais na Página Esquerda',
    category: '2 Fotos (1 por Página)',
    photoCount: 2,
    orientationPattern: 'P-P',
    description: 'Duas verticais emparelhadas na página esquerda e página direita livre para respiro editorial.',
    slots: [
      { x: 4, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 26, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 }
    ]
  },

  // =========================================================================
  // --- 3 FOTOS (1 A 2 FOTOS POR PÁGINA) ---
  // =========================================================================
  {
    id: '3-hero-portrait-two-horizontal',
    name: '1 Destaque na Esquerda + 2 Horizontais na Direita',
    category: '3 Fotos (1 a 2 por Página)',
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
    name: '2 Horizontais na Esquerda + 1 Destaque na Direita',
    category: '3 Fotos (1 a 2 por Página)',
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
    category: '3 Fotos (1 a 2 por Página)',
    photoCount: 3,
    orientationPattern: 'L-P-P',
    description: '1 foto horizontal na página esquerda e 2 retratos verticais na página direita.',
    slots: [
      { x: 4, y: 29, width: 42, height: 42, orientation: 'landscape', idealAspect: 1.5 },
      { x: 53, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 76, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 }
    ]
  },
  {
    id: '3-two-portraits-hero-landscape',
    name: '2 Verticais na Esquerda + 1 Horizontal na Direita',
    category: '3 Fotos (1 a 2 por Página)',
    photoCount: 3,
    orientationPattern: 'P-P-L',
    description: '2 retratos verticais na página esquerda e 1 foto horizontal de destaque na página direita.',
    slots: [
      { x: 4, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 26, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 54, y: 29, width: 42, height: 42, orientation: 'landscape', idealAspect: 1.5 }
    ]
  },
  {
    id: '3-one-left-two-right-portraits',
    name: '1 Vertical na Esquerda + 2 Verticais na Direita',
    category: '3 Fotos (1 a 2 por Página)',
    photoCount: 3,
    orientationPattern: 'P-P-P',
    description: '1 retrato amplo na página esquerda e 2 retratos emparelhados na página direita.',
    slots: [
      { x: 6.5, y: 8, width: 37, height: 84, orientation: 'portrait', idealAspect: 0.66 },
      { x: 53, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 76, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 }
    ]
  },
  {
    id: '3-two-left-one-right-portraits',
    name: '2 Verticais na Esquerda + 1 Vertical na Direita',
    category: '3 Fotos (1 a 2 por Página)',
    photoCount: 3,
    orientationPattern: 'P-P-P',
    description: '2 retratos emparelhados na página esquerda e 1 retrato amplo na página direita.',
    slots: [
      { x: 4, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 26, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 56.5, y: 8, width: 37, height: 84, orientation: 'portrait', idealAspect: 0.66 }
    ]
  },

  // =========================================================================
  // --- 4 FOTOS (MÁXIMO 4 POR LÂMINA / EXATAMENTE 2 POR PÁGINA) ---
  // =========================================================================
  {
    id: '4-quad-portrait-row',
    name: '4 Verticais (2 na Esquerda + 2 na Direita)',
    category: '4 Fotos (2 por Página)',
    photoCount: 4,
    orientationPattern: 'P-P-P-P',
    description: 'Quatro retratos verticais (2 na página esquerda e 2 na página direita) com alinhamento refinado.',
    slots: [
      { x: 4, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 26, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 54, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 },
      { x: 76, y: 8, width: 20, height: 84, orientation: 'portrait', idealAspect: 0.36 }
    ]
  },
  {
    id: '4-quad-gallery-grid',
    name: '4 Horizontais Grid 2x2 (2 por Página)',
    category: '4 Fotos (2 por Página)',
    photoCount: 4,
    orientationPattern: 'L-L-L-L',
    description: 'Quatro fotos horizontais distribuídas em grid 2x2 (2 na página esquerda e 2 na página direita).',
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
    category: '4 Fotos (2 por Página)',
    photoCount: 4,
    orientationPattern: 'L-L-P-P',
    description: 'Composição balanceada: 2 horizontais empilhadas na esquerda e 2 retratos verticais na direita.',
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
    category: '4 Fotos (2 por Página)',
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
