import React, { useRef, useState } from 'react';
import {
  User,
  Image as ImageIcon,
  Layers,
  Upload,
  Sparkles,
  Trash2,
  Check,
  ArrowRight,
  Info,
  Sliders,
  CheckCircle2,
  FileText,
  Phone,
  Mail,
  HeartHandshake,
  Copy,
  ExternalLink,
  Bot,
  Lightbulb,
  Camera,
  ShieldCheck,
} from 'lucide-react';
import { ClientData, PhotoItem, OccasionType, CoverData } from '../../types';
import { COVER_PROMPT_PRESETS, buildFormattedChatGPTMessage } from '../../constants/coverPrompts';

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
  onChangeSpreadCount: (newCount: number) => void;
  onLoadDemo: () => void;
  onNext: () => void;
  onNextAndAutoDiagram?: () => void;
}

const OCCASIONS: OccasionType[] = [
  'Casamento',
  'Família',
  'Viagem',
  '15 Anos / Debutante',
  'Ensaio Fotográfico',
  'Gestante & Bebê',
  'Aniversário & Celebrações',
  'Conquistas & Formatura',
  'Outro',
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string>(COVER_PROMPT_PRESETS[0].id);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [showPromptGuide, setShowPromptGuide] = useState(true);

  // Selected prompt definition
  const activePromptDef =
    COVER_PROMPT_PRESETS.find((p) => p.id === selectedPromptId) || COVER_PROMPT_PRESETS[0];

  // Generated prompt ready for copy
  const fullChatGPTMessage = buildFormattedChatGPTMessage(
    activePromptDef,
    clientData.albumTitle || 'Nossas Melhores Memórias',
    clientData.albumSubtitle || 'Momentos Especiais • 2026',
    clientData.name || 'Família & Memórias',
    clientData.occasion,
    clientData.notes
  );

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(fullChatGPTMessage);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleCoverFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onChangeCover({
        imageUrl: dataUrl,
        type: 'upload',
        approved: true,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = 40 - photos.length;
    if (remainingSlots <= 0) {
      alert('O limite máximo de 40 fotos para este álbum já foi atingido.');
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    const newItems: PhotoItem[] = [];

    let processedCount = 0;
    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        processedCount++;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const rawDataUrl = e.target?.result as string;
        const img = new Image();

        img.onload = () => {
          const naturalW = img.naturalWidth || 1200;
          const naturalH = img.naturalHeight || 800;

          // If image is larger than 2400px, create high-res optimized canvas dataURL to preserve memory & speed
          let finalUrl = rawDataUrl;
          let finalW = naturalW;
          let finalH = naturalH;

          const maxDimension = 2400;
          if (naturalW > maxDimension || naturalH > maxDimension) {
            const canvas = document.createElement('canvas');
            if (naturalW > naturalH) {
              finalW = maxDimension;
              finalH = Math.round((naturalH / naturalW) * maxDimension);
            } else {
              finalH = maxDimension;
              finalW = Math.round((naturalW / naturalH) * maxDimension);
            }
            canvas.width = finalW;
            canvas.height = finalH;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, finalW, finalH);
              finalUrl = canvas.toDataURL('image/jpeg', 0.92);
            }
          }

          newItems.push({
            id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            url: finalUrl,
            name: file.name,
            size: file.size,
            width: finalW,
            height: finalH,
            aspectRatio: finalW / finalH,
            createdAt: Date.now(),
          });

          processedCount++;
          if (processedCount === filesToProcess.length) {
            onAddPhotos(newItems);
          }
        };

        img.onerror = () => {
          processedCount++;
          if (processedCount === filesToProcess.length && newItems.length > 0) {
            onAddPhotos(newItems);
          }
        };

        img.src = rawDataUrl;
      };

      reader.onerror = () => {
        processedCount++;
        if (processedCount === filesToProcess.length && newItems.length > 0) {
          onAddPhotos(newItems);
        }
      };

      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const avgPhotosPerSpread = (photos.length / spreadCount).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Title & Introduction */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFE8DE] text-[#5A4638] text-xs font-semibold uppercase tracking-wider mb-3">
          <HeartHandshake className="w-3.5 h-3.5 text-[#8C5E3C]" />
          Processo 1 • Preparação do Álbum
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#2C2420]">
          Dados do Álbum, Fotos & Estrutura
        </h2>
        <p className="text-sm sm:text-base text-[#7A685B] mt-2 leading-relaxed">
          Preencha a identificação, selecione até 40 fotografias de alta qualidade e configure o
          número de lâminas (10 a 20) para dar vida às suas memórias.
        </p>
      </div>

      {/* SECTION 1: Identificação & Detalhes da Obra */}
      <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-xs space-y-8">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E8DFD5]">
          <div className="w-9 h-9 rounded-xl bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center font-serif font-bold text-sm">
            1
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2C2420]">
              Identificação & Detalhes da Obra
            </h3>
            <p className="text-xs text-[#7A685B]">
              Esses dados serão gravados na capa (15x20 cm), ficha técnica e homologação gráfica.
            </p>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Client Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A4638] mb-1.5">
              Nome do Cliente / Casal / Família *
            </label>
            <div className="relative">
              <input
                id="input-client-name"
                type="text"
                value={clientData.name}
                onChange={(e) => onChangeClientData({ name: e.target.value })}
                placeholder="Ex: Mariana & Lucas Silva"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FFFFFF] text-sm text-[#2C2420] placeholder-[#A39282] focus:outline-none focus:ring-2 focus:ring-[#8C5E3C]/30 focus:border-[#8C5E3C]"
              />
              <User className="w-4 h-4 text-[#8C5E3C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Occasion */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A4638] mb-1.5">
              Ocasião Especial
            </label>
            <select
              id="select-occasion"
              value={clientData.occasion}
              onChange={(e) => onChangeClientData({ occasion: e.target.value as OccasionType })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FFFFFF] text-sm text-[#2C2420] focus:outline-none focus:ring-2 focus:ring-[#8C5E3C]/30 focus:border-[#8C5E3C]"
            >
              {OCCASIONS.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>

          {/* Album Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A4638] mb-1.5">
              Título Gravado na Capa *
            </label>
            <input
              id="input-album-title"
              type="text"
              value={clientData.albumTitle}
              onChange={(e) => {
                const newTitle = e.target.value;
                onChangeClientData({ albumTitle: newTitle });
                onChangeCover({ title: newTitle });
              }}
              placeholder="Ex: Nossas Melhores Memórias"
              className="w-full px-4 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FFFFFF] text-sm font-serif font-semibold text-[#2C2420] placeholder-[#A39282] focus:outline-none focus:ring-2 focus:ring-[#8C5E3C]/30 focus:border-[#8C5E3C]"
            />
          </div>

          {/* Album Subtitle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A4638] mb-1.5">
              Subtítulo / Data / Ano
            </label>
            <input
              id="input-album-subtitle"
              type="text"
              value={clientData.albumSubtitle}
              onChange={(e) => {
                const newSubtitle = e.target.value;
                onChangeClientData({ albumSubtitle: newSubtitle });
                onChangeCover({ subtitle: newSubtitle });
              }}
              placeholder="Ex: Momentos Inesquecíveis • 2026"
              className="w-full px-4 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FFFFFF] text-sm font-serif text-[#2C2420] placeholder-[#A39282] focus:outline-none focus:ring-2 focus:ring-[#8C5E3C]/30 focus:border-[#8C5E3C]"
            />
          </div>

          {/* Phone (WhatsApp) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A4638] mb-1.5">
              WhatsApp para Envio do Álbum
            </label>
            <div className="relative">
              <input
                id="input-client-phone"
                type="tel"
                value={clientData.phone}
                onChange={(e) => onChangeClientData({ phone: e.target.value })}
                placeholder="(11) 98765-4321"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FFFFFF] text-sm text-[#2C2420] placeholder-[#A39282] focus:outline-none focus:ring-2 focus:ring-[#8C5E3C]/30 focus:border-[#8C5E3C]"
              />
              <Phone className="w-4 h-4 text-[#8C5E3C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A4638] mb-1.5">
              E-mail para Ficha Técnica
            </label>
            <div className="relative">
              <input
                id="input-client-email"
                type="email"
                value={clientData.email}
                onChange={(e) => onChangeClientData({ email: e.target.value })}
                placeholder="cliente@exemplo.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FFFFFF] text-sm text-[#2C2420] placeholder-[#A39282] focus:outline-none focus:ring-2 focus:ring-[#8C5E3C]/30 focus:border-[#8C5E3C]"
              />
              <Mail className="w-4 h-4 text-[#8C5E3C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Event Description & Context (Full width) */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A4638]">
                Descrição do Evento & Contexto Visual (Em Destaque no Prompt da Capa)
              </label>
              <span className="text-[11px] text-[#8C5E3C] font-medium">
                Alimenta automaticamente a IA com o contexto da celebração
              </span>
            </div>
            <textarea
              id="input-event-description"
              rows={2}
              value={clientData.notes || ''}
              onChange={(e) => onChangeClientData({ notes: e.target.value })}
              placeholder="Ex: Formatura em Medicina da Turma de 2026, baile de gala com iluminação cênica dourada e colação solene / Casamento ao pôr do sol no campo com estilo rústico chique."
              className="w-full px-4 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FFFFFF] text-sm text-[#2C2420] placeholder-[#A39282] focus:outline-none focus:ring-2 focus:ring-[#8C5E3C]/30 focus:border-[#8C5E3C] resize-none"
            />
          </div>
        </div>

        {/* SUBSECTION: UPLOAD DA FOTO DA CAPA 15x20 VERTICAL */}
        <div className="pt-6 border-t border-[#E8DFD5] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#8C5E3C]" />
                <h4 className="font-serif font-bold text-base text-[#2C2420]">
                  Foto da Capa do Álbum (15x20 cm Vertical)
                </h4>
              </div>
              <p className="text-xs text-[#7A685B] mt-0.5">
                Envie a fotografia principal para estampar a capa vertical do fotolivro.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPromptGuide(!showPromptGuide)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#EFE8DE] hover:bg-[#E5DCD0] text-xs font-semibold text-[#5A4638] border border-[#DDD3C5] transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Bot className="w-4 h-4 text-[#8C5E3C]" />
              {showPromptGuide ? 'Ocultar Dicas & Prompts GPT' : 'Ver Dicas & Prompts GPT'}
            </button>
          </div>

          {/* Upload Area & Cover Card Preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Upload Box */}
            <div className="md:col-span-7 space-y-3">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleCoverFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingCover(true);
                }}
                onDragLeave={() => setIsDraggingCover(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingCover(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleCoverFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => coverInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDraggingCover
                    ? 'border-[#8C5E3C] bg-[#F2ECE4]'
                    : cover.imageUrl
                    ? 'border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50/70'
                    : 'border-[#D9CFC4] bg-[#FFFFFF] hover:border-[#8C5E3C] hover:bg-[#FDFCFB]'
                }`}
              >
                {cover.imageUrl ? (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-emerald-800">
                      Foto da Capa Carregada com Sucesso!
                    </span>
                    <p className="text-[11px] text-[#7A685B] mt-1">
                      Clique para trocar a imagem da capa (15x20 cm vertical)
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 text-[#8C5E3C] mb-2" />
                    <span className="text-xs font-bold text-[#2C2420]">
                      Clique para selecionar ou arraste a Foto da Capa
                    </span>
                    <p className="text-[11px] text-[#7A685B] mt-1">
                      Formato Vertical 15x20 cm (2:3 ou 3:4) • JPG, PNG ou WEBP
                    </p>
                  </div>
                )}
              </div>

              {cover.imageUrl && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#7A685B] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Homologada para a Capa 15x20
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeCover({ imageUrl: undefined });
                    }}
                    className="text-xs text-rose-700 hover:text-rose-900 inline-flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover Foto da Capa
                  </button>
                </div>
              )}
            </div>

            {/* Mini Cover Preview Card (15x20 Vertical 3:4) */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="relative w-44 h-60 rounded-2xl bg-[#FFFFFF] border-4 border-[#3D2C24] shadow-xl overflow-hidden p-3 flex flex-col justify-between text-center transition-all hover:scale-[1.02]">
                <div className="absolute inset-y-0 left-0 w-2.5 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />

                {cover.imageUrl ? (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={cover.imageUrl}
                      alt="Capa do Álbum"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35" />
                  </div>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] to-[#EAE0D5] flex flex-col items-center justify-center p-3 text-[#8C7A6B]">
                    <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                    <span className="text-[10px] font-semibold text-center">Prévia 15x20 cm</span>
                  </div>
                )}

                {/* Top Badge */}
                <div className="relative z-10">
                  <span
                    className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full inline-block ${
                      cover.imageUrl
                        ? 'bg-black/40 text-white/90 backdrop-blur-xs'
                        : 'bg-[#E0D6C8] text-[#5A4638]'
                    }`}
                  >
                    15x20 cm • Vertical
                  </span>
                </div>

                {/* Bottom Title & Subtitle */}
                <div className="relative z-10 text-center">
                  <h5
                    className={`font-serif font-bold text-xs leading-tight drop-shadow-sm ${
                      cover.imageUrl ? 'text-white' : 'text-[#2C2420]'
                    }`}
                  >
                    {clientData.albumTitle || 'Nossas Melhores Memórias'}
                  </h5>
                  <p
                    className={`font-serif italic text-[9px] mt-0.5 ${
                      cover.imageUrl ? 'text-white/80' : 'text-[#7A685B]'
                    }`}
                  >
                    {clientData.albumSubtitle || 'Momentos Especiais • 2026'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-medium text-[#8C7A6B] mt-2">
                Prévia da Capa (15x20 cm Vertical)
              </span>
            </div>
          </div>

          {/* DICAS & PROMPTS COPIÁVEIS PARA O CHATGPT */}
          {showPromptGuide && (
            <div className="bg-[#FFFFFF] rounded-2xl p-5 sm:p-6 border border-[#DDD3C5] shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EFE8DE]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#EAE0D5]" />
                  </div>
                  <div>
                    <h5 className="font-serif font-bold text-sm sm:text-base text-[#2C2420]">
                      Direcionamento & Prompts para Produzir a Capa no ChatGPT (GPT-4o / DALL-E)
                    </h5>
                    <p className="text-xs text-[#7A685B]">
                      Copie o prompt estruturado com 1 clique e envie no ChatGPT junto com sua foto de referência.
                    </p>
                  </div>
                </div>

                <a
                  href="https://chatgpt.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#8C5E3C] hover:text-[#5A3E28] self-start sm:self-auto bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#DDD3C5] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir ChatGPT.com
                </a>
              </div>

              {/* 4 Steps Guide */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD5]">
                  <span className="text-[10px] font-bold font-mono text-[#8C5E3C] bg-[#EAE0D5] px-1.5 py-0.5 rounded">
                    PASSO 1
                  </span>
                  <h6 className="font-bold text-xs text-[#2C2420] mt-1.5">Escolha o Estilo</h6>
                  <p className="text-[11px] text-[#7A685B] mt-0.5 leading-tight">
                    Selecione abaixo o tema da capa (Casamento, Família, Editorial, etc.).
                  </p>
                </div>

                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD5]">
                  <span className="text-[10px] font-bold font-mono text-[#8C5E3C] bg-[#EAE0D5] px-1.5 py-0.5 rounded">
                    PASSO 2
                  </span>
                  <h6 className="font-bold text-xs text-[#2C2420] mt-1.5">Copie o Prompt</h6>
                  <p className="text-[11px] text-[#7A685B] mt-0.5 leading-tight">
                    Clique em &quot;Copiar Prompt&quot;. Os dados do seu álbum já foram embutidos!
                  </p>
                </div>

                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD5]">
                  <span className="text-[10px] font-bold font-mono text-[#8C5E3C] bg-[#EAE0D5] px-1.5 py-0.5 rounded">
                    PASSO 3
                  </span>
                  <h6 className="font-bold text-xs text-[#2C2420] mt-1.5">Cole no ChatGPT</h6>
                  <p className="text-[11px] text-[#7A685B] mt-0.5 leading-tight">
                    Abra o ChatGPT, anexe a foto principal e envie junto com o prompt copiado.
                  </p>
                </div>

                <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E8DFD5]">
                  <span className="text-[10px] font-bold font-mono text-[#8C5E3C] bg-[#EAE0D5] px-1.5 py-0.5 rounded">
                    PASSO 4
                  </span>
                  <h6 className="font-bold text-xs text-[#2C2420] mt-1.5">Faça o Upload</h6>
                  <p className="text-[11px] text-[#7A685B] mt-0.5 leading-tight">
                    Baixe a imagem vertical gerada e faça o upload no campo acima.
                  </p>
                </div>
              </div>

              {/* Preset Selector Chips */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A4638] mb-2">
                  Selecione o Estilo do Prompt Desejado:
                </label>
                <div className="flex flex-wrap gap-2">
                  {COVER_PROMPT_PRESETS.map((preset) => {
                    const isSelected = preset.id === selectedPromptId;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedPromptId(preset.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                            : 'bg-[#FAF7F2] text-[#5A4638] hover:bg-[#EFE8DE] border border-[#DDD3C5]'
                        }`}
                      >
                        {preset.title}
                        {preset.badge && (
                          <span
                            className={`ml-1.5 text-[9px] px-1.5 py-0.2 rounded-md ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-[#EAE0D5] text-[#5A4638]'
                            }`}
                          >
                            {preset.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prompt Text Box with 1-Click Copy */}
              <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#DDD3C5] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#8C5E3C]" />
                    <span className="text-xs font-bold text-[#2C2420]">
                      Prompt Formatado com os Dados do Álbum ({activePromptDef.title})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-all cursor-pointer ${
                      copiedPrompt
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[#8C5E3C] hover:bg-[#734A2E] text-white hover:scale-[1.01]'
                    }`}
                  >
                    {copiedPrompt ? (
                      <>
                        <Check className="w-4 h-4" />
                        Prompt Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar Prompt Completo
                      </>
                    )}
                  </button>
                </div>

                {/* Highlighted Project Data Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#F5EFEB] border border-[#E0D6C8] text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-[#8C5E3C] shrink-0">📌 Projeto:</span>
                    <span className="font-semibold text-[#2C2420] truncate">
                      {clientData.albumTitle || 'Nossas Melhores Memórias'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-[#8C5E3C] shrink-0">📝 Contexto:</span>
                    <span className="text-[#5A4638] truncate">
                      {clientData.notes || (clientData.occasion !== 'Outro' ? clientData.occasion : 'Memórias Especiais')}
                    </span>
                  </div>
                </div>

                <textarea
                  readOnly
                  rows={6}
                  value={fullChatGPTMessage}
                  className="w-full bg-[#FFFFFF] rounded-lg p-3 text-xs text-[#3D2C24] font-mono border border-[#E0D6C8] resize-none focus:outline-none focus:ring-1 focus:ring-[#8C5E3C]"
                />

                {/* Golden Technical Tips */}
                <div className="pt-2 border-t border-[#E8DFD5] grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-[#7A685B]">
                  <div className="flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#8C5E3C] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#2C2420]">Proporção 2:3 Vertical:</strong> Peça
                      sempre formato vertical (15x20 cm) para não cortar detalhes.
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#8C5E3C] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#2C2420]">Resolução 300 DPI:</strong> Garante que a
                      impressão saia cristalina e nítida na encadernação.
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#8C5E3C] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#2C2420]">Espaço para Gravação:</strong> Mantenha o
                      terço inferior ou superior limpo para títulos.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: Fotos (Até 40 Fotos) */}
      <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8DFD5] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center font-serif font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2C2420]">
                Fotografias Selecionadas (Até 40 fotos)
              </h3>
              <p className="text-xs text-[#7A685B]">
                Suas fotos preservam 100% da proporção e resolução original.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1 rounded-full bg-[#EAE0D5] text-[#5A4638] text-xs font-bold font-mono">
              {photos.length} / 40 fotos
            </div>
            {photos.length === 0 && (
              <button
                type="button"
                id="btn-load-sample-photos"
                onClick={onLoadDemo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EFE8DE] hover:bg-[#E5DCD0] text-xs font-semibold text-[#5A4638] border border-[#DDD3C5] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8C5E3C]" />
                Carregar Demonstração
              </button>
            )}
            {photos.length > 0 && (
              <button
                type="button"
                onClick={onClearAllPhotos}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs text-rose-700 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpar fotos
              </button>
            )}
          </div>
        </div>

        {/* Upload Dropzone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#8C5E3C] bg-[#F5EFEB] scale-[0.99]'
              : 'border-[#D9CFC4] hover:border-[#8C5E3C] bg-[#FFFFFF] hover:bg-[#FAF7F2]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="w-14 h-14 rounded-2xl bg-[#F5EFEB] text-[#8C5E3C] flex items-center justify-center mx-auto mb-3">
            <Upload className="w-7 h-7" />
          </div>

          <h4 className="font-serif font-bold text-base text-[#2C2420]">
            Arraste suas fotos aqui ou clique para selecionar
          </h4>
          <p className="text-xs text-[#7A685B] mt-1 max-w-md mx-auto">
            Envie as melhores fotografias do seu ensaio ou celebração. Formatos suportados: JPG,
            PNG, WEBP.
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE8DE] text-[11px] font-medium text-[#5A4638]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#8C5E3C]" />
            Capacidade: até 40 fotos por projeto
          </div>
        </div>

        {/* Photos Grid Preview */}
        {photos.length > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-[#7A685B]">
              <span>Fotos prontas para diagramação ({photos.length})</span>
              <span>Proporções preservadas</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 max-h-72 overflow-y-auto p-1">
              {photos.map((photo, idx) => (
                <div
                  key={photo.id}
                  className="group relative aspect-square bg-[#EFE8DE] rounded-xl overflow-hidden border border-[#DDD3C5] shadow-2xs"
                >
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 text-white text-[10px] flex items-center justify-center font-mono">
                    {idx + 1}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemovePhoto(photo.id);
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                    title="Remover foto"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1 text-[9px] text-white truncate text-center">
                    {photo.aspectRatio > 1.2 ? 'Paisagem' : photo.aspectRatio < 0.8 ? 'Retrato' : '1:1'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: Estrutura (10 a 20 Lâminas) */}
      <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E8DFD5] mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center font-serif font-bold text-sm">
            3
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2C2420]">
              Estrutura & Número de Lâminas (10 a 20 Lâminas)
            </h3>
            <p className="text-xs text-[#7A685B]">
              Formato Fechado 15x20 cm Vertical • Lâmina Aberta 20x30 cm • Abertura Flat-lay 180° • Miolo Branco Puro
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick preset chips */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {[10, 12, 14, 16, 18, 20].map((count) => {
              const isSelected = spreadCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  id={`btn-preset-spread-${count}`}
                  onClick={() => onChangeSpreadCount(count)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-[#3D2C24] text-[#FAF7F2] border-[#2C2420] shadow-xs ring-2 ring-[#8C5E3C]/20 scale-[1.02]'
                      : 'bg-[#FFFFFF] text-[#5A4638] border-[#DDD3C5] hover:bg-[#F5EFEB]'
                  }`}
                >
                  <div className="font-serif font-bold text-base sm:text-lg">{count}</div>
                  <div className="text-[10px] opacity-85">Lâminas</div>
                  <div className="text-[9px] opacity-70">({count * 2} páginas)</div>
                </button>
              );
            })}
          </div>

          {/* Interactive Range Slider */}
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#DDD3C5] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#5A4638]">
                Ajuste Fino de Lâminas
              </span>
              <span className="text-sm font-serif font-bold text-[#2C2420]">
                {spreadCount} Lâminas Duplas ({spreadCount * 2} Páginas)
              </span>
            </div>

            <input
              type="range"
              min="10"
              max="20"
              step="1"
              value={spreadCount}
              onChange={(e) => onChangeSpreadCount(Number(e.target.value))}
              className="w-full accent-[#8C5E3C] h-2 bg-[#EAE0D5] rounded-lg cursor-pointer"
            />

            <div className="flex items-center justify-between text-[11px] text-[#8C7A6B]">
              <span>10 Lâminas (Mínimo)</span>
              <span className="font-mono text-[#5A4638]">
                Média de fotos: ~{avgPhotosPerSpread} fotos / lâmina
              </span>
              <span>20 Lâminas (Máximo)</span>
            </div>

            {photos.length > 0 && (
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] flex items-center gap-2.5 text-xs text-[#685547]">
                <ShieldCheck className="w-4 h-4 text-[#8C5E3C] shrink-0" />
                <span>
                  <strong>Garantia Villa7 de Álbum Completo:</strong> Todas as lâminas geradas conterão fotografias enviadas. Nenhuma página fica vazia.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action: Next Step Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-[#E8DFD5]">
        {photos.length > 0 && onNextAndAutoDiagram && (
          <button
            type="button"
            id="btn-process1-advance-autodiagram"
            onClick={onNextAndAutoDiagram}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#8C5E3C] via-[#6F452A] to-[#3D2C24] hover:from-[#784E30] hover:to-[#2B1E18] text-[#FAF7F2] shadow-md hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer ring-2 ring-[#8C5E3C]/30"
          >
            <Sparkles className="w-4 h-4 text-[#F6ECE2] animate-pulse" />
            <span>Avançar & Auto-diagramar Álbum (Sem Cortes)</span>
          </button>
        )}

        <button
          type="button"
          id="btn-process1-advance"
          onClick={onNext}
          className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl font-semibold text-xs sm:text-sm bg-[#3D2C24] hover:bg-[#2C2420] text-[#FAF7F2] shadow-sm hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer"
        >
          <span>Avançar para Estúdio de Criação</span>
          <ArrowRight className="w-4 h-4 text-[#EAE0D5]" />
        </button>
      </div>
    </div>
  );
};
