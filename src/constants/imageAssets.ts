import capaEricaMoisesImg from '../assets/images/capa_erica_moises_1788274798993.jpg';
import capaMarceloVitoriaImg from '../assets/images/capa_marcelo_vitoria_1788274818263.jpg';
import albumAbertoSpreadImg from '../assets/images/album_aberto_spread_1788274846344.jpg';

// User provided showcase images (direct high-res CDN links from imgbb)
const photo01Url = 'https://i.ibb.co/BKHD39Xr/Chat-GPT-Image-2-de-set-de-2026-08-47-47-1.png';
const photo02Url = 'https://i.ibb.co/2YCbmQY7/Chat-GPT-Image-2-de-set-de-2026-08-47-47-2.png';
const photo03Url = 'https://i.ibb.co/rKVN01t8/Chat-GPT-Image-2-de-set-de-2026-08-47-07.png';

export const IMAGE_ASSETS = {
  heroBanner: photo03Url,
  capaFotografica: photo01Url,
  mockupStack: photo02Url,
  albumAberto: photo03Url,
  capaEricaMoises: photo01Url,
  capaMarceloVitoria: photo02Url,
};

export const STUDIO_SHOWCASE_FEATURES = [
  {
    title: 'Capa Fotográfica Personalizada',
    subtitle: 'Capa Dura 15x20 cm Vertical',
    description: 'Fotografia impressa diretamente na capa rígida com laminação acetinada, lombada customizada e selo Villa7.',
    image: photo01Url,
    fallbackImage: capaEricaMoisesImg,
    tag: 'Capa Personalizada',
  },
  {
    title: 'Acabamento Editorial de Luxo',
    subtitle: 'Qualidade Profissional Fine Art',
    description: 'Estética fotográfica refinada com tipografia elegante, respiro visual e proteção anti-risco de alta durabilidade.',
    image: photo02Url,
    fallbackImage: capaMarceloVitoriaImg,
    tag: 'Design Villa7',
  },
  {
    title: 'Abertura Panorâmica 20x30 cm',
    subtitle: 'Lâmina Dupla 180° Plana',
    description: 'Visualização contínua de página dupla sem vincos ou cortes centrais, papel de alta gramatura e nitidez impecável.',
    image: photo03Url,
    fallbackImage: albumAbertoSpreadImg,
    tag: 'Aberto 20x30 cm',
  },
];


