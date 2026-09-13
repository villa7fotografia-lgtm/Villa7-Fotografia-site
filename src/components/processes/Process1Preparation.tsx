import React, { useRef, useState } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Trash2,
  Check,
  ArrowRight,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Layers,
  Heart,
  Image as ImageIcon,
  CheckCircle2,
  Star,
  ShoppingBag,
  ExternalLink,
  Search,
} from 'lucide-react';
import { ClientData, PhotoItem, OccasionType, CoverData, PhotoCategory } from '../../types';
import { MERCADO_LIVRE_PRODUCT_URL } from '../../constants/imageAssets';
import { StudioHeroShowcase } from '../StudioHeroShowcase';

interface Process1Props {
  clientData: ClientData;
  photos: PhotoItem[];
  spreadCount: number;
  cover: CoverData;
  onChangeClientData: (updated: Partial<ClientData>) => void;
  onChangeCover: (updated: Partial<CoverData>) => void;
  onAddPhotos: (newPhotos: PhotoItem[]) => void;
  onRemovePhoto: (photoId: string) => void;
  onClearAllPhotos: () => void;
  onReorderPhotos?: (reorderedPhotos: PhotoItem[]) => void;
  onChangeSpreadCount: (newCount: number) => void;
  onLoadDemo: () => void;
  onNext: () => void;
  onNextAndAutoDiagram?: () => void;
}

const OCCASIONS: OccasionType[] = [
  'Casamento',
  'Família',
  'Ensaio Fotográfico',
  'Eventos',
  'Conquistas & Formatura',
  'Acompanhamento',
  'Individual',
  'Viagem',
  '15 Anos / Debutante',
  'Gestante & Bebê',
  'Aniversário & Celebrações',
  'Outro',
];

const PHOTO_CATEGORIES: Array<{ id: PhotoCategory; label: string }> = [
  { id: 'geral', label: 'Todas' },
  { id: 'making_of', label: 'Making of' },
  { id: 'cerimonia', label: 'Cerimônia' },
  { id: 'casal', label: 'Casal' },
  { id: 'familia', label: 'Família' },
  { id: 'padrinhos', label: 'Padrinhos' },
  { id: 'festa', label: 'Festa' },
  { id: 'detalhes', label: 'Detalhes' },
];

export const Process1Preparation: React.FC<Process1Props> = ({
  clientData,
  photos,
  spreadCount,
  cover,
  onChangeClientData,
  onChangeCover,
  onAddPhotos,
  onRemovePhoto,
  onClearAllPhotos,
  onChangeSpreadCount,
  onLoadDemo,
  onNext,
  onNextAndAutoDiagram,
}) => {
  const albumFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const refFileInputRef = useRef<HTMLInputElement>(null);

  const [isDraggingAlbum, setIsDraggingAlbum] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [isDraggingRef, setIsDraggingRef] = useState(false);
  const [isSearchingCep, setIsSearchingCep] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<PhotoCategory>('geral');
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  // Address defaults
  const address = clientData.address || {
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  };

  const coverPhotos = cover.coverPhotos || [];
  const referenceImages = cover.referenceImages || [];

  // CEP Automatic Lookup
  const handleCepBlur = async () => {
    const rawCep = address.cep.replace(/\D/g, '');
    if (rawCep.length === 8) {
      setIsSearchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          onChangeClientData({
            address: {
              ...address,
              street: data.logradouro || address.street,
              neighborhood: data.bairro || address.neighborhood,
              city: data.localidade || address.city,
              state: data.uf || address.state,
            },
          });
        }
      } catch (err) {
        console.warn('Erro ao consultar CEP:', err);
      } finally {
        setIsSearchingCep(false);
      }
    }
  };

  // Helper: Create lightweight thumbnail for fast browser performance
  const createOptimizedThumbnail = (file: File): Promise<{ url: string; width: number; height: number }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            resolve({
              url: canvas.toDataURL('image/jpeg', 0.85),
              width: img.width,
              height: img.height,
            });
            return;
          }
          resolve({ url: e.target?.result as string, width: img.width, height: img.height });
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // CAIXA 1: Cover Photos Upload
  const handleCoverFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files).filter((f) => f.type.startsWith('image/'));

    const newCoverPhotos: PhotoItem[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const opt = await createOptimizedThumbnail(file);
      const photoItem: PhotoItem = {
        id: `cover-photo-${Date.now()}-${i}`,
        url: opt.url,
        name: file.name,
        size: file.size,
        width: opt.width,
        height: opt.height,
        aspectRatio: opt.width / opt.height,
        createdAt: Date.now(),
        category: 'capa',
        isCoverMain: coverPhotos.length === 0 && i === 0,
      };
      newCoverPhotos.push(photoItem);
    }

    const updatedCoverPhotos = [...coverPhotos, ...newCoverPhotos];
    const mainPhoto = updatedCoverPhotos.find((p) => p.isCoverMain) || updatedCoverPhotos[0];

    onChangeCover({
      coverPhotos: updatedCoverPhotos,
      imageUrl: mainPhoto ? mainPhoto.url : cover.imageUrl,
    });
  };

  const handleSetMainCoverPhoto = (photo: PhotoItem) => {
    const updated = coverPhotos.map((p) => ({
      ...p,
      isCoverMain: p.id === photo.id,
    }));
    onChangeCover({
      coverPhotos: updated,
      imageUrl: photo.url,
    });
  };

  const handleRemoveCoverPhoto = (photoId: string) => {
    const updated = coverPhotos.filter((p) => p.id !== photoId);
    const mainPhoto = updated.find((p) => p.isCoverMain) || updated[0];
    onChangeCover({
      coverPhotos: updated,
      imageUrl: mainPhoto ? mainPhoto.url : undefined,
    });
  };

  // CAIXA 2: Reference Images Upload
  const handleReferenceFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files).filter((f) => f.type.startsWith('image/'));

    const newRefs: string[] = [];
    for (const file of fileList) {
      const opt = await createOptimizedThumbnail(file);
      newRefs.push(opt.url);
    }

    onChangeCover({
      referenceImages: [...referenceImages, ...newRefs],
    });
  };

  const handleRemoveReferenceImage = (idx: number) => {
    const updated = referenceImages.filter((_, i) => i !== idx);
    onChangeCover({ referenceImages: updated });
  };

  // CAIXA 3: Album Spreads Photos Upload
  const handleAlbumFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileList = Array.from(files).filter((f) => f.type.startsWith('image/'));

    const newItems: PhotoItem[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const opt = await createOptimizedThumbnail(file);
      const photoItem: PhotoItem = {
        id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
        url: opt.url,
        name: file.name,
        size: file.size,
        width: opt.width,
        height: opt.height,
        aspectRatio: opt.width / opt.height,
        createdAt: Date.now() + i,
        category: 'geral',
      };
      newItems.push(photoItem);
    }

    onAddPhotos(newItems);
  };

  const filteredPhotos =
    selectedCategoryFilter === 'geral'
      ? photos
      : photos.filter((p) => p.category === selectedCategoryFilter);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
      {/* SHOWCASE HERO BANNER */}
      <StudioHeroShowcase
        onSelectOccasion={(occ) => onChangeClientData({ occasion: occ })}
      />

      {/* SECTION HEADER */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#B39770]">
          Passo 1 • Preparação
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#211D19]">
          Agora vamos escolher suas fotos.
        </h2>
        <p className="text-sm sm:text-base text-[#6B5749]">
          Separe suas imagens para organizarmos tudo com carinho.
        </p>
      </div>

      {/* 1. DADOS DO CLIENTE & ENTREGA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDD3C5] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8DFD5] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#DDD3C5] flex items-center justify-center text-[#B39770]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#211D19]">
                Identificação e Endereço de Envio
              </h3>
              <p className="text-xs text-[#7A685B]">
                Dados necessários para a gravação na lombada e remessa física do álbum
              </p>
            </div>
          </div>

          <span className="text-[11px] font-medium text-[#8C7A6B]">
            ✓ Salvo automaticamente
          </span>
        </div>

        {/* Client Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Nome Completo */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3D2C24]">Seu Nome Completo *</label>
            <input
              type="text"
              value={clientData.name}
              onChange={(e) => onChangeClientData({ name: e.target.value })}
              placeholder="Ex: Mariana & Lucas Silva"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs sm:text-sm text-[#211D19] focus:ring-2 focus:ring-[#B39770]"
            />
          </div>

          {/* WhatsApp */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3D2C24]">WhatsApp com DDD *</label>
            <input
              type="tel"
              value={clientData.phone}
              onChange={(e) => onChangeClientData({ phone: e.target.value })}
              placeholder="(11) 99999-9999"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs sm:text-sm text-[#211D19] focus:ring-2 focus:ring-[#B39770]"
            />
          </div>

          {/* E-mail */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3D2C24]">E-mail para Acompanhamento *</label>
            <input
              type="email"
              value={clientData.email}
              onChange={(e) => onChangeClientData({ email: e.target.value })}
              placeholder="seuemail@exemplo.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs sm:text-sm text-[#211D19] focus:ring-2 focus:ring-[#B39770]"
            />
          </div>

          {/* Título do Álbum */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3D2C24]">Título Principal do Álbum *</label>
            <input
              type="text"
              value={clientData.albumTitle}
              onChange={(e) => {
                onChangeClientData({ albumTitle: e.target.value });
                onChangeCover({ title: e.target.value, spineText: `${e.target.value} • 2026` });
              }}
              placeholder="Ex: Nossas Memórias Inesquecíveis"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs sm:text-sm text-[#211D19] focus:ring-2 focus:ring-[#B39770]"
            />
          </div>

          {/* Subtítulo */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3D2C24]">Subtítulo ou Nomes</label>
            <input
              type="text"
              value={clientData.albumSubtitle}
              onChange={(e) => {
                onChangeClientData({ albumSubtitle: e.target.value });
                onChangeCover({ subtitle: e.target.value });
              }}
              placeholder="Ex: Mariana & Lucas"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs sm:text-sm text-[#211D19] focus:ring-2 focus:ring-[#B39770]"
            />
          </div>

          {/* Ocasião */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3D2C24]">Tipo de Evento</label>
            <select
              value={clientData.occasion}
              onChange={(e) => onChangeClientData({ occasion: e.target.value as OccasionType })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs sm:text-sm text-[#211D19] focus:ring-2 focus:ring-[#B39770]"
            >
              {OCCASIONS.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>

          {/* Data do Evento */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3D2C24]">Data da Celebração</label>
            <input
              type="text"
              value={clientData.eventDate || ''}
              onChange={(e) => onChangeClientData({ eventDate: e.target.value })}
              placeholder="Ex: 18 de Maio de 2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs sm:text-sm text-[#211D19] focus:ring-2 focus:ring-[#B39770]"
            />
          </div>

          {/* Quantidade de Lâminas */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#3D2C24]">Quantidade de Lâminas</label>
            <select
              value={spreadCount}
              onChange={(e) => onChangeSpreadCount(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs sm:text-sm text-[#211D19] focus:ring-2 focus:ring-[#B39770]"
            >
              <option value={10}>10 Lâminas (20 páginas - Padrão Colecionável)</option>
              <option value={12}>12 Lâminas (24 páginas)</option>
              <option value={15}>15 Lâminas (30 páginas)</option>
              <option value={20}>20 Lâminas (40 páginas)</option>
            </select>
          </div>

          {/* Código Mercado Livre */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#2D3277] flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-[#2D3277]" />
              Código da Compra Mercado Livre (Opcional)
            </label>
            <input
              type="text"
              value={clientData.mercadoLivreOrderId || ''}
              onChange={(e) => onChangeClientData({ mercadoLivreOrderId: e.target.value })}
              placeholder="Ex: #200000847291"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs sm:text-sm text-[#211D19] focus:ring-2 focus:ring-[#B39770]"
            />
          </div>
        </div>

        {/* Endereço de Envio */}
        <div className="pt-4 border-t border-[#E8DFD5] space-y-3">
          <span className="text-xs font-bold text-[#7A685B] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#B39770]" />
            Endereço de Entrega
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {/* CEP */}
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-[#3D2C24]">CEP</label>
              <div className="relative">
                <input
                  type="text"
                  value={address.cep}
                  onChange={(e) =>
                    onChangeClientData({
                      address: { ...address, cep: e.target.value },
                    })
                  }
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs text-[#211D19] focus:ring-2 focus:ring-[#B39770]"
                />
                {isSearchingCep && (
                  <span className="absolute right-2.5 top-2 text-[10px] text-[#B39770] animate-pulse">
                    Buscando...
                  </span>
                )}
              </div>
            </div>

            {/* Rua */}
            <div className="col-span-2 sm:col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-[#3D2C24]">Rua / Logradouro</label>
              <input
                type="text"
                value={address.street}
                onChange={(e) =>
                  onChangeClientData({
                    address: { ...address, street: e.target.value },
                  })
                }
                placeholder="Nome da rua ou avenida"
                className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs text-[#211D19]"
              />
            </div>

            {/* Número */}
            <div className="col-span-1 space-y-1">
              <label className="text-[11px] font-bold text-[#3D2C24]">Número</label>
              <input
                type="text"
                value={address.number}
                onChange={(e) =>
                  onChangeClientData({
                    address: { ...address, number: e.target.value },
                  })
                }
                placeholder="123"
                className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs text-[#211D19]"
              />
            </div>

            {/* Complemento */}
            <div className="col-span-1 sm:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-[#3D2C24]">Complemento</label>
              <input
                type="text"
                value={address.complement || ''}
                onChange={(e) =>
                  onChangeClientData({
                    address: { ...address, complement: e.target.value },
                  })
                }
                placeholder="Apto 42, Bloco B"
                className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs text-[#211D19]"
              />
            </div>

            {/* Bairro */}
            <div className="col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-[#3D2C24]">Bairro</label>
              <input
                type="text"
                value={address.neighborhood}
                onChange={(e) =>
                  onChangeClientData({
                    address: { ...address, neighborhood: e.target.value },
                  })
                }
                placeholder="Bairro"
                className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs text-[#211D19]"
              />
            </div>

            {/* Cidade */}
            <div className="col-span-1 space-y-1">
              <label className="text-[11px] font-bold text-[#3D2C24]">Cidade</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) =>
                  onChangeClientData({
                    address: { ...address, city: e.target.value },
                  })
                }
                placeholder="Cidade"
                className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs text-[#211D19]"
              />
            </div>

            {/* Estado */}
            <div className="col-span-1 space-y-1">
              <label className="text-[11px] font-bold text-[#3D2C24]">UF</label>
              <input
                type="text"
                value={address.state}
                onChange={(e) =>
                  onChangeClientData({
                    address: { ...address, state: e.target.value.toUpperCase() },
                  })
                }
                placeholder="SP"
                maxLength={2}
                className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs text-[#211D19]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. AS 3 CAIXAS DE UPLOAD */}
      <div className="space-y-6">
        {/* ========================================================= */}
        {/* CAIXA 1: FOTOS PARA A CAPA                                */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDD3C5] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFD5] pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B39770]">
                Caixa 1
              </span>
              <h3 className="font-serif text-lg font-bold text-[#211D19]">
                Fotos para a Capa
              </h3>
              <p className="text-xs text-[#7A685B]">
                Envie as fotos mais marcantes. Você poderá escolher uma como principal para a capa e lombada.
              </p>
            </div>

            <button
              type="button"
              onClick={() => coverFileInputRef.current?.click()}
              className="px-4 py-2 bg-[#3D2C24] hover:bg-[#211D19] text-[#FAF7F2] text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#B39770]" />
              <span>Adicionar Fotos da Capa</span>
            </button>
            <input
              ref={coverFileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleCoverFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingCover(true);
            }}
            onDragLeave={() => setIsDraggingCover(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingCover(false);
              handleCoverFiles(e.dataTransfer.files);
            }}
            onClick={() => coverFileInputRef.current?.click()}
            className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
              isDraggingCover
                ? 'border-[#B39770] bg-[#FAF7F2]'
                : 'border-[#DDD3C5] hover:border-[#B39770] bg-[#FAF7F2]/50'
            }`}
          >
            <Camera className="w-8 h-8 text-[#B39770] mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#211D19]">
              Arraste aqui as fotos para a capa ou clique para selecionar
            </p>
            <p className="text-[11px] text-[#8C7A6B] mt-0.5">
              JPG, PNG ou WEBP em alta resolução
            </p>
          </div>

          {/* Cover Photos Thumbnails with 'Usar como principal' and 'Remover' */}
          {coverPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
              {coverPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className={`group relative rounded-2xl overflow-hidden border p-1 bg-white transition-all shadow-2xs ${
                    photo.isCoverMain
                      ? 'border-[#B39770] ring-2 ring-[#B39770]/30'
                      : 'border-[#DDD3C5]'
                  }`}
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#FAF7F2] relative">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover"
                    />

                    {photo.isCoverMain && (
                      <span className="absolute top-1.5 left-1.5 bg-[#3D2C24] text-[#FAF7F2] text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Star className="w-2.5 h-2.5 text-[#B39770] fill-[#B39770]" /> Principal
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCoverPhoto(photo.id);
                      }}
                      className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white hover:bg-rose-600 transition-colors"
                      title="Remover foto da capa"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="p-1 text-center">
                    {!photo.isCoverMain ? (
                      <button
                        type="button"
                        onClick={() => handleSetMainCoverPhoto(photo)}
                        className="w-full py-1 text-[10px] font-semibold text-[#8C5E3C] hover:text-[#3D2C24] hover:bg-[#FAF7F2] rounded-md transition-colors"
                      >
                        Usar como principal
                      </button>
                    ) : (
                      <span className="text-[10px] font-bold text-[#B39770]">Capa Selecionada</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* CAIXA 2: REFERÊNCIAS DE CAPA                              */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDD3C5] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFD5] pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#B39770]">
                Caixa 2
              </span>
              <h3 className="font-serif text-lg font-bold text-[#211D19]">
                Referências de Capa
              </h3>
              <p className="text-xs text-[#7A685B]">
                Envie exemplos, prints, layouts ou capas anteriores que você goste para inspirar a IA de criação.
              </p>
            </div>

            <button
              type="button"
              onClick={() => refFileInputRef.current?.click()}
              className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EFE8DE] text-[#3D2C24] text-xs font-semibold rounded-xl border border-[#DDD3C5] transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#B39770]" />
              <span>Enviar Referências</span>
            </button>
            <input
              ref={refFileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleReferenceFiles(e.target.files)}
              className="hidden"
            />
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingRef(true);
            }}
            onDragLeave={() => setIsDraggingRef(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingRef(false);
              handleReferenceFiles(e.dataTransfer.files);
            }}
            onClick={() => refFileInputRef.current?.click()}
            className={`p-5 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
              isDraggingRef
                ? 'border-[#B39770] bg-[#FAF7F2]'
                : 'border-[#DDD3C5] hover:border-[#B39770] bg-[#FAF7F2]/50'
            }`}
          >
            <Sparkles className="w-7 h-7 text-[#B39770] mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-[#211D19]">
              Arraste prints ou exemplos de capas que você admira
            </p>
            <p className="text-[11px] text-[#8C7A6B]">
              A IA utilizará essas imagens apenas como linguagem de design e paleta
            </p>
          </div>

          {/* Reference Thumbnails */}
          {referenceImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-2">
              {referenceImages.map((refUrl, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-[#DDD3C5] bg-[#FAF7F2]"
                >
                  <img src={refUrl} alt={`Referência ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveReferenceImage(idx)}
                    className="absolute top-1 right-1 p-1 rounded-md bg-black/60 text-white hover:bg-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] px-1 rounded">
                    Ref #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* CAIXA 3: FOTOS DO ÁLBUM (MIOLO)                           */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#DDD3C5] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DFD5] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B39770]">
                  Caixa 3
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EAE1D5] text-[#5A4638]">
                  {photos.length} fotos carregadas
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#211D19] mt-0.5">
                Fotos do Miolo do Álbum
              </h3>
              <p className="text-xs text-[#7A685B]">
                Upload múltiplo para compor as lâminas. Thumbnails leves geradas no navegador para agilidade total.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => albumFileInputRef.current?.click()}
                className="px-4 py-2 bg-[#3D2C24] hover:bg-[#211D19] text-[#FAF7F2] text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#B39770]" />
                <span>Adicionar Fotos do Álbum</span>
              </button>
              <input
                ref={albumFileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleAlbumFiles(e.target.files)}
                className="hidden"
              />
            </div>
          </div>

          {/* Large Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingAlbum(true);
            }}
            onDragLeave={() => setIsDraggingAlbum(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingAlbum(false);
              handleAlbumFiles(e.dataTransfer.files);
            }}
            onClick={() => albumFileInputRef.current?.click()}
            className={`p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all ${
              isDraggingAlbum
                ? 'border-[#B39770] bg-[#FAF7F2]'
                : 'border-[#DDD3C5] hover:border-[#B39770] bg-[#FAF7F2]/40'
            }`}
          >
            <ImageIcon className="w-10 h-10 text-[#B39770] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#211D19]">
              Arraste aqui todas as fotografias do seu evento
            </p>
            <p className="text-xs text-[#8C7A6B] mt-1">
              Aceita grandes volumes de fotos simultâneas. Selecione pastas completas ou múltiplos arquivos.
            </p>
          </div>

          {/* Categories Pill Filters */}
          {photos.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8DFD5]">
              <div className="flex flex-wrap items-center gap-1.5">
                {PHOTO_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                      selectedCategoryFilter === cat.id
                        ? 'bg-[#3D2C24] text-[#FAF7F2]'
                        : 'bg-[#FAF7F2] text-[#6B5749] hover:bg-[#EFE8DE] border border-[#DDD3C5]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {confirmClearAll ? (
                <div className="flex items-center gap-1.5 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                  <span className="text-[11px] text-rose-800 font-semibold">Remover todas?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmClearAll(false);
                      onClearAllPhotos();
                    }}
                    className="px-2 py-0.5 rounded bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Sim, limpar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="px-1.5 py-0.5 rounded bg-white text-[#6B5749] text-[11px] border border-[#DDD3C5] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClearAll(true)}
                  className="text-xs text-rose-700 hover:text-rose-900 font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Limpar todas
                </button>
              )}
            </div>
          )}

          {/* Photos Grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-2.5 pt-2">
              {filteredPhotos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-[#DDD3C5] bg-[#FAF7F2] shadow-2xs"
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Touch-Friendly & Mobile-Accessible Delete Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePhoto(photo.id);
                    }}
                    className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-rose-600/90 text-white hover:bg-rose-700 active:scale-95 shadow-md flex items-center justify-center transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
                    title="Remover foto do álbum"
                    aria-label={`Remover foto #${index + 1}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded pointer-events-none">
                    #{index + 1}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 bg-white rounded-3xl border border-[#DDD3C5] shadow-xs">
        <div>
          <h4 className="font-serif text-base font-bold text-[#211D19]">
            Tudo pronto para diagramar?
          </h4>
          <p className="text-xs text-[#6B5749]">
            {photos.length > 0
              ? `${photos.length} fotos prontas para serem diagramadas no formato 15x20 cm vertical.`
              : 'Carregue suas fotos ou teste com nosso exemplo para continuar.'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {photos.length > 0 && onNextAndAutoDiagram && (
            <button
              type="button"
              onClick={onNextAndAutoDiagram}
              className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE8DE] text-[#3D2C24] font-semibold text-xs sm:text-sm transition-all border border-[#DDD3C5] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#B39770]" />
              <span>Diagramar Automaticamente</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNext}
            className="flex-1 sm:flex-none px-7 py-3 rounded-xl bg-[#3D2C24] hover:bg-[#211D19] text-[#FAF7F2] font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>AVANÇAR PARA SEU ÁLBUM</span>
            <ArrowRight className="w-4 h-4 text-[#B39770]" />
          </button>
        </div>
      </div>
    </div>
  );
};
