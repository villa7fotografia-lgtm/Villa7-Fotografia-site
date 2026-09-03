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
  ArrowLeft,
  Info,
  Sliders,
  CheckCircle2,
  FileText,
  Phone,
  Mail,
  HeartHandshake,
  Camera,
  ShieldCheck,
  Bot,
  Copy,
  ExternalLink,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Lock,
  ShoppingBag,
} from 'lucide-react';
import { ClientData, PhotoItem, OccasionType, CoverData } from '../../types';
import { StudioHeroShowcase } from '../StudioHeroShowcase';
import { extractPhotoChronologicalData, sortPhotosByStoryChronology } from '../../utils/chronologicalStoryEngine';
import { COVER_PROMPT_PRESETS, buildFormattedChatGPTMessage } from '../../constants/coverPrompts';
import { MERCADO_LIVRE_PRODUCT_URL } from '../../constants/imageAssets';

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
  onReorderPhotos,
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
  const [subStep, setSubStep] = useState<1 | 2 | 3>(1);
  const [showRawPrompt, setShowRawPrompt] = useState(false);

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

          const chronoData = extractPhotoChronologicalData(file.name, file.lastModified, processedCount);

          newItems.push({
            id: `photo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            url: finalUrl,
            name: file.name,
            size: file.size,
            width: finalW,
            height: finalH,
            aspectRatio: finalW / finalH,
            createdAt: chronoData.timestamp,
            timestamp: chronoData.timestamp,
            formattedDate: chronoData.formattedDate,
            formattedTime: chronoData.formattedTime,
            chronologicalIndex: chronoData.numericOrder,
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

  const handleSortChronologically = () => {
    const sorted = sortPhotosByStoryChronology(photos);
    if (onReorderPhotos) {
      onReorderPhotos(sorted);
    }
  };

  const avgPhotosPerSpread = (photos.length / spreadCount).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Visual Showcase Gallery & Studio Quality Standards */}
      <StudioHeroShowcase
        onSelectOccasion={(occ, title, subtitle) => {
          setSubStep(1);
          onChangeClientData({
            occasion: occ,
            ...(title && !clientData.albumTitle ? { albumTitle: title } : {}),
            ...(subtitle && !clientData.albumSubtitle ? { albumSubtitle: subtitle } : {}),
          });
          if (title && !cover.title) {
            onChangeCover({
              title,
              ...(subtitle && !cover.subtitle ? { subtitle } : {}),
            });
          }
        }}
        onScrollToForm={() => {
          setSubStep(1);
          const el = document.getElementById('secao-preparacao-projeto');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {/* Sub-step Navigation Bar - Minimalist 3 Steps */}
      <div id="secao-preparacao-projeto" className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-serif font-bold text-[#2C2420]">
            Configuração do Álbum:
          </span>
          <span className="text-xs text-[#7A685B]">
            Passo {subStep} de 3
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubStep(1)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subStep === 1
                ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                : 'bg-white text-[#5A4638] hover:bg-[#EFE8DE] border border-[#DDD3C5]'
            }`}
          >
            1. Dados do Álbum
          </button>
          <button
            type="button"
            onClick={() => setSubStep(2)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subStep === 2
                ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                : 'bg-white text-[#5A4638] hover:bg-[#EFE8DE] border border-[#DDD3C5]'
            }`}
          >
            2. Foto da Capa
          </button>
          <button
            type="button"
            onClick={() => setSubStep(3)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              subStep === 3
                ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                : 'bg-white text-[#5A4638] hover:bg-[#EFE8DE] border border-[#DDD3C5]'
            }`}
          >
            3. Fotos do Álbum ({photos.length})
          </button>
        </div>
      </div>

      {/* SUB-STEP 1: Identificação & Detalhes da Obra */}
      {subStep === 1 && (
        <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-xs space-y-8 animate-fadeIn">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E8DFD5]">
            <div className="w-8 h-8 rounded-xl bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center font-serif font-bold text-xs">
              1
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C2420]">
                Dados do Álbum
              </h3>
              <p className="text-xs text-[#7A685B]">
                Informações principais gravadas na capa e na ficha técnica.
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

            {/* Phone (Contact) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A4638] mb-1.5">
                Telefone / Celular de Contato
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
              <span className="text-[11px] text-[#7A685B] mt-1 block">
                Contato para identificação e vinculação do seu pedido no Mercado Livre.
              </span>
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

            {/* Número do Pedido no Mercado Livre */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A4638] mb-1.5 flex items-center justify-between">
                <span>Número / Código do Pedido no Mercado Livre</span>
                <span className="text-[11px] font-normal text-[#2D3277]">
                  (Obrigatório para liberação da produção gráfica)
                </span>
              </label>
              <div className="relative">
                <input
                  id="input-client-ml-order"
                  type="text"
                  value={clientData.mercadoLivreOrderId || ''}
                  onChange={(e) => onChangeClientData({ mercadoLivreOrderId: e.target.value })}
                  placeholder="Ex: #2000008594234567 (ou informe na Aprovação Final)"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FFFFFF] text-sm text-[#2C2420] placeholder-[#A39282] focus:outline-none focus:ring-2 focus:ring-[#8C5E3C]/30 focus:border-[#8C5E3C]"
                />
                <ShoppingBag className="w-4 h-4 text-[#2D3277] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <span className="text-[11px] text-[#7A685B] mt-1 block">
                Se já realizou a compra no Mercado Livre, insira o número para vincular de imediato. A produção gráfica só é iniciada com a confirmação da plataforma.
              </span>
            </div>

            {/* Notes / General Observations */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5A4638] mb-1.5">
                Observações do Projeto & Contexto do Evento (Opcional)
              </label>
              <input
                id="input-project-notes"
                type="text"
                value={clientData.notes || ''}
                onChange={(e) => onChangeClientData({ notes: e.target.value })}
                placeholder="Ex: Formatura em Medicina Turma 2026 / Baile de Gala / Casamento ao pôr do sol no campo."
                className="w-full px-4 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FFFFFF] text-sm text-[#2C2420] placeholder-[#A39282] focus:outline-none focus:ring-2 focus:ring-[#8C5E3C]/30 focus:border-[#8C5E3C]"
              />
            </div>
          </div>

          {/* Garantia Oficial Mercado Livre & Política de Compra Segura */}
          <div className="p-4 rounded-2xl bg-[#FFFDF7] border border-[#EADBBD] text-xs text-[#5A4638] space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#2D3277] text-white">
                  Mercado Livre Oficial
                </span>
                <strong className="text-[#2C2420]">Compra Segura e Entrega Garantida</strong>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={MERCADO_LIVRE_PRODUCT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FFF9E6] hover:bg-[#FFF3CC] text-[#2D3277] border border-[#FFE180] font-bold text-[11px] transition-colors shadow-2xs"
                  title="Ver anúncio oficial do produto no Mercado Livre"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-[#2D3277]" />
                  <span>Ver Produto no Mercado Livre</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            </div>
            <p className="text-[11px] text-[#7A685B] leading-relaxed">
              Toda a venda dos álbuns da Villa7 é realizada oficialmente e exclusivamente na nossa conta do Mercado Livre (Mercado Pago protegido + Mercado Envios com rastreio).
            </p>
            <div className="text-[11px] font-semibold text-[#842029] bg-rose-50/90 rounded-lg px-3 py-2 border border-rose-200/90">
              ⚠️ <strong>Importante:</strong> Não vendemos no WhatsApp, não vendemos no TikTok Shopping, não vendemos na Shopee e não vendemos no Instagram. Qualquer cobrança externa é fraudulenta.
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#E8DFD5]">
            <button
              type="button"
              onClick={() => setSubStep(2)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#3D2C24] hover:bg-[#2C2420] text-[#FAF7F2] font-bold text-sm shadow-md hover:scale-[1.01] transition-all cursor-pointer"
            >
              <span>Avançar para Foto da Capa</span>
              <ArrowRight className="w-4 h-4 text-[#EAE0D5]" />
            </button>
          </div>
        </div>
      )}

      {/* SUB-STEP 2: Foto da Capa & Assistente IA Opcional */}
      {subStep === 2 && (
        <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-xs space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DFD5]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center font-serif font-bold text-xs">
                2
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#2C2420]">
                  Foto da Capa (15x20 cm Vertical)
                </h4>
                <p className="text-xs text-[#7A685B] mt-0.5">
                  Envie a foto principal para estampar a capa dura do fotolivro.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPromptGuide(!showPromptGuide)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#EFE8DE] text-xs font-semibold text-[#5A4638] border border-[#DDD3C5] transition-all self-start sm:self-auto cursor-pointer shadow-2xs"
            >
              <Bot className="w-3.5 h-3.5 text-[#8C5E3C]" />
              <span>{showPromptGuide ? 'Ocultar Assistente IA' : 'Assistente IA para Capa (Opcional)'}</span>
              {showPromptGuide ? (
                <ChevronUp className="w-3 h-3 text-[#8C5E3C]" />
              ) : (
                <ChevronDown className="w-3 h-3 text-[#8C5E3C]" />
              )}
            </button>
          </div>

          {/* GUIA DE PROMPTS PARA O CHATGPT FREE (EXPANSÍVEL / OCULTÁVEL) */}
          {showPromptGuide && (
            <div className="bg-[#FFFFFF] rounded-2xl p-5 sm:p-6 border border-[#DDD3C5] shadow-xs space-y-5">
              {/* Header with External Link */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EFE8DE]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8C5E3C]" />
                  <span className="font-bold text-xs sm:text-sm text-[#2C2420]">
                    Como Criar sua Capa Grátis no ChatGPT (Passo a Passo)
                  </span>
                </div>

                <a
                  href="https://chatgpt.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C5E3C] hover:text-[#5A3E28] self-start sm:self-auto bg-[#FAF7F2] hover:bg-[#F2ECE4] px-3 py-1.5 rounded-xl border border-[#DDD3C5] transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Abrir ChatGPT Grátis (chatgpt.com)
                </a>
              </div>

              {/* 4 Super Simple Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DFD5]">
                  <span className="text-[10px] font-bold font-mono text-[#8C5E3C] bg-[#EAE0D5] px-2 py-0.5 rounded-md">
                    1. ESTILO
                  </span>
                  <h6 className="font-bold text-xs text-[#2C2420] mt-1.5">Escolha o Tema</h6>
                  <p className="text-[11px] text-[#7A685B] mt-0.5 leading-relaxed">
                    Selecione o estilo do evento abaixo (Formatura, Casamento, Minimalista, etc.).
                  </p>
                </div>

                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DFD5]">
                  <span className="text-[10px] font-bold font-mono text-[#8C5E3C] bg-[#EAE0D5] px-2 py-0.5 rounded-md">
                    2. COPIAR
                  </span>
                  <h6 className="font-bold text-xs text-[#2C2420] mt-1.5">Copie o Prompt</h6>
                  <p className="text-[11px] text-[#7A685B] mt-0.5 leading-relaxed">
                    Clique em &quot;Copiar Prompt&quot;. O nome do projeto e detalhes já vêm inseridos!
                  </p>
                </div>

                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DFD5]">
                  <span className="text-[10px] font-bold font-mono text-[#8C5E3C] bg-[#EAE0D5] px-2 py-0.5 rounded-md">
                    3. GPT FREE
                  </span>
                  <h6 className="font-bold text-xs text-[#2C2420] mt-1.5">Cole com a Foto</h6>
                  <p className="text-[11px] text-[#7A685B] mt-0.5 leading-relaxed">
                    No ChatGPT Free, anexe a melhor foto do formando/casal e cole o prompt.
                  </p>
                </div>

                <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8DFD5]">
                  <span className="text-[10px] font-bold font-mono text-[#8C5E3C] bg-[#EAE0D5] px-2 py-0.5 rounded-md">
                    4. UPLOAD
                  </span>
                  <h6 className="font-bold text-xs text-[#2C2420] mt-1.5">Envie a Capa</h6>
                  <p className="text-[11px] text-[#7A685B] mt-0.5 leading-relaxed">
                    Baixe a arte gerada pela IA e envie no quadro de upload da Capa abaixo.
                  </p>
                </div>
              </div>

              {/* Estilos de Prompt */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#5A4638] mb-2">
                  Selecione o Estilo Desejado para o seu Prompt:
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

              {/* Prompt Text Box & Copy Button */}
              <div className="bg-[#FAF7F2] rounded-xl p-4 border border-[#DDD3C5] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#8C5E3C]" />
                    <span className="text-xs font-bold text-[#2C2420]">
                      Prompt Pronto para Copiar ({activePromptDef.title})
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
                        Prompt Copiado com Sucesso!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copiar Prompt para ChatGPT Free
                      </>
                    )}
                  </button>
                </div>

                {/* Highlighted Project Data */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#F5EFEB] border border-[#E0D6C8] text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-bold text-[#8C5E3C] shrink-0">📌 Título do Álbum:</span>
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

                {/* Collapsible Technical Prompt Text Area */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRawPrompt(!showRawPrompt)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C5E3C] hover:text-[#5A3822] cursor-pointer py-1 transition-colors"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showRawPrompt ? 'rotate-180' : ''}`} />
                    <span>{showRawPrompt ? 'Ocultar prompt técnico completo' : 'Ver prompt técnico completo'}</span>
                  </button>

                  {showRawPrompt && (
                    <textarea
                      readOnly
                      rows={5}
                      value={fullChatGPTMessage}
                      className="w-full bg-[#FFFFFF] rounded-lg p-3 text-xs text-[#3D2C24] font-mono border border-[#E0D6C8] resize-none focus:outline-none focus:ring-1 focus:ring-[#8C5E3C] mt-2 animate-fadeIn"
                    />
                  )}
                </div>

                {/* Dicas de Ouro para GPT Free */}
                <div className="pt-2 border-t border-[#E8DFD5] grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-[#7A685B]">
                  <div className="flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#8C5E3C] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#2C2420]">Foto Vertical:</strong> Peça
                      formato vertical no ChatGPT para perfeito encaixe na encadernação.
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#8C5E3C] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#2C2420]">Foto de Referência:</strong> Anexe uma
                      foto nítida no ChatGPT para que a IA preserve o formando ou casal.
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-[#8C5E3C] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#2C2420]">Sem Logos Estranhos:</strong> O prompt já
                      proíbe marcas d&apos;água e propagandas na capa.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ÁREA DE UPLOAD DA CAPA FOTOGRÁFICA */}
          <div className="bg-[#FAF7F2] rounded-2xl p-5 sm:p-6 border border-[#E8DFD5] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#8C5E3C]" />
                <h5 className="font-serif font-bold text-sm sm:text-base text-[#2C2420]">
                  Upload da Imagem da Capa
                </h5>
              </div>
              <span className="text-[11px] font-semibold text-[#8C5E3C]">
                Arte da IA ou Foto Principal
              </span>
            </div>

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
                        Clique para trocar a imagem da capa
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-[#8C5E3C] mb-2" />
                      <span className="text-xs font-bold text-[#2C2420]">
                        Clique para selecionar ou arraste a Foto da Capa
                      </span>
                      <p className="text-[11px] text-[#7A685B] mt-1">
                        Formato Vertical (JPG, PNG ou WEBP)
                      </p>
                    </div>
                  )}
                </div>

                {cover.imageUrl && (
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#7A685B] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Foto homologada para a capa
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

              {/* Mini Cover Preview Card (15x20 Vertical) */}
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
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E8DFD5]">
            <button
              type="button"
              onClick={() => setSubStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F5EFEB] text-[#5A4638] font-semibold text-xs border border-[#DDD3C5] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-[#8C5E3C]" />
              <span>Voltar aos Dados</span>
            </button>

            <button
              type="button"
              onClick={() => setSubStep(3)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#3D2C24] hover:bg-[#2C2420] text-[#FAF7F2] font-bold text-sm shadow-md hover:scale-[1.01] transition-all cursor-pointer"
            >
              <span>Avançar para Fotos do Álbum</span>
              <ArrowRight className="w-4 h-4 text-[#EAE0D5]" />
            </button>
          </div>
        </div>
      )}

      {/* SUB-STEP 3: Fotos do Álbum */}
      {subStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border border-[#E8DFD5] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DFD5]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center font-serif font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C2420]">
                    Fotos do Álbum (Até 40 fotos)
                  </h3>
                  <p className="text-xs text-[#7A685B] mt-0.5">
                    Selecione as fotografias para a montagem das 10 lâminas panorâmicas (20 páginas).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="px-3 py-1 rounded-full bg-[#EAE0D5] text-[#5A4638] text-xs font-bold font-mono">
                  {photos.length} / 40 fotos
                </div>
                {photos.length === 0 && (
                  <button
                    type="button"
                    id="btn-load-sample-photos"
                    onClick={onLoadDemo}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#EFE8DE] text-xs font-semibold text-[#5A4638] border border-[#DDD3C5] transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#8C5E3C]" />
                    Carregar Fotos de Exemplo
                  </button>
                )}
                {photos.length > 1 && (
                  <button
                    type="button"
                    onClick={handleSortChronologically}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#8C5E3C] hover:bg-[#734A2E] text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
                    title="Reorganizar por data e horário"
                  >
                    <Sparkles className="w-3 h-3" />
                    Organizar por Data
                  </button>
                )}
                {photos.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearAllPhotos}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Limpar
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

              <div className="w-12 h-12 rounded-2xl bg-[#F5EFEB] text-[#8C5E3C] flex items-center justify-center mx-auto mb-2">
                <Upload className="w-6 h-6" />
              </div>

              <h4 className="font-serif font-bold text-sm sm:text-base text-[#2C2420]">
                Arraste suas fotos aqui ou clique para selecionar
              </h4>
              <p className="text-xs text-[#7A685B] mt-1 max-w-md mx-auto">
                JPG, PNG ou WEBP. Abertura 180° sem cortes no vinco central.
              </p>

              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#EFE8DE] text-[11px] font-medium text-[#5A4638]">
                <CheckCircle2 className="w-3 h-3 text-[#8C5E3C]" />
                10 Lâminas Panorâmicas = 20 Páginas Rígidas
              </div>
            </div>

            {/* Photos Grid Preview */}
            {photos.length > 0 && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs text-[#7A685B]">
                  <span className="font-semibold text-[#2C2420]">
                    Fotos prontas para o álbum ({photos.length})
                  </span>
                  <span>Proporções 100% preservadas</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-2.5 max-h-72 overflow-y-auto p-2 bg-[#FFFFFF] rounded-2xl border border-[#EAE0D5]">
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-square bg-[#EFE8DE] rounded-xl overflow-hidden border border-[#DDD3C5] shadow-2xs hover:shadow-md transition-all"
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/75 text-white text-[9px] font-mono">
                        #{idx + 1}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemovePhoto(photo.id);
                        }}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer shadow-xs z-10 text-xs"
                        title="Remover foto"
                      >
                        ×
                      </button>

                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-1 text-[8px] text-white">
                        <p className="truncate font-medium text-center">{photo.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estrutura Enxuta e Elegante */}
            <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#DDD3C5] flex flex-wrap items-center justify-between gap-3 text-xs text-[#5A4638]">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#8C5E3C]" />
                <span className="font-semibold text-[#2C2420]">Padrão Villa7:</span>
                <span>Formato 15x20 cm • 10 Lâminas (20 Páginas) • Abertura Plana 180°</span>
              </div>
              <div className="text-[11px] text-[#7A685B]">
                Média: {photos.length > 0 ? (photos.length / 10).toFixed(1) : '4.0'} fotos por lâmina
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#E8DFD5]">
              <button
                type="button"
                onClick={() => setSubStep(2)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F5EFEB] text-[#5A4638] font-semibold text-xs border border-[#DDD3C5] transition-colors cursor-pointer self-start sm:self-auto"
              >
                <ArrowLeft className="w-4 h-4 text-[#8C5E3C]" />
                <span>Voltar à Capa</span>
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {photos.length > 0 && onNextAndAutoDiagram && (
                  <button
                    type="button"
                    id="btn-process1-advance-autodiagram"
                    onClick={onNextAndAutoDiagram}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#8C5E3C] to-[#3D2C24] hover:from-[#784E30] hover:to-[#2B1E18] text-[#FAF7F2] shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#F6ECE2]" />
                    <span>Diagramar Álbum Automaticamente</span>
                  </button>
                )}

                <button
                  type="button"
                  id="btn-process1-advance"
                  onClick={onNext}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-semibold text-xs sm:text-sm bg-[#3D2C24] hover:bg-[#2C2420] text-[#FAF7F2] shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  <span>Ir para Estúdio de Criação</span>
                  <ArrowRight className="w-4 h-4 text-[#EAE0D5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
