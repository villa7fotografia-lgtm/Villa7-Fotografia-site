export type OccasionType = 
  | 'Casamento' 
  | 'Família' 
  | 'Viagem' 
  | '15 Anos / Debutante' 
  | 'Ensaio Fotográfico' 
  | 'Gestante & Bebê' 
  | 'Aniversário & Celebrações' 
  | 'Conquistas & Formatura' 
  | 'Individual'
  | 'Eventos'
  | 'Acompanhamento'
  | 'Outro';

export type OrderStatus =
  | 'NOVO'
  | 'COMPRA_INFORMADA'
  | 'FOTOS_RECEBIDAS'
  | 'EM_CRIACAO'
  | 'EM_REVISAO'
  | 'APROVADO_PELO_CLIENTE'
  | 'AUTORIZADO_PRODUCAO'
  | 'PDF_GERADO'
  | 'PRONTO_PRODUCAO'
  | 'ENVIADO';

export interface ClientAddress {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface ClientData {
  name: string;
  email: string;
  phone: string;
  address?: ClientAddress;
  albumTitle: string;
  albumSubtitle: string;
  occasion: OccasionType;
  eventDate?: string;
  notes?: string;
  orderStatus?: OrderStatus;
  isApproved?: boolean;
  approvalDate?: string;
  clientSignature?: string;
  adminAuthorized?: boolean;
  adminAuthorizedDate?: string;
  adminToken?: string;
  mercadoLivreOrderId?: string;
  mercadoLivreBuyerName?: string;
  mercadoLivreConfirmed?: boolean;
  specialReleasePassword?: string;
  isOffMlSpecial?: boolean;
}

export type PhotoCategory =
  | 'capa'
  | 'referencia'
  | 'making_of'
  | 'cerimonia'
  | 'casal'
  | 'familia'
  | 'padrinhos'
  | 'festa'
  | 'detalhes'
  | 'geral';

export interface PhotoItem {
  id: string;
  url: string;
  name: string;
  size: number;
  width: number;
  height: number;
  aspectRatio: number; // width / height
  createdAt: number;
  timestamp?: number; // Captured or file timestamp in ms
  formattedTime?: string; // e.g. "14:35"
  formattedDate?: string; // e.g. "15/09/2024"
  chronologicalIndex?: number;
  category?: PhotoCategory;
  isCoverMain?: boolean;
  isReference?: boolean;
}

export type PhotoFitMode = 'cover' | 'contain';
export type PhotoFilterMode = 'none' | 'bw' | 'warm' | 'vintage' | 'soft';
export type PhotoOrientationType = 'portrait' | 'landscape' | 'panoramic' | 'square';

export interface SlotLayout {
  id: string;
  x: number; // percent 0 - 100
  y: number; // percent 0 - 100
  width: number; // percent 0 - 100
  height: number; // percent 0 - 100
  photoId?: string;
  zoom: number; // 1 to 3
  panX: number; // -50 to 50
  panY: number; // -50 to 50
  fit: PhotoFitMode;
  rotation?: number; // 0, 90, 180, 270
  filter?: PhotoFilterMode;
  borderRadius?: number; // px
  margin?: number; // padding inside slot
  caption?: string;
  orientation?: PhotoOrientationType;
  idealAspect?: number;
}

export interface TemplateDef {
  id: string;
  name: string;
  category: string;
  photoCount: 1 | 2 | 3 | 4;
  description: string;
  thumbnailSvg?: string;
  orientationPattern?: string;
  slots: Omit<SlotLayout, 'id' | 'photoId' | 'zoom' | 'panX' | 'panY' | 'fit'>[];
}

export interface SpreadItem {
  id: string;
  spreadNumber: number;
  templateId: string;
  slots: SlotLayout[];
  backgroundColor?: string;
  layoutTitle?: string;
  storyChapter?: string;
  timeRange?: string;
}

export type CoverType = 'chatgpt' | 'upload' | 'minimal';

export interface CoverPromptDef {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  promptText: string;
  suggestedTypography: string;
  paletteDescription: string;
  referenceArchetype?: string;
  defaultBgColor?: string;
  defaultFoilColor?: 'gold' | 'silver' | 'rose' | 'black' | 'white';
  suggestedTitleExample?: string;
  suggestedSubtitleExample?: string;
}

export interface CoverAiHistoryItem {
  id: string;
  url?: string;
  prompt: string;
  artDirection?: string;
  createdAt: string;
  suggestedTitle?: string;
  suggestedSubtitle?: string;
  recommendedBgColor?: string;
  recommendedTextColor?: string;
  recommendedFoilColor?: string;
}

export interface CoverData {
  type: CoverType;
  imageUrl?: string;
  title: string;
  subtitle: string;
  yearOrDate: string;
  spineText?: string;
  spineWidthMm?: number; // 10 to 25 mm (default 15mm)
  selectedPromptId?: string;
  generatedPromptUsed?: string;
  aiPrompt?: string;
  aiHistory?: CoverAiHistoryItem[];
  referenceImages?: string[];
  coverPhotos?: PhotoItem[];
  photoZoom?: number;
  photoPanX?: number;
  photoPanY?: number;
  fontStyle?: 'serif' | 'display' | 'minimal';
  approved: boolean;
  approvalDate?: string;
  bgColor?: string;
  textColor?: string;
  foilColor?: 'gold' | 'silver' | 'rose' | 'black' | 'white';
}

export interface AlbumProject {
  id: string;
  createdAt: string;
  updatedAt: string;
  clientData: ClientData;
  photos: PhotoItem[];
  spreadCount: number; // Padrão 10 lâminas (20 páginas)
  spreads: SpreadItem[];
  cover: CoverData;
  currentStep: number; // 1: Suas Fotos, 2: Seu Álbum, 3: Veja Como Ficou, 4: Tudo Pronto
  viewMode?: 'home' | 'app' | 'admin';
  pdfDriveUrl?: string;
  driveFolderId?: string;
  driveUploadStatus?: 'idle' | 'uploading' | 'success' | 'error';
  generatedPdfs?: {
    capaPdfUrl?: string;
    mioloPdfUrl?: string;
    albumFinalPdfUrl?: string;
    timestamp?: string;
    fileName?: string;
  };
}
