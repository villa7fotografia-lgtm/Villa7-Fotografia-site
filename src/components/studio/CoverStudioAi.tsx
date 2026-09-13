import React, { useState, useRef } from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Sliders,
  Palette,
  Type,
  Layers,
  Image as ImageIcon,
  History,
  Check,
  RotateCcw,
  Star,
  ChevronRight,
  Eye,
  Info,
  Upload,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Camera,
  FileImage,
  ShieldCheck,
  Lock,
  BookOpen,
} from 'lucide-react';
import { AlbumProject, CoverData, CoverAiHistoryItem, PhotoItem, CoverPromptDef } from '../../types';
import {
  COVER_PROMPT_PRESETS,
  buildGptCoverCreationPrompt,
  buildFormattedChatGPTMessage,
} from '../../constants/coverPrompts';

// Official Villa7 Delicate Centered Botanical/Floral Divider
const FloralDivider: React.FC<{ color?: string; className?: string }> = ({
  color = '#B39770',
  className = '',
}) => (
  <div className={`flex items-center justify-center gap-2 ${className}`}>
    <div className="w-6 sm:w-10 h-px" style={{ backgroundColor: color, opacity: 0.6 }} />
    <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 4C12 4 13.5 8 16 9C18.5 10 21 12 21 12C21 12 18.5 14 16 15C13.5 16 12 20 12 20C12 20 10.5 16 8 15C5.5 14 3 12 3 12C3 12 5.5 10 8 9C10.5 8 12 4 12 4Z"
        fill={color}
        opacity="0.85"
      />
    </svg>
    <div className="w-6 sm:w-10 h-px" style={{ backgroundColor: color, opacity: 0.6 }} />
  </div>
);

// Official Villa7 Signature Mark (Emblem + "by VILLA7")
const Villa7Signature: React.FC<{ color?: string; className?: string }> = ({
  color = '#B39770',
  className = '',
}) => (
  <div className={`inline-flex items-center gap-1.5 ${className}`}>
    {/* Open book icon matching catalog */}
    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 19.5V6.5C4 5.4 4.9 4.5 6 4.5H11C11.6 4.5 12 4.9 12 5.5V19.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20 19.5V6.5C20 5.4 19.1 4.5 18 4.5H13C12.4 4.5 12 4.9 12 5.5V19.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4 19.5C4 18.4 4.9 17.5 6 17.5H12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20 19.5C20 18.4 19.1 17.5 18 17.5H12"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
    <span
      className="font-serif text-[10px] sm:text-[11px] tracking-widest uppercase font-bold"
      style={{ color }}
    >
      by VILLA7
    </span>
  </div>
);

interface CoverStudioAiProps {
  project: AlbumProject;
  onChangeCover: (updated: Partial<CoverData>) => void;
}

const getTitleFontFamily = (font?: string) => {
  switch (font) {
    case 'playfair': return '"Playfair Display", serif';
    case 'cinzel': return '"Cinzel", serif';
    case 'montserrat': return '"Montserrat", sans-serif';
    case 'great_vibes': return '"Great Vibes", cursive';
    case 'cormorant':
    default:
      return '"Cormorant Garamond", serif';
  }
};

export const CoverStudioAi: React.FC<CoverStudioAiProps> = ({ project, onChangeCover }) => {
  const { cover, clientData, photos } = project;

  // Selected Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    COVER_PROMPT_PRESETS[1]?.id || 'personalizado-inteligente'
  );
  const selectedPreset: CoverPromptDef =
    COVER_PROMPT_PRESETS.find((p) => p.id === selectedPresetId) || COVER_PROMPT_PRESETS[0];

  const [customPrompt, setCustomPrompt] = useState<string>(
    cover.aiPrompt || selectedPreset.promptText
  );
  const [showHiddenDirectives, setShowHiddenDirectives] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ia' | 'refinar' | 'historico'>('ia');
  const [showSpineGuides, setShowSpineGuides] = useState<boolean>(true);
  const [coverViewMode, setCoverViewMode] = useState<'3d' | 'horizontal'>('3d');

  // File Inputs
  const coverPhotoInputRef = useRef<HTMLInputElement>(null);
  const generatedArtInputRef = useRef<HTMLInputElement>(null);
  const addRefInputRef = useRef<HTMLInputElement>(null);

  const [isDraggingCoverPhoto, setIsDraggingCoverPhoto] = useState<boolean>(false);
  const [isDraggingGenerated, setIsDraggingGenerated] = useState<boolean>(false);

  // Candidate photos for cover
  const availableCoverPhotos: PhotoItem[] = [
    ...(cover.coverPhotos || []),
    ...photos.filter((p) => !cover.coverPhotos?.some((cp) => cp.id === p.id)),
  ];

  // Build the Hidden Prompt & Full Message
  const promptData = buildGptCoverCreationPrompt({
    promptDef: selectedPreset,
    albumTitle: clientData.albumTitle || cover.title,
    albumSubtitle: clientData.albumSubtitle || cover.subtitle,
    clientName: clientData.name,
    occasion: clientData.occasion,
    referenceImagesCount: cover.referenceImages?.length || 0,
    spineText: cover.spineText || `${cover.title} • ${cover.yearOrDate || '2026'}`,
    foilColor: cover.foilColor || 'gold',
  });

  const handleSelectPreset = (preset: CoverPromptDef) => {
    setSelectedPresetId(preset.id);
    setCustomPrompt(preset.promptText);

    // Apply official Villa7 physical catalog defaults
    onChangeCover({
      selectedPromptId: preset.id,
      bgColor: preset.defaultBgColor || cover.bgColor || '#1A1816',
      foilColor: preset.defaultFoilColor || cover.foilColor || 'gold',
      title:
        (!cover.title || cover.title === 'Nossas Memórias' || cover.title === 'Álbum Fotográfico') &&
        preset.suggestedTitleExample
          ? preset.suggestedTitleExample
          : cover.title,
      subtitle:
        (!cover.subtitle || cover.subtitle === 'Momentos Especiais') &&
        preset.suggestedSubtitleExample
          ? preset.suggestedSubtitleExample
          : cover.subtitle,
      spineText: `${(
        (!cover.title || cover.title === 'Nossas Memórias' || cover.title === 'Álbum Fotográfico') &&
        preset.suggestedTitleExample
          ? preset.suggestedTitleExample
          : cover.title || 'ÁLBUM FOTOGRÁFICO'
      ).toUpperCase()} • ${cover.yearOrDate || '2026'}`,
    });
  };

  const handleCopyFullPrompt = async () => {
    const formatted = buildFormattedChatGPTMessage(
      selectedPreset,
      clientData.albumTitle || cover.title,
      clientData.albumSubtitle || cover.subtitle,
      clientData.name || 'Cliente Villa7',
      clientData.occasion,
      clientData.eventDescription
    );

    const textToCopy = `${promptData.hiddenSystemPrompt}\n\n=======================================================\n${formatted}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 3500);
    } catch (e) {
      console.warn('Erro ao copiar prompt:', e);
    }
  };

  // Helper to convert uploaded File to DataURL
  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  // Direct Cover Photo Upload
  const handleUploadCoverPhoto = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = Array.from(files).find((f) => f.type.startsWith('image/'));
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    const newPhoto: PhotoItem = {
      id: `cover-photo-${Date.now()}`,
      url: dataUrl,
      name: file.name,
      size: file.size,
      width: 1500,
      height: 2000,
      aspectRatio: 0.75,
      createdAt: Date.now(),
      category: 'capa',
      isCoverMain: true,
    };

    const updatedCoverPhotos = [newPhoto, ...(cover.coverPhotos || [])];
    onChangeCover({
      imageUrl: dataUrl,
      coverPhotos: updatedCoverPhotos,
    });
  };

  // Upload artwork generated by GPT/DALL-E
  const handleUploadGeneratedImage = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = Array.from(files).find((f) => f.type.startsWith('image/'));
    if (!file) return;

    const dataUrl = await fileToDataUrl(file);
    onChangeCover({
      imageUrl: dataUrl,
      type: 'chatgpt',
    });
  };

  // Add additional reference images directly in the studio
  const handleUploadAdditionalReference = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const newRefs: string[] = [];

    for (const f of validFiles) {
      const url = await fileToDataUrl(f);
      newRefs.push(url);
    }

    const updatedRefs = [...(cover.referenceImages || []), ...newRefs];
    onChangeCover({
      referenceImages: updatedRefs,
    });
  };

  const handleApplyHistoryItem = (item: CoverAiHistoryItem) => {
    onChangeCover({
      title: item.suggestedTitle || cover.title,
      subtitle: item.suggestedSubtitle || cover.subtitle,
      bgColor: item.recommendedBgColor || cover.bgColor,
      textColor: item.recommendedTextColor || cover.textColor,
      foilColor: (item.recommendedFoilColor as any) || cover.foilColor,
      aiPrompt: item.prompt,
    });
  };

  const handleSelectCoverPhoto = (photo: PhotoItem) => {
    onChangeCover({
      imageUrl: photo.url,
    });
  };

  const foilColorClass = () => {
    switch (cover.foilColor) {
      case 'gold':
        return 'text-[#B39770] drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]';
      case 'silver':
        return 'text-[#A0A5AA]';
      case 'rose':
        return 'text-[#C59B9B]';
      case 'white':
        return 'text-[#FFFFFF] drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]';
      case 'black':
      default:
        return 'text-[#211D19]';
    }
  };

  const foilHex = (() => {
    switch (cover.foilColor) {
      case 'silver':
        return '#A0A5AA';
      case 'rose':
        return '#C59B9B';
      case 'white':
        return '#FFFFFF';
      case 'black':
        return '#211D19';
      case 'gold':
      default:
        return '#B39770';
    }
  })();

  const isDarkBg =
    cover.bgColor === '#1A1816' ||
    cover.bgColor === '#141211' ||
    cover.bgColor === '#171615' ||
    cover.bgColor === '#261D17' ||
    cover.bgColor === '#211D19' ||
    cover.bgColor === '#2A2521';

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Tabs */}
      <div className="bg-white p-5 rounded-3xl border border-[#DDD3C5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#B39770]/20 text-[#6E5536]">
              Studio de IA Villa7
            </span>
            <span className="text-xs text-[#8C7A6B]">
              Criador de Capas com GPT Imagens & Prompts Ocultos
            </span>
          </div>
          <h3 className="font-serif text-xl font-bold text-[#211D19] mt-1">
            Crie sua capa personalizada seguindo suas referências
          </h3>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#FAF7F2] p-1 rounded-2xl border border-[#E8DFD5]">
          <button
            type="button"
            onClick={() => setActiveTab('ia')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ia'
                ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                : 'text-[#6B5749] hover:bg-[#EFE8DE]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#B39770]" />
            <span>Criador GPT Imagens</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('refinar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'refinar'
                ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                : 'text-[#6B5749] hover:bg-[#EFE8DE]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Refinar Lombada & Textos</span>
          </button>

          {cover.aiHistory && cover.aiHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('historico')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'historico'
                  ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                  : 'text-[#6B5749] hover:bg-[#EFE8DE]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Histórico ({cover.aiHistory.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN STUDIO GRID: CONTROLS (LEFT) + REALTIME COVER CANVAS (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: IA CONTROLS & REFINEMENT */}
        <div className="lg:col-span-6 space-y-6">
          {activeTab === 'ia' && (
            <div className="bg-white p-6 rounded-3xl border border-[#DDD3C5] shadow-xs space-y-5">
              {/* 1. SELEÇÃO DE PROMPTS PRÉ-DEFINIDOS DO GPT IMAGENS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#3D2C24] uppercase tracking-wider block">
                    1. Prompts Pré-definidos do GPT Imagens
                  </label>
                  <span className="text-[10px] font-bold text-[#B39770] uppercase">
                    Estilos Editoriais
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {COVER_PROMPT_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'bg-[#FAF7F2] border-[#B39770] ring-2 ring-[#B39770]/40 shadow-xs'
                            : 'bg-white border-[#E8DFD5] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {preset.defaultBgColor && (
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                                style={{ backgroundColor: preset.defaultBgColor }}
                                title={`Revestimento: ${preset.defaultBgColor}`}
                              />
                            )}
                            <span className="text-xs font-bold font-serif text-[#211D19] truncate">
                              {preset.title}
                            </span>
                          </div>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#B39770] shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-[#7A685B] line-clamp-1 mt-0.5 block">
                          {preset.subtitle}
                        </span>
                        {preset.suggestedTitleExample && (
                          <span className="text-[9px] font-mono text-[#8C7A6B] block mt-1 opacity-75">
                            Ex: "{preset.suggestedTitleExample}"
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. PROMPT OCULTO & DIRETRIZES DO SISTEMA VILLA7 */}
              <div className="rounded-2xl border border-[#E8DFD5] bg-[#FAF7F2] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowHiddenDirectives(!showHiddenDirectives)}
                  className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-[#F2ECE3] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#B39770]" />
                    <div>
                      <span className="text-xs font-bold text-[#3D2C24] block">
                        Diretivas Ocultas do Sistema (Ateliê Villa7)
                      </span>
                      <span className="text-[10px] text-[#7A685B]">
                        Formato vertical 15x20 cm, lombada 2x6 cm e fidelidade às referências
                      </span>
                    </div>
                  </div>
                  {showHiddenDirectives ? (
                    <ChevronUp className="w-4 h-4 text-[#7A685B]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#7A685B]" />
                  )}
                </button>

                {showHiddenDirectives && (
                  <div className="p-3.5 pt-0 border-t border-[#E8DFD5] text-[11px] font-mono text-[#5A4638] bg-[#F7F3EC] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-thin">
                    {promptData.hiddenSystemPrompt}
                  </div>
                )}
              </div>

              {/* 3. REFERÊNCIAS DE CAPA ENVIADAS */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B39770]" />
                    <span className="text-xs font-bold text-[#3D2C24]">
                      Referências de Capa Enviadas
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-[#8C7A6B]">
                    {cover.referenceImages?.length || 0} referências ativas
                  </span>
                </div>

                {cover.referenceImages && cover.referenceImages.length > 0 ? (
                  <div>
                    <p className="text-[11px] text-[#6B5749] mb-2">
                      O GPT analisará estas referências para harmonizar paleta, textura e estética:
                    </p>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {cover.referenceImages.map((refUrl, idx) => (
                        <div
                          key={idx}
                          className="shrink-0 w-14 h-16 rounded-lg overflow-hidden border border-[#DDD3C5] shadow-2xs relative group"
                        >
                          <img
                            src={refUrl}
                            alt={`Referência ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addRefInputRef.current?.click()}
                        className="shrink-0 w-14 h-16 rounded-lg border-2 border-dashed border-[#DDD3C5] hover:border-[#B39770] flex flex-col items-center justify-center text-[#8C7A6B] hover:text-[#B39770] transition-colors cursor-pointer"
                        title="Adicionar mais referências"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span className="text-[9px] mt-0.5">+ Ref</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-[#7A685B]">
                      Nenhuma referência enviada ainda na Caixa 2.
                    </p>
                    <button
                      type="button"
                      onClick={() => addRefInputRef.current?.click()}
                      className="px-2.5 py-1 bg-white border border-[#DDD3C5] hover:border-[#B39770] text-[#3D2C24] text-[10px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3 text-[#B39770]" />
                      <span>Adicionar Referência</span>
                    </button>
                  </div>
                )}
                <input
                  ref={addRefInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleUploadAdditionalReference(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* 4. CAIXA PARA UPAR FOTO DA CAPA & SELETOR */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#3D2C24] uppercase tracking-wider block">
                    2. Foto Protagonista da Capa
                  </label>
                  <button
                    type="button"
                    onClick={() => coverPhotoInputRef.current?.click()}
                    className="text-[11px] font-semibold text-[#B39770] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upar Nova Foto</span>
                  </button>
                  <input
                    ref={coverPhotoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadCoverPhoto(e.target.files)}
                    className="hidden"
                  />
                </div>

                {/* Dropzone for Cover Photo */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingCoverPhoto(true);
                  }}
                  onDragLeave={() => setIsDraggingCoverPhoto(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingCoverPhoto(false);
                    handleUploadCoverPhoto(e.dataTransfer.files);
                  }}
                  onClick={() => coverPhotoInputRef.current?.click()}
                  className={`p-3 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                    isDraggingCoverPhoto
                      ? 'border-[#B39770] bg-[#FAF7F2]'
                      : 'border-[#DDD3C5] hover:border-[#B39770] bg-[#FAF7F2]/40'
                  }`}
                >
                  <p className="text-[11px] font-semibold text-[#211D19] flex items-center justify-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-[#B39770]" />
                    <span>Arraste ou clique para upar uma foto especificamente para a capa</span>
                  </p>
                </div>

                {/* Carousel of available cover photos */}
                {availableCoverPhotos.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                    {availableCoverPhotos.map((p) => {
                      const isSelected = cover.imageUrl === p.url;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectCoverPhoto(p)}
                          className={`shrink-0 w-16 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all relative ${
                            isSelected
                              ? 'border-[#B39770] ring-2 ring-[#B39770]/40 scale-105'
                              : 'border-[#DDD3C5] opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                          {isSelected && (
                            <span className="absolute top-1 right-1 bg-[#B39770] text-white p-0.5 rounded-full">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. INSTRUÇÃO / PROMPT DO CLIENTE */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#3D2C24] uppercase tracking-wider block">
                  3. Ajuste o Prompt Textual
                </label>
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ex: Capa sofisticada e limpa, tons terrosos quentes, respiro generoso e gravação em ouro nobre..."
                  className="w-full p-3 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs text-[#211D19] focus:ring-2 focus:ring-[#B39770]"
                />
              </div>

              {/* 6. AÇÕES DO GPT IMAGENS: COPIAR PROMPT OU SUBIR IMAGEM GERADA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {/* Botão Copiar Prompt Completo para GPT */}
                <button
                  type="button"
                  onClick={handleCopyFullPrompt}
                  className="px-4 py-3 bg-[#FAF7F2] hover:bg-[#EFE8DE] text-[#3D2C24] text-xs font-semibold rounded-xl border border-[#DDD3C5] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  {copiedPrompt ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Prompt Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#B39770]" />
                      <span>Copiar Prompt para ChatGPT / GPT</span>
                    </>
                  )}
                </button>

                {/* Botão Carregar Arte Gerada pelo GPT */}
                <button
                  type="button"
                  onClick={() => generatedArtInputRef.current?.click()}
                  className="px-4 py-3 bg-[#FAF7F2] hover:bg-[#EFE8DE] text-[#3D2C24] text-xs font-semibold rounded-xl border border-[#DDD3C5] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <FileImage className="w-4 h-4 text-[#B39770]" />
                  <span>Carregar Arte do GPT</span>
                </button>
                <input
                  ref={generatedArtInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleUploadGeneratedImage(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* GUIA DE PRODUÇÃO COM GPT WEB EM SEGUNDO PLANO */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#B39770]/40 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#B39770]/20 flex items-center justify-center text-[#6E5536] font-bold text-xs">
                    GPT
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#3D2C24] block">
                      Produção da Capa com ChatGPT (Web GPT)
                    </span>
                    <span className="text-[10px] text-[#7A685B]">
                      Gere a arte em segundo plano e importe o resultado no Ateliê
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-1 text-xs text-[#5A4638] leading-relaxed">
                  <p className="font-medium">Passo a Passo:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] text-[#6B5749]">
                    <li>Copie o prompt otimizado acima.</li>
                    <li>Clique em <strong>"Abrir ChatGPT no Navegador"</strong> para iniciar em segundo plano.</li>
                    <li>Gere a imagem no ChatGPT com sua foto base e baixe o resultado.</li>
                    <li>Faça o upload da imagem baixada abaixo, ajuste o texto da lombada e aprove a capa!</li>
                  </ol>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <a
                    href="https://chatgpt.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-[#3D2C24] hover:bg-[#211D19] text-[#FAF7F2] rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-center"
                  >
                    <span>Abrir ChatGPT em Segundo Plano</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#B39770]" />
                  </a>

                  <button
                    type="button"
                    onClick={() => generatedArtInputRef.current?.click()}
                    className="flex-1 py-3 bg-white hover:bg-[#F2ECE1] text-[#3D2C24] rounded-xl font-semibold text-xs border border-[#DDD3C5] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileImage className="w-3.5 h-3.5 text-[#B39770]" />
                    <span>Upar Imagem Baixada</span>
                  </button>
                  <input
                    ref={generatedArtInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleUploadGeneratedImage(e.target.files)}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB: REFINAR */}
          {activeTab === 'refinar' && (
            <div className="bg-white p-6 rounded-3xl border border-[#DDD3C5] shadow-xs space-y-5">
              <h4 className="font-serif text-base font-bold text-[#211D19]">
                Ajuste Fino da Capa e Lombada (2x6 cm)
              </h4>

              {/* Title, Subtitle, Spine */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3D2C24]">Título na Capa</label>
                  <input
                    type="text"
                    value={cover.title}
                    onChange={(e) => onChangeCover({ title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs text-[#211D19]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#3D2C24]">Subtítulo ou Nomes</label>
                  <input
                    type="text"
                    value={cover.subtitle}
                    onChange={(e) => onChangeCover({ subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs text-[#211D19]"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#3D2C24]">
                      Texto da Lombada (Área Pré-definida em 2x6 cm)
                    </label>
                    <span className="text-[10px] text-[#B39770] font-mono font-bold">2 × 6 cm</span>
                  </div>
                  <input
                    type="text"
                    value={cover.spineText || ''}
                    onChange={(e) => onChangeCover({ spineText: e.target.value })}
                    placeholder="Ex: Mariana & Lucas • 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs text-[#211D19]"
                  />
                  <p className="text-[10px] text-[#7A685B]">
                    Centralizado verticalmente na lombada de 2 cm com altura útil de 6 cm para gravação a quente.
                  </p>
                </div>
              </div>

              {/* Tipografia & Layout Exclusivo */}
              <div className="pt-3 border-t border-[#E8DFD5] space-y-3">
                <span className="text-xs font-bold text-[#3D2C24] block">
                  Tipografia Moderna & Exclusiva (Referências Villa 7)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-[#6B5749] font-medium">Família da Fonte</label>
                    <select
                      value={cover.titleFont || 'cormorant'}
                      onChange={(e) => onChangeCover({ titleFont: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs text-[#211D19]"
                    >
                      <option value="cormorant">Cormorant Garamond (Elegante Clássica)</option>
                      <option value="playfair">Playfair Display (Sofisticada)</option>
                      <option value="cinzel">Cinzel (Luxo Imponente)</option>
                      <option value="montserrat">Montserrat (Moderna Clean)</option>
                      <option value="great_vibes">Great Vibes (Cursiva Exclusiva)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-[#6B5749] font-medium">Estilo de Layout</label>
                    <select
                      value={cover.layoutStyle || 'full_bleed'}
                      onChange={(e) => onChangeCover({ layoutStyle: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs text-[#211D19]"
                    >
                      <option value="full_bleed">Foto Total com Hot Stamping (Referência)</option>
                      <option value="window_frame">Moldura Janela Central</option>
                      <option value="minimalist">Minimalista Texto & Fundo Nobre</option>
                    </select>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[10px] text-[#8C7A6B] font-semibold">Presets Villa7:</span>
                  <button
                    type="button"
                    onClick={() => onChangeCover({ titleFont: 'cormorant', foilColor: 'gold', layoutStyle: 'full_bleed' })}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#DDD3C5] text-[10px] text-[#3D2C24] hover:bg-[#F2ECE1] transition-colors"
                  >
                    ✨ Casamento Clássico Dourado
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeCover({ titleFont: 'cinzel', foilColor: 'silver', layoutStyle: 'window_frame' })}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#DDD3C5] text-[10px] text-[#3D2C24] hover:bg-[#F2ECE1] transition-colors"
                  >
                    🏛️ Luxo Prata
                  </button>
                </div>
              </div>

              {/* Cor de Fundo & Hot Stamping */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#E8DFD5]">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3D2C24]">Cor do Revestimento</label>
                  <div className="flex items-center gap-2">
                    {[
                      { code: '#F7F3EC', label: 'Bege Nobre' },
                      { code: '#FFFFFF', label: 'Branco Puro' },
                      { code: '#211D19', label: 'Grafite Luxo' },
                      { code: '#EAE1D5', label: 'Areia' },
                    ].map((c) => (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => onChangeCover({ bgColor: c.code })}
                        style={{ backgroundColor: c.code }}
                        className={`w-7 h-7 rounded-full border border-black/20 shadow-xs transition-transform cursor-pointer ${
                          cover.bgColor === c.code ? 'scale-125 ring-2 ring-[#B39770]' : ''
                        }`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#3D2C24]">Gravação Hot Stamping</label>
                  <select
                    value={cover.foilColor || 'gold'}
                    onChange={(e) => onChangeCover({ foilColor: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs text-[#211D19]"
                  >
                    <option value="gold">Dourado Champanhe</option>
                    <option value="silver">Prata Nobre</option>
                    <option value="rose">Rose Gold</option>
                    <option value="black">Preto Fosco</option>
                    <option value="white">Branco Serigrafia</option>
                  </select>
                </div>
              </div>

              {/* Photo Zoom & Pan */}
              {cover.imageUrl && (
                <div className="space-y-3 pt-2 border-t border-[#E8DFD5]">
                  <span className="text-xs font-bold text-[#3D2C24] block">
                    Enquadramento da Fotografia
                  </span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-[#6B5749]">Zoom:</span>
                    <input
                      type="range"
                      min={1}
                      max={2}
                      step={0.05}
                      value={cover.photoZoom || 1}
                      onChange={(e) => onChangeCover({ photoZoom: parseFloat(e.target.value) })}
                      className="flex-1 accent-[#B39770]"
                    />
                    <span className="font-semibold text-[#211D19]">
                      {Math.round((cover.photoZoom || 1) * 100)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: HISTORICO */}
          {activeTab === 'historico' && (
            <div className="bg-white p-6 rounded-3xl border border-[#DDD3C5] shadow-xs space-y-4">
              <h4 className="font-serif text-base font-bold text-[#211D19]">
                Histórico de Criações IA
              </h4>
              <p className="text-xs text-[#7A685B]">
                Clique em qualquer versão anterior para resgatar sua configuração de arte:
              </p>

              <div className="space-y-2.5">
                {cover.aiHistory?.map((hist) => (
                  <div
                    key={hist.id}
                    onClick={() => handleApplyHistoryItem(hist)}
                    className="p-3.5 rounded-2xl border border-[#E8DFD5] bg-[#FAF7F2] hover:bg-[#EFE8DE] cursor-pointer transition-all flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold font-serif text-[#211D19] block">
                        {hist.suggestedTitle || 'Versão Salva'}
                      </span>
                      <p className="text-[11px] text-[#7A685B] line-clamp-1 mt-0.5">
                        "{hist.prompt}"
                      </p>
                    </div>

                    <span className="text-[10px] font-semibold text-[#8C7A6B] bg-white px-2 py-1 rounded-lg border border-[#DDD3C5]">
                      {hist.createdAt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: REALTIME HARDCOVER VISUAL CANVAS (3D MOCKUP & OPEN SPREAD 32x20 CM) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#DDD3C5] shadow-sm space-y-4">
            {/* Header & View Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E8DFD5] pb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5E3C]">
                    Visualizador de Capa Villa7
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#EAE1D5] font-mono text-[#5A4638]">
                    15 × 20 cm Vertical
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-[#211D19]">
                  {coverViewMode === '3d'
                    ? 'Mockup 3D do Álbum Fechado (Referência Real)'
                    : 'Arte Horizontal Aberta (32 × 20 cm)'}
                </h4>
              </div>

              {/* View Switcher Controls */}
              <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1 rounded-xl border border-[#DDD3C5]">
                <button
                  type="button"
                  onClick={() => setCoverViewMode('3d')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    coverViewMode === '3d'
                      ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                      : 'text-[#6B5749] hover:bg-[#EFE8DE]'
                  }`}
                  title="Ver como livro real em 3D"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#B39770]" />
                  <span>Mockup 3D</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCoverViewMode('horizontal')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    coverViewMode === 'horizontal'
                      ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                      : 'text-[#6B5749] hover:bg-[#EFE8DE]'
                  }`}
                  title="Ver arte aberta para gráfica"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Arte 32x20</span>
                </button>
              </div>
            </div>

            {/* VIEW MODE 1: MOCKUP 3D PHYSICAL STANDING ALBUM (MATCHING VILLA7 CATALOG REFERENCE) */}
            {coverViewMode === '3d' ? (
              <div className="relative w-full py-8 sm:py-10 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F3EDE3] to-[#E8DFCFA0] rounded-2xl border border-[#E8DFD5] select-none">
                {/* 3D Perspective Stage */}
                <div className="relative flex items-center justify-center [perspective:1200px]">
                  {/* Luxury soft perspective contact shadow */}
                  <div className="absolute -bottom-5 w-[260px] sm:w-[320px] h-8 bg-black/25 blur-lg rounded-full transform rotate-[-2deg]" />

                  {/* 3D Book Assembly */}
                  <div
                    className="relative flex items-stretch shadow-2xl rounded-r-xl transition-transform duration-500 hover:scale-[1.02]"
                    style={{
                      transform: 'rotateY(-12deg) rotateX(3deg)',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* 1. LOMBADA 3D (2 cm Book Spine) */}
                    <div
                      className="w-8 sm:w-10 rounded-l-md flex flex-col justify-between items-center py-4 px-1 relative shadow-inner border-r border-black/25"
                      style={{
                        backgroundColor:
                          cover.bgColor === '#FFFFFF' ? '#ECE4D8' : cover.bgColor || '#1A1816',
                        backgroundImage:
                          'linear-gradient(90deg, rgba(0,0,0,0.32) 0%, rgba(255,255,255,0.1) 45%, rgba(0,0,0,0.42) 100%)',
                      }}
                    >
                      {/* Top Open Book Icon */}
                      <div className="opacity-85">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                          <path
                            d="M4 19.5V6.5C4 5.4 4.9 4.5 6 4.5H11V19.5"
                            stroke={foilHex}
                            strokeWidth="1.5"
                          />
                          <path
                            d="M20 19.5V6.5C20 5.4 19.1 4.5 18 4.5H13V19.5"
                            stroke={foilHex}
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>

                      {/* Vertical Spine Text in Hot Stamping Foil */}
                      <div
                        className="text-[8px] sm:text-[9px] font-serif font-bold uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 select-none text-center max-h-48 overflow-hidden line-clamp-1 drop-shadow-sm"
                        style={{ color: foilHex }}
                      >
                        {cover.spineText ||
                          `${(cover.title || 'ÁLBUM FOTOGRÁFICO').toUpperCase()} • ${
                            cover.yearOrDate || '2026'
                          }`}
                      </div>

                      {/* Bottom V7 Monogram */}
                      <span
                        className="text-[7px] font-serif font-bold tracking-wider uppercase opacity-80"
                        style={{ color: foilHex }}
                      >
                        V7
                      </span>
                    </div>

                    {/* 2. CAPA FRONTAL DURA (15x20 cm proportion) */}
                    <div
                      className="w-[210px] sm:w-[260px] aspect-[15/20] rounded-r-lg p-3 sm:p-4 flex flex-col justify-between items-center relative overflow-hidden shadow-lg border-l border-white/10"
                      style={{
                        backgroundColor: cover.bgColor || '#1A1816',
                        boxShadow: 'inset 3px 0 10px rgba(0,0,0,0.3)',
                      }}
                    >
                      {/* Leather/linen textural overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/5 pointer-events-none" />

                      {/* Top Header Tag */}
                      <div className="w-full flex items-center justify-between text-[8px] uppercase tracking-widest opacity-65 z-10">
                        <span style={{ color: foilHex }}>Villa7 Álbuns</span>
                        <span style={{ color: foilHex }}>15 × 20 cm</span>
                      </div>

                      {/* Foto Protagonista da Capa */}
                      <div className="w-full flex-1 my-1.5 flex items-center justify-center relative z-10">
                        {cover.imageUrl ? (
                          <div className="w-full h-full max-h-[160px] sm:max-h-[210px] rounded-sm overflow-hidden shadow-md border border-white/15 relative bg-black/20">
                            <img
                              src={cover.imageUrl}
                              alt="Foto da Capa"
                              className="w-full h-full object-cover"
                              style={{
                                transform: `scale(${cover.photoZoom || 1}) translate(${
                                  cover.photoPanX || 0
                                }%, ${cover.photoPanY || 0}%)`,
                              }}
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/20 pointer-events-none" />
                          </div>
                        ) : (
                          <div className="w-full h-full max-h-[160px] sm:max-h-[210px] rounded-sm border border-dashed border-[#B39770]/40 flex flex-col items-center justify-center p-3 text-center">
                            <ImageIcon className="w-6 h-6 text-[#B39770]/60 mb-1" />
                            <span className="text-[10px] text-[#B39770]/80">
                              Selecione ou carregue uma foto
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Terço Inferior: Identidade Oficial Villa7 */}
                      <div className="w-full text-center space-y-1 z-10 pt-1">
                        {/* 1. Título Principal em Hot Stamping */}
                        <h4
                          className="font-serif text-xs sm:text-sm font-bold tracking-wide leading-tight line-clamp-1"
                          style={{
                            color: foilHex,
                            fontFamily: getTitleFontFamily(cover.titleFont),
                            textShadow: isDarkBg
                              ? '0 1px 2px rgba(0,0,0,0.6)'
                              : '0 1px 1px rgba(255,255,255,0.4)',
                          }}
                        >
                          {cover.title || 'Marcelo e Vitória'}
                        </h4>

                        {/* 2. Subtítulo Poético em Itálico */}
                        <p
                          className="font-serif italic text-[10px] sm:text-[11px] leading-tight line-clamp-1"
                          style={{ color: isDarkBg ? '#E2D8CC' : '#5A4638' }}
                        >
                          {cover.subtitle || 'Uma história de amor'}
                        </p>

                        {/* 3. Florão Botânico Centralizado */}
                        <FloralDivider color={foilHex} className="my-0.5" />

                        {/* 4. Assinatura Oficial "by VILLA7" com Livro Aberto */}
                        <div className="pt-0.5">
                          <Villa7Signature color={foilHex} />
                        </div>
                      </div>
                    </div>

                    {/* 3. BLOCO LATERAL DE PÁGINAS (Espessura das páginas de papel fotográfico 800g) */}
                    <div
                      className="w-2.5 sm:w-3.5 rounded-r-xs bg-gradient-to-r from-[#D8D2C6] via-[#FAF7F2] to-[#E5DECة] shadow-inner"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(0deg, #FAF7F2 0px, #FAF7F2 2px, #D8D2C6 3px)',
                      }}
                      title="Miolo Fotográfico Panorâmico 800g/m²"
                    />
                  </div>
                </div>

                <span className="text-[10px] text-[#8C7A6B] mt-3 font-medium">
                  Perspectiva realista do produto físico confeccionado pelo Ateliê Villa7
                </span>
              </div>
            ) : (
              /* VIEW MODE 2: ARTE HORIZONTAL ABERTA (32x20 cm proportion ~ 1.6:1) */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#7A685B] px-1">
                  <span>Layout Aberto para Produção Gráfica: 32 × 20 cm</span>
                  <button
                    type="button"
                    onClick={() => setShowSpineGuides(!showSpineGuides)}
                    className="text-[10px] font-semibold text-[#B39770] hover:underline cursor-pointer"
                  >
                    {showSpineGuides ? 'Ocultar Área 2x6 cm' : 'Exibir Área 2x6 cm'}
                  </button>
                </div>

                <div
                  className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden border border-black/10 shadow-lg flex transition-colors select-none"
                  style={{ backgroundColor: cover.bgColor || '#1A1816' }}
                >
                  {/* Contracapa (Verso - 15x20 cm = 46.875% of 32cm) */}
                  <div className="w-[46.875%] h-full p-4 flex flex-col justify-between border-r border-black/10 relative">
                    <div
                      className="text-[8px] uppercase tracking-widest flex items-center justify-between opacity-60"
                      style={{ color: isDarkBg ? '#DDD3C5' : '#5A4638' }}
                    >
                      <span>Contracapa (15x20)</span>
                      <span>Ateliê Villa7</span>
                    </div>

                    <div className="text-center space-y-1.5 opacity-80 my-auto">
                      <div
                        className="w-7 h-7 mx-auto rounded-full border flex items-center justify-center text-[9px] font-serif font-bold"
                        style={{ borderColor: foilHex, color: foilHex }}
                      >
                        V7
                      </div>
                      <span
                        className="text-[9px] tracking-widest uppercase block font-serif font-bold"
                        style={{ color: foilHex }}
                      >
                        Villa7 Fine Art
                      </span>
                      <div className="w-12 h-px bg-current opacity-20 mx-auto" />
                      <span
                        className="text-[8px] block"
                        style={{ color: isDarkBg ? '#C2B8AC' : '#6B5749' }}
                      >
                        Encadernação Manual & Papel Fotográfico
                      </span>
                    </div>

                    <div
                      className="text-[8px] flex items-center justify-between opacity-60"
                      style={{ color: isDarkBg ? '#DDD3C5' : '#5A4638' }}
                    >
                      <span>300 DPI Fine Art</span>
                      <span>Produção Homologada</span>
                    </div>
                  </div>

                  {/* Lombada (Spine - 2x20 cm = 6.25% of 32cm) */}
                  <div className="w-[6.25%] h-full bg-black/15 border-x border-black/20 flex items-center justify-center relative overflow-hidden">
                    {/* 2x6 cm text area demarcation guide */}
                    {showSpineGuides && (
                      <div
                        className="absolute w-full h-[30%] border-y-2 border-dashed border-[#B39770]/70 pointer-events-none flex items-center justify-center"
                        title="Área restrita de gravação 2x6 cm"
                      >
                        <span className="sr-only">Área 2x6 cm</span>
                      </div>
                    )}

                    {/* Vertical Spine Text in Hot Stamping foil */}
                    <div
                      className="text-[8px] font-serif font-bold uppercase tracking-widest -rotate-90 whitespace-nowrap z-10 select-none"
                      style={{ color: foilHex }}
                    >
                      {cover.spineText ||
                        `${(cover.title || 'ÁLBUM').toUpperCase()} • ${
                          cover.yearOrDate || '2026'
                        }`}
                    </div>
                  </div>

                  {/* Capa Frontal (Frente - 15x20 cm = 46.875% of 32cm) */}
                  <div className="w-[46.875%] h-full p-4 sm:p-5 flex flex-col justify-between items-center text-center relative">
                    <div
                      className="text-[8px] uppercase tracking-widest flex items-center justify-between w-full opacity-60"
                      style={{ color: isDarkBg ? '#DDD3C5' : '#5A4638' }}
                    >
                      <span>Villa7 Álbuns</span>
                      <span className="font-mono" style={{ color: foilHex }}>
                        Capa (15x20)
                      </span>
                    </div>

                    {/* Cover Main Photo */}
                    <div className="my-auto">
                      {cover.imageUrl ? (
                        <div className="w-24 sm:w-32 aspect-[3/4] bg-white p-1 rounded-sm shadow-md overflow-hidden border border-black/10">
                          <img
                            src={cover.imageUrl}
                            alt="Foto da Capa"
                            className="w-full h-full object-cover"
                            style={{
                              transform: `scale(${cover.photoZoom || 1}) translate(${
                                cover.photoPanX || 0
                              }%, ${cover.photoPanY || 0}%)`,
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-24 sm:w-32 aspect-[3/4] rounded-sm border-2 border-dashed border-[#DDD3C5]/50 flex flex-col items-center justify-center p-2 text-center text-[#9A9187]">
                          <ImageIcon className="w-5 h-5 mb-1 text-[#B39770]" />
                          <span className="text-[9px]">Selecione uma foto</span>
                        </div>
                      )}
                    </div>

                    {/* Typography with official Villa7 identity */}
                    <div className="space-y-0.5 z-10 w-full">
                      <h5
                        className="font-serif text-xs sm:text-sm font-bold line-clamp-1"
                        style={{ color: foilHex, fontFamily: getTitleFontFamily(cover.titleFont) }}
                      >
                        {cover.title || 'Marcelo e Vitória'}
                      </h5>
                      <p
                        className="font-serif italic text-[10px] line-clamp-1"
                        style={{ color: isDarkBg ? '#E2D8CC' : '#5A4638' }}
                      >
                        {cover.subtitle || 'Uma história de amor'}
                      </p>
                      <FloralDivider color={foilHex} className="my-0.5" />
                      <div className="pt-0.5">
                        <Villa7Signature color={foilHex} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Approval & Action Bar */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E8DFD5]">
              <button
                type="button"
                onClick={() => generatedArtInputRef.current?.click()}
                className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#EFE8DE] text-[#3D2C24] text-xs font-semibold rounded-xl border border-[#DDD3C5] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileImage className="w-3.5 h-3.5 text-[#B39770]" />
                <span>Atualizar Imagem do GPT</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onChangeCover({
                    approved: true,
                    approvalDate: new Date().toLocaleDateString('pt-BR'),
                  })
                }
                className="px-6 py-2 bg-[#3D2C24] hover:bg-[#211D19] text-[#FAF7F2] text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#B39770]" />
                <span>{cover.approved ? 'CAPA HOMOLOGADA' : 'APROVAR CAPA'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
