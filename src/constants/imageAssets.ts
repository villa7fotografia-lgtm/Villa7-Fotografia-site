import catalogoTodosOsMomentos from '../assets/images/catalogo_todos_os_momentos.png';
import userShowcase01 from '../assets/images/user_showcase_01.png';
import userShowcase02 from '../assets/images/user_showcase_02.png';
import userShowcase03 from '../assets/images/user_showcase_03.png';
import capaEricaMoisesImg from '../assets/images/capa_erica_moises_1788274798993.jpg';
import capaMarceloVitoriaImg from '../assets/images/capa_marcelo_vitoria_1788274818263.jpg';
import albumAbertoSpreadImg from '../assets/images/album_aberto_spread_1788274846344.jpg';

export const IMAGE_ASSETS = {
  catalogoMaster: catalogoTodosOsMomentos,
  heroBanner: catalogoTodosOsMomentos,
  capaFotografica: userShowcase01,
  mockupStack: userShowcase02,
  albumAberto: userShowcase03,
  capaEricaMoises: userShowcase01,
  capaMarceloVitoria: userShowcase02,
};

export interface CollectibleMoment {
  id: string;
  theme: string;
  titleExample: string;
  subtitleExample: string;
  category: string;
  description: string;
  decorativeTip: string;
}

export const COLLECTIBLE_ALBUM_MOMENTS: CollectibleMoment[] = [
  {
    id: 'casamento',
    theme: 'Casamento',
    titleExample: 'Érica e Moises',
    subtitleExample: 'Memórias de um dia inesquecível',
    category: 'Casamento',
    description: 'O início de uma nova família registrado com estética editorial e elegância atemporal.',
    decorativeTip: 'Destaque clássico para mesa de centro ou aparador da sala de estar.',
  },
  {
    id: 'ensaio',
    theme: 'Ensaio',
    titleExample: 'Seu Melhor Momento',
    subtitleExample: 'Retratos e ensaios fotográficos',
    category: 'Ensaio Fotográfico',
    description: 'Sessões externas, estúdio, casal ou gestante valorizando a essência e a luz natural.',
    decorativeTip: 'Perfeito em estantes de leitura com iluminação suave.',
  },
  {
    id: 'eventos',
    theme: 'Eventos',
    titleExample: 'Meus 15 Anos',
    subtitleExample: 'Um dia para lembrar',
    category: '15 Anos / Debutante',
    description: 'Debutantes, bodas, aniversários marcantes e comemorações que merecem ser eternizadas.',
    decorativeTip: 'Peça nobre para guardar recordações e exibir em encontros de amigos.',
  },
  {
    id: 'acompanhamento',
    theme: 'Acompanhamento',
    titleExample: 'Primeiros Momentos',
    subtitleExample: 'Mês a mês e crescimento',
    category: 'Gestante & Bebê',
    description: 'A doçura dos primeiros dias, mesversários e os pequenos passos que passam tão rápido.',
    decorativeTip: 'Harmoniza com a decoração do quarto do bebê e prateleiras afetivas.',
  },
  {
    id: 'individual',
    theme: 'Individual',
    titleExample: 'Minha História',
    subtitleExample: 'Meu caminho, minhas conquistas',
    category: 'Outro',
    description: 'Autoestima, conquistas de carreira, viagens solo ou marcos de uma trajetória pessoal.',
    decorativeTip: 'Elemento de estilo em escritórios, estúdios ou aparadores pessoais.',
  },
  {
    id: 'formatura',
    theme: 'Formatura',
    titleExample: 'Formatura',
    subtitleExample: 'Uma nova jornada',
    category: 'Conquistas & Formatura',
    description: 'A consagração de anos de estudo e dedicação celebrada em família e entre amigos.',
    decorativeTip: 'Símbolo de vitória para expor no consultório ou estante principal.',
  },
  {
    id: 'familia',
    theme: 'Família',
    titleExample: 'Nossa Maior História',
    subtitleExample: 'Gerações reunidas com amor',
    category: 'Família',
    description: 'Almoços de domingo, férias inesquecíveis, avós e netos reunidos na mesma narrativa.',
    decorativeTip: 'O coração da casa: álbum para folhear junto a quem amamos.',
  },
];

export const STUDIO_SHOWCASE_FEATURES = [
  {
    title: 'Capa Fotográfica Personalizada',
    subtitle: 'Capa Dura 15x20 cm Vertical',
    description: 'Fotografia impressa diretamente na capa rígida com laminação acetinada, lombada customizada e selo Villa7.',
    image: userShowcase01,
    fallbackImage: capaEricaMoisesImg,
    tag: 'Capa Personalizada',
  },
  {
    title: 'Acabamento Editorial de Luxo',
    subtitle: 'Qualidade Profissional Fine Art',
    description: 'Estética fotográfica refinada com tipografia elegante, respiro visual e proteção anti-risco de alta durabilidade.',
    image: userShowcase02,
    fallbackImage: capaMarceloVitoriaImg,
    tag: 'Design Villa7',
  },
  {
    title: 'Abertura Panorâmica 20x30 cm',
    subtitle: 'Lâmina Dupla 180° Plana',
    description: 'Visualização contínua de página dupla sem vincos ou cortes centrais, papel de alta gramatura e nitidez impecável.',
    image: userShowcase03,
    fallbackImage: albumAbertoSpreadImg,
    tag: 'Aberto 20x30 cm',
  },
];export const MERCADO_LIVRE_PRODUCT_URL =
  'https://www.mercadolivre.com.br/up/MLBU5055878877?matt_tool=38524122&pdp_filters=item_id:MLB7574587310&ua=5kWE1SnyI283SosumTBvVBif2x1AH4S2zDxavh7F5v4orPc#origin=share&sid=share&wid=MLB7574587310&action=copy';

