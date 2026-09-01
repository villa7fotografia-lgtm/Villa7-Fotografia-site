import capaFotograficaImg from '../assets/images/capa_fotografica_15x20_1788260855741.jpg';
import albumAbertoImg from '../assets/images/albam_aberto_15x20_1788260875526.jpg';
import warmStudioBgImg from '../assets/images/warm_studio_bg_1788260250389.jpg';

export const IMAGE_ASSETS = {
  heroBanner: albumAbertoImg,
  capaFotografica: capaFotograficaImg,
  mockupStack: capaFotograficaImg,
  warmStudioBg: warmStudioBgImg,
};

export const STUDIO_SHOWCASE_FEATURES = [
  {
    title: 'Capa Fotográfica 15x20 cm',
    subtitle: 'Fotografia Impressa na Capa Dura',
    description: 'Sua fotografia principal impressa diretamente na capa rígida com laminação acetinada de alta proteção.',
    image: capaFotograficaImg,
    tag: 'Capa Fotográfica',
  },
  {
    title: 'Abertura 180° Panorâmica',
    subtitle: 'Lâmina Dupla 20x30 cm Aberta',
    description: 'Página dupla panorâmica sem linha de corte no centro. Visualização contínua das fotografias do evento.',
    image: albumAbertoImg,
    tag: 'Tamanho 15x20 cm',
  },
  {
    title: 'Design Editorial & Acabamento',
    subtitle: 'Diagramação Refinada Villa7',
    description: 'Páginas em papel de alta gramatura com respiro visual equilibrado e acabamento gráfico profissional.',
    image: warmStudioBgImg,
    tag: 'Impresso Villa7',
  },
];

