import { AlbumProject, PhotoItem } from '../types';
import { DEFAULT_TEMPLATE_ID, SPREAD_TEMPLATES } from './templates';

const BASE_TIMESTAMP = new Date('2024-05-18T14:00:00').getTime();

export const SAMPLE_PHOTOS: PhotoItem[] = [];

export function createInitialProject(): AlbumProject {
  const spreadCount = 10;
  const spreads = Array.from({ length: spreadCount }, (_, i) => {
    const template = SPREAD_TEMPLATES[i % SPREAD_TEMPLATES.length];
    return {
      id: `spread-${i + 1}`,
      spreadNumber: i + 1,
      templateId: template.id,
      slots: template.slots.map((s, idx) => ({
        id: `slot-${i + 1}-${idx + 1}`,
        x: s.x,
        y: s.y,
        width: s.width,
        height: s.height,
        zoom: 1,
        panX: 0,
        panY: 0,
        fit: 'cover' as const,
        filter: 'none' as const,
      })),
      layoutTitle: `Lâmina ${i + 1} (Páginas ${i * 2 + 1}-${i * 2 + 2})`,
      backgroundColor: '#FAF7F2'
    };
  });

  return {
    id: 'villa7-album-' + Date.now(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    clientData: {
      name: '',
      email: '',
      phone: '',
      address: {
        cep: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
      },
      albumTitle: 'Coleção de Momentos',
      albumSubtitle: 'Memórias Inesquecíveis',
      occasion: 'Casamento',
      orderStatus: 'NOVO',
      isApproved: false,
    },
    photos: [],
    spreadCount: 10,
    spreads,
    cover: {
      type: 'minimal',
      title: 'Memórias Especiais',
      subtitle: 'Momentos Eternizados',
      yearOrDate: new Date().getFullYear().toString(),
      spineText: 'Coleção de Momentos • 2026',
      spineWidthMm: 15,
      fontStyle: 'serif',
      approved: false,
      bgColor: '#F7F3EC',
      textColor: '#211D19',
      foilColor: 'gold',
      coverPhotos: [],
      referenceImages: [],
      aiHistory: [],
    },
    currentStep: 1,
    viewMode: 'home',
  };
}
