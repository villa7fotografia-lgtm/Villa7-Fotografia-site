export type OccasionType = 
  | 'Casamento' 
  | 'Família' 
  | 'Viagem' 
  | '15 Anos / Debutante' 
  | 'Ensaio Fotográfico' 
  | 'Gestante & Bebê' 
  | 'Aniversário & Celebrações' 
  | 'Conquistas & Formatura' 
  | 'Outro';

export interface ClientData {
  name: string;
  email: string;
  phone: string;
  albumTitle: string;
  albumSubtitle: string;
  occasion: OccasionType;
  notes?: string;
  isApproved?: boolean;
  approvalDate?: string;
  clientSignature?: string;
}

export interface PhotoItem {
  id: string;
  url: string;
  name: string;
  size: number;
  width: number;
  height: number;
  aspectRatio: number; // width / height
  createdAt: number;
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
}

export interface CoverData {
  type: CoverType;
  imageUrl?: string;
  title: string;
  subtitle: string;
  yearOrDate: string;
  spineText?: string;
  selectedPromptId?: string;
  generatedPromptUsed?: string;
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
  spreadCount: number; // 10 to 20
  spreads: SpreadItem[];
  cover: CoverData;
  currentStep: number; // 1 to 3 (1: Preparação, 2: Estúdio de Criação, 3: Revisão & Produção)
  pdfDriveUrl?: string;
  driveFolderId?: string;
  driveUploadStatus?: 'idle' | 'uploading' | 'success' | 'error';
}
