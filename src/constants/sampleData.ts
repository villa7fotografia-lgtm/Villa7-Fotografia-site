import { AlbumProject, PhotoItem } from '../types';
import { DEFAULT_TEMPLATE_ID, SPREAD_TEMPLATES } from './templates';

export const SAMPLE_PHOTOS: PhotoItem[] = [
  {
    id: 'sample-1',
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    name: 'Casamento_Momento_Ouro.jpg',
    size: 2400000,
    width: 1200,
    height: 800,
    aspectRatio: 1.5,
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'sample-2',
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    name: 'Abraço_Família_Jardim.jpg',
    size: 3100000,
    width: 800,
    height: 1200,
    aspectRatio: 0.667,
    createdAt: Date.now() - 3600000 * 4,
  },
  {
    id: 'sample-3',
    url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&q=80',
    name: 'Pôr_do_Sol_Viagem.jpg',
    size: 1900000,
    width: 1200,
    height: 800,
    aspectRatio: 1.5,
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'sample-4',
    url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
    name: 'Detalhes_Flores_Mesa.jpg',
    size: 2800000,
    width: 800,
    height: 1200,
    aspectRatio: 0.667,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'sample-5',
    url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    name: 'Sorriso_Espontaneo.jpg',
    size: 2100000,
    width: 800,
    height: 1200,
    aspectRatio: 0.667,
    createdAt: Date.now() - 3600000 * 1,
  },
  {
    id: 'sample-6',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
    name: 'Paisagem_Horizontes.jpg',
    size: 3400000,
    width: 1200,
    height: 800,
    aspectRatio: 1.5,
    createdAt: Date.now() - 3600000 * 0.8,
  },
  {
    id: 'sample-7',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    name: 'Retrato_Afetuoso.jpg',
    size: 2200000,
    width: 800,
    height: 1200,
    aspectRatio: 0.667,
    createdAt: Date.now() - 3600000 * 0.5,
  },
  {
    id: 'sample-8',
    url: 'https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?auto=format&fit=crop&w=1200&q=80',
    name: 'Amigos_Celebracao.jpg',
    size: 2700000,
    width: 1200,
    height: 800,
    aspectRatio: 1.5,
    createdAt: Date.now() - 3600000 * 0.2,
  }
];

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
      albumTitle: 'Coleção de Momentos',
      albumSubtitle: 'Memórias Inesquecíveis',
      occasion: 'Família',
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
      approved: false,
      bgColor: '#F5EFEB',
      textColor: '#3D2C24',
      foilColor: 'gold',
    },
    currentStep: 1,
  };
}
