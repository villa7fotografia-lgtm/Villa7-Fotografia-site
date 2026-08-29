import React, { useState } from 'react';
import {
  LayoutGrid,
  Book,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Eye,
  CheckCircle,
  Upload,
  Copy,
  ExternalLink,
  Check,
  Type,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Maximize2,
  ZoomIn,
  Move,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import { AlbumProject, CoverData, PhotoItem, SpreadItem, SlotLayout, TemplateDef } from '../../types';
import { SPREAD_TEMPLATES, getTemplatesByPhotoCount, getTemplateById } from '../../constants/templates';
import { COVER_PROMPT_PRESETS, buildFormattedChatGPTMessage } from '../../constants/coverPrompts';

interface Process2Props {
  project: AlbumProject;
  onChangeSpread: (spreadIndex: number, updatedSpread: SpreadItem) => void;
  onChangeCover: (updated: Partial<CoverData>) => void;
  onAutoLayoutAll: () => void;
  onOpenPreview: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Process2CreationStudio: React.FC<Process2Props> = ({
  project,
  onChangeSpread,
  onChangeCover,
  onAutoLayoutAll,
  onOpenPreview,
  onNext,
  onPrev,
}) => {
  const [studioTab, setStudioTab] = useState<'spreads' | 'cover'>('spreads');
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState<number>(0);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(0);
  const [selectedPhotoFilter, setSelectedPhotoFilter] = useState<string>('all');

  // Cover sub-state
  const [coverTab, setCoverTab] = useState<'chatgpt' | 'upload'>('chatgpt');
  const [selectedPromptId, setSelectedPromptId] = useState<string>(
    COVER_PROMPT_PRESETS[0].id
  );
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const coverFileInputRef = React.useRef<HTMLInputElement>(null);

  const currentSpread = project.spreads[currentSpreadIndex] || project.spreads[0];
  const photosMap = new Map<string, PhotoItem>();
  project.photos.forEach((p) => photosMap.set(p.id, p));

  // Count photos used
  const usedPhotoIds = new Set<string>();
  project.spreads.forEach((spread) => {
    spread.slots.forEach((slot) => {
      if (slot.photoId) usedPhotoIds.add(slot.photoId);
    });
  });

  const availablePhotos = project.photos.filter((p) => {
    if (selectedPhotoFilter === 'unused') return !usedPhotoIds.has(p.id);
    if (selectedPhotoFilter === 'used') return usedPhotoIds.has(p.id);
    return true;
  });

  // Spread manipulations
  const handleSelectTemplate = (template: TemplateDef) => {
    const currentPhotos = currentSpread.slots.map((s) => s.photoId).filter(Boolean);
    const newSlots: SlotLayout[] = template.slots.map((slotDef, idx) => ({
      id: `slot-${currentSpread.spreadNumber}-${idx + 1}-${Date.now()}`,
      x: slotDef.x,
      y: slotDef.y,
      width: slotDef.width,
      height: slotDef.height,
      photoId: currentPhotos[idx] || undefined,
      zoom: 1,
      panX: 0,
      panY: 0,
      fit: 'cover',
      filter: 'none',
    }));

    const updatedSpread: SpreadItem = {
      ...currentSpread,
      templateId: template.id,
      slots: newSlots,
    };
    onChangeSpread(currentSpreadIndex, updatedSpread);
    setSelectedSlotIndex(0);
  };

  const handleAssignPhotoToSlot = (photoId: string, slotIndex: number) => {
    const updatedSlots = [...currentSpread.slots];
    if (updatedSlots[slotIndex]) {
      updatedSlots[slotIndex] = {
        ...updatedSlots[slotIndex],
        photoId,
        zoom: 1,
        panX: 0,
        panY: 0,
      };
      onChangeSpread(currentSpreadIndex, {
        ...currentSpread,
        slots: updatedSlots,
      });
    }
  };

  const handleUpdateSlotProperty = (
    slotIndex: number,
    property: keyof SlotLayout,
    value: any
  ) => {
    const updatedSlots = [...currentSpread.slots];
    if (updatedSlots[slotIndex]) {
      updatedSlots[slotIndex] = {
        ...updatedSlots[slotIndex],
        [property]: value,
      };
      onChangeSpread(currentSpreadIndex, {
        ...currentSpread,
        slots: updatedSlots,
      });
    }
  };

  const handleRemovePhotoFromSlot = (slotIndex: number) => {
    const updatedSlots = [...currentSpread.slots];
    if (updatedSlots[slotIndex]) {
      updatedSlots[slotIndex] = {
        ...updatedSlots[slotIndex],
        photoId: undefined,
      };
      onChangeSpread(currentSpreadIndex, {
        ...currentSpread,
        slots: updatedSlots,
      });
    }
  };

  // Cover helpers
  const activePrompt =
    COVER_PROMPT_PRESETS.find((p) => p.id === selectedPromptId) || COVER_PROMPT_PRESETS[0];

  const formattedCoverPrompt = buildFormattedChatGPTMessage(
    activePrompt,
    project.cover.title || project.clientData.albumTitle,
    project.cover.subtitle || project.clientData.albumSubtitle,
    project.clientData.name
  );

  const handleCopyCoverPrompt = () => {
    navigator.clipboard.writeText(formattedCoverPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleCoverUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      onChangeCover({
        imageUrl: url,
        approved: true,
        selectedPromptId,
        generatedPromptUsed: formattedCoverPrompt,
      });
    };
    reader.readAsDataURL(file);
  };

  const selectedSlot =
    selectedSlotIndex !== null ? currentSpread?.slots[selectedSlotIndex] : null;
  const selectedSlotPhoto = selectedSlot?.photoId ? photosMap.get(selectedSlot.photoId) : null;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Studio Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8DFD5]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#EFE8DE] text-[#5A4638] text-[11px] font-semibold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#8C5E3C]" />
            Processo 2 • Estúdio de Criação
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2420]">
            Diagramação das Lâminas & Estúdio de Capa
          </h2>
        </div>

        {/* Tab Switcher & Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-[#EAE0D5] p-1 rounded-2xl flex items-center gap-1 border border-[#DDD3C5]">
            <button
              type="button"
              id="tab-studio-spreads"
              onClick={() => setStudioTab('spreads')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                studioTab === 'spreads'
                  ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                  : 'text-[#5A4638] hover:bg-[#E0D6C8]'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-[#EAE0D5]" />
              Lâminas 20x30 cm ({project.spreadCount})
            </button>

            <button
              type="button"
              id="tab-studio-cover"
              onClick={() => setStudioTab('cover')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                studioTab === 'cover'
                  ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                  : 'text-[#5A4638] hover:bg-[#E0D6C8]'
              }`}
            >
              <Book className="w-4 h-4 text-[#8C5E3C]" />
              Capa 15x20 {project.cover.approved && '✓'}
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE4] text-xs font-semibold text-[#3D2C24] border border-[#DDD3C5] transition-colors"
          >
            <Eye className="w-4 h-4 text-[#8C5E3C]" />
            Flipbook 3D (15x20)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: DIAGRAMAÇÃO DAS LÂMINAS (20x30 CM ABERTO / 15x20 VERTICAL)       */}
      {/* ========================================================================= */}
      {studioTab === 'spreads' && (
        <div className="space-y-6">
          {/* Hero Highlight Card: Diagramação Automática Inteligente Anti-Corte */}
          <div className="bg-gradient-to-r from-[#FAF3EB] via-[#F5ECE1] to-[#EFE3D3] p-5 sm:p-6 rounded-3xl border-2 border-[#D9C1AA] shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-[#8C5E3C]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
              <div className="space-y-1.5 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#8C5E3C]/15 text-[#5A3822] text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-[#8C5E3C] animate-pulse" />
                  Inteligência Visual Villa7 • 15x20 Vertical
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C2420]">
                  Diagramação Automática com Proteção de Enquadramento
                </h3>
                <p className="text-xs sm:text-sm text-[#6F5B4E] leading-relaxed">
                  O algoritmo analisa a proporção de cada fotografia e escolhe os templates perfeitos para as lâminas abertas 20x30 cm (15x20 vertical), <strong className="text-[#3D2C24] font-semibold">mantendo miolo 100% branco e eliminando cortes indesejados</strong>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  id="btn-hero-auto-diagram"
                  onClick={onAutoLayoutAll}
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#8C5E3C] via-[#6F452A] to-[#3D2C24] hover:from-[#784E30] hover:to-[#2B1E18] text-[#FAF7F2] font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all ring-4 ring-[#8C5E3C]/25"
                >
                  <Sparkles className="w-5 h-5 text-[#F6ECE2] animate-pulse" />
                  <span>Auto-diagramar Álbum Completo (Sem Cortes)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Top Bar for Diagramming Controls */}
          <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFD5] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentSpreadIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentSpreadIndex === 0}
                className="p-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5EFEB] disabled:opacity-30 border border-[#DDD3C5] text-[#3D2C24] transition-colors"
                title="Lâmina anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="text-center px-3">
                <span className="text-xs font-bold font-serif text-[#2C2420] block">
                  Lâmina {currentSpreadIndex + 1} de {project.spreadCount}
                </span>
                <span className="text-[10px] text-[#7A685B]">
                  Páginas {currentSpreadIndex * 2 + 1} e {currentSpreadIndex * 2 + 2} (Aberto 20x30 cm)
                </span>
              </div>

              <button
                type="button"
                onClick={() =>
                  setCurrentSpreadIndex((prev) => Math.min(project.spreads.length - 1, prev + 1))
                }
                disabled={currentSpreadIndex === project.spreads.length - 1}
                className="p-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F5EFEB] disabled:opacity-30 border border-[#DDD3C5] text-[#3D2C24] transition-colors"
                title="Próxima lâmina"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Template count selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#7A685B]">Template:</span>
              {[1, 2, 3, 4].map((count) => {
                const templates = getTemplatesByPhotoCount(count as 1 | 2 | 3 | 4);
                return (
                  <div key={count} className="flex items-center gap-1">
                    {templates.map((t) => {
                      const isActive = currentSpread.templateId === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleSelectTemplate(t)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                            isActive
                              ? 'bg-[#3D2C24] text-[#FAF7F2] border-[#3D2C24]'
                              : 'bg-[#FFFFFF] text-[#5A4638] border-[#DDD3C5] hover:bg-[#F5EFEB]'
                          }`}
                          title={`${t.name} (${t.photoCount} foto${t.photoCount > 1 ? 's' : ''})`}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Prominent Auto Diagram Button in Topbar */}
            <button
              type="button"
              id="btn-auto-layout-all"
              onClick={onAutoLayoutAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8C5E3C] to-[#5A3822] hover:from-[#7A4E2F] hover:to-[#432715] text-[#FAF7F2] text-xs font-bold transition-all shadow-sm ring-2 ring-[#8C5E3C]/30 hover:scale-[1.02]"
              title="Executar diagramação automática inteligente sem cortes"
            >
              <Sparkles className="w-4 h-4 text-[#F5E8DC] animate-pulse" />
              <span>Auto-diagramar Álbum</span>
            </button>
          </div>

          {/* Main Layout Workspace: 20x30 (3:2) Canvas (Left 8 Cols) + Sidebar Photos (Right 4 Cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Interactive 20x30 Panorâmica Flat-lay Canvas (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Spread Board */}
              <div className="bg-[#FAF7F2] p-4 sm:p-6 rounded-3xl border border-[#E8DFD5] shadow-xs">
                {/* 3:2 Aspect Ratio Canvas (20x30 cm aberto / 15x20 vertical fechado) */}
                <div
                  className="relative w-full aspect-[3/2] bg-[#FFFFFF] rounded-2xl overflow-hidden border-2 border-[#D9CFC4] shadow-md select-none"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  {/* Subtle Center Crease Guide (Dobra da Lâmina para prévia visual) */}
                  <div className="absolute inset-y-0 left-1/2 w-px bg-black/10 -translate-x-1/2 z-20 pointer-events-none" />
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-[#3D2C24]/80 text-[#FAF7F2] text-[9px] px-2 py-0.5 rounded-full font-mono shadow-xs">
                    Dobra Central 15x20
                  </div>

                  {/* Render Spread Slots */}
                  {currentSpread.slots.map((slot, index) => {
                    const photo = slot.photoId ? photosMap.get(slot.photoId) : null;
                    const isSelected = selectedSlotIndex === index;

                    return (
                      <div
                        key={slot.id || index}
                        onClick={() => setSelectedSlotIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const photoId = e.dataTransfer.getData('text/plain');
                          if (photoId) handleAssignPhotoToSlot(photoId, index);
                        }}
                        style={{
                          left: `${slot.x}%`,
                          top: `${slot.y}%`,
                          width: `${slot.width}%`,
                          height: `${slot.height}%`,
                        }}
                        className={`absolute overflow-hidden transition-all cursor-pointer ${
                          isSelected
                            ? 'ring-3 ring-[#8C5E3C] ring-offset-2 z-10'
                            : 'hover:ring-2 hover:ring-[#8C5E3C]/50'
                        } ${slot.fit === 'contain' ? 'bg-[#FFFFFF]' : ''}`}
                      >
                        {photo ? (
                          <div className="relative w-full h-full group flex items-center justify-center">
                            <img
                              src={photo.url}
                              alt=""
                              className="w-full h-full transition-transform"
                              style={{
                                objectFit: slot.fit || 'cover',
                                transform: `scale(${slot.zoom || 1}) translate(${slot.panX || 0}%, ${
                                  slot.panY || 0
                                }%)`,
                                filter:
                                  slot.filter === 'bw'
                                    ? 'grayscale(100%)'
                                    : slot.filter === 'warm'
                                    ? 'sepia(30%)'
                                    : slot.filter === 'vintage'
                                    ? 'sepia(50%) contrast(110%)'
                                    : slot.filter === 'soft'
                                    ? 'brightness(105%) contrast(95%)'
                                    : 'none',
                              }}
                            />

                            {/* Fit Mode indicator badge */}
                            {slot.fit === 'contain' && (
                              <div className="absolute top-2 left-2 z-10 bg-[#3D2C24]/85 text-[#FAF7F2] text-[9px] px-2 py-0.5 rounded-md font-sans tracking-wide pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-xs">
                                <span>🛡️ Sem cortes (100%)</span>
                              </div>
                            )}

                            {/* Slot Overlay on Hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdateSlotProperty(
                                    index,
                                    'fit',
                                    slot.fit === 'contain' ? 'cover' : 'contain'
                                  );
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-white text-[#3D2C24] text-xs font-semibold shadow-xs"
                                title="Alternar enquadramento"
                              >
                                {slot.fit === 'contain' ? 'Preencher' : 'Sem Cortes (100%)'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemovePhotoFromSlot(index);
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs"
                              >
                                Remover
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-[#FAF7F2] border-2 border-dashed border-[#DDD3C5] rounded-xl flex flex-col items-center justify-center p-3 text-center transition-colors hover:bg-[#F2ECE4]">
                            <ImageIcon className="w-6 h-6 text-[#8C5E3C] mb-1 opacity-70" />
                            <span className="text-[10px] font-semibold text-[#5A4638]">
                              Espaço Foto {index + 1}
                            </span>
                            <span className="text-[9px] text-[#8C7A6B]">
                              Clique numa foto ao lado
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Page numbers footnote */}
                <div className="flex items-center justify-between text-[11px] font-mono text-[#8C7A6B] mt-3 px-2">
                  <span>Pág. {currentSpreadIndex * 2 + 1} (15x20 cm)</span>
                  <span>Lâmina Aberta 20x30 cm • Miolo Branco</span>
                  <span>Pág. {currentSpreadIndex * 2 + 2} (15x20 cm)</span>
                </div>
              </div>

              {/* Slot Tools (Zoom, Pan, Fit, Filters) */}
              {selectedSlot && selectedSlotPhoto && selectedSlotIndex !== null && (
                <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8DFD5] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#5A4638]">
                      Ajustes da Foto Selecionada (Espaço {selectedSlotIndex + 1})
                    </span>
                    <span className="text-xs font-mono text-[#8C7A6B]">
                      {selectedSlotPhoto.name}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    {/* Zoom */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#7A685B] mb-1">
                        Zoom ({selectedSlot.zoom?.toFixed(1) || '1.0'}x)
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="2.5"
                        step="0.1"
                        value={selectedSlot.zoom || 1}
                        onChange={(e) =>
                          handleUpdateSlotProperty(selectedSlotIndex, 'zoom', Number(e.target.value))
                        }
                        className="w-full accent-[#8C5E3C]"
                      />
                    </div>

                    {/* Enquadramento Fit */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#7A685B] mb-1">
                        Enquadramento
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateSlotProperty(selectedSlotIndex, 'fit', 'cover')}
                          className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold ${
                            selectedSlot.fit === 'cover'
                              ? 'bg-[#3D2C24] text-white'
                              : 'bg-white border border-[#DDD3C5]'
                          }`}
                        >
                          Preencher
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleUpdateSlotProperty(selectedSlotIndex, 'fit', 'contain')
                          }
                          className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold ${
                            selectedSlot.fit === 'contain'
                              ? 'bg-[#3D2C24] text-white'
                              : 'bg-white border border-[#DDD3C5]'
                          }`}
                        >
                          Inteira
                        </button>
                      </div>
                    </div>

                    {/* Filters */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#7A685B] mb-1">
                        Tonalidade / Filtro
                      </label>
                      <select
                        value={selectedSlot.filter || 'none'}
                        onChange={(e) =>
                          handleUpdateSlotProperty(selectedSlotIndex, 'filter', e.target.value)
                        }
                        className="w-full py-1 px-2 rounded-lg border border-[#DDD3C5] bg-white text-xs"
                      >
                        <option value="none">Original (Cores Vivas)</option>
                        <option value="bw">Preto & Branco Nobre</option>
                        <option value="warm">Aconchegante (Warm)</option>
                        <option value="vintage">Vintage Sepia</option>
                        <option value="soft">Luz Suave Editorial</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Available Photos Sidebar (4 Cols) */}
            <div className="lg:col-span-4 bg-[#FAF7F2] p-5 rounded-3xl border border-[#E8DFD5] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#2C2420]">Galeria de Fotos</h4>
                  <p className="text-[11px] text-[#7A685B]">Clique para colocar no espaço ativo</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#8C5E3C]">
                  {usedPhotoIds.size}/{project.photos.length} usadas
                </span>
              </div>

              {/* Filter unused / used */}
              <div className="flex items-center gap-1 p-1 bg-[#EAE0D5] rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedPhotoFilter('all')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition-all ${
                    selectedPhotoFilter === 'all' ? 'bg-[#3D2C24] text-white' : 'text-[#5A4638]'
                  }`}
                >
                  Todas ({project.photos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPhotoFilter('unused')}
                  className={`flex-1 py-1 rounded-lg font-semibold transition-all ${
                    selectedPhotoFilter === 'unused' ? 'bg-[#3D2C24] text-white' : 'text-[#5A4638]'
                  }`}
                >
                  Livres ({project.photos.length - usedPhotoIds.size})
                </button>
              </div>

              {/* Photos grid */}
              <div className="grid grid-cols-3 gap-2 max-h-[460px] overflow-y-auto p-1">
                {availablePhotos.map((photo) => {
                  const isUsed = usedPhotoIds.has(photo.id);
                  return (
                    <div
                      key={photo.id}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData('text/plain', photo.id)}
                      onClick={() => {
                        if (selectedSlotIndex !== null) {
                          handleAssignPhotoToSlot(photo.id, selectedSlotIndex);
                        }
                      }}
                      className="group relative aspect-square bg-[#EFE8DE] rounded-xl overflow-hidden border border-[#DDD3C5] cursor-pointer hover:border-[#8C5E3C] transition-all shadow-2xs"
                    >
                      <img
                        src={photo.url}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isUsed && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom All-Spreads Carousel */}
          <div className="bg-[#FAF7F2] p-4 rounded-3xl border border-[#E8DFD5] space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A685B] block">
              Navegação Rápida por Lâminas ({project.spreadCount} lâminas)
            </span>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {project.spreads.map((spread, idx) => {
                const isActive = idx === currentSpreadIndex;
                const filledCount = spread.slots.filter((s) => s.photoId).length;

                return (
                  <button
                    key={spread.id}
                    type="button"
                    onClick={() => {
                      setCurrentSpreadIndex(idx);
                      setSelectedSlotIndex(0);
                    }}
                    className={`shrink-0 w-32 p-2 rounded-2xl border text-left transition-all ${
                      isActive
                        ? 'bg-[#3D2C24] text-[#FAF7F2] border-[#2C2420] shadow-sm ring-2 ring-[#8C5E3C]/30'
                        : 'bg-[#FFFFFF] text-[#5A4638] border-[#DDD3C5] hover:bg-[#F5EFEB]'
                    }`}
                  >
                    <div className="text-[10px] font-bold truncate">Lâmina {idx + 1}</div>
                    <div className="w-full aspect-[3/2] bg-[#FFFFFF] rounded-lg mt-1 relative overflow-hidden border border-[#D9CFC4]">
                      <div className="absolute inset-y-0 left-1/2 w-px bg-black/10 -translate-x-1/2" />
                    </div>
                    <div className="text-[9px] mt-1 opacity-70">
                      {filledCount}/{spread.slots.length} fotos
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: ESTÚDIO DE CAPA (15x20 CM VERTICAL & CHATGPT)                     */}
      {/* ========================================================================= */}
      {studioTab === 'cover' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cover Tools (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Method Tabs */}
            <div className="bg-[#EAE0D5] p-1 rounded-2xl flex items-center gap-1 border border-[#DDD3C5]">
              <button
                type="button"
                id="btn-cover-tab-chatgpt"
                onClick={() => setCoverTab('chatgpt')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  coverTab === 'chatgpt'
                    ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                    : 'text-[#5A4638] hover:bg-[#E0D6C8]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#EAE0D5]" />
                Gerar Capa com IA (ChatGPT)
              </button>

              <button
                type="button"
                id="btn-cover-tab-upload"
                onClick={() => setCoverTab('upload')}
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  coverTab === 'upload'
                    ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                    : 'text-[#5A4638] hover:bg-[#E0D6C8]'
                }`}
              >
                <Upload className="w-4 h-4 text-[#8C5E3C]" />
                Enviar Foto da Capa 15x20
              </button>
            </div>

            {/* AI Prompts Section */}
            {coverTab === 'chatgpt' && (
              <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E8DFD5] shadow-xs space-y-5">
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C2420]">
                    1. Escolha o Estilo Visual da Capa
                  </h3>
                  <p className="text-xs text-[#7A685B]">
                    5 presets profissionais para gerar no ChatGPT:
                  </p>
                </div>

                <div className="space-y-2">
                  {COVER_PROMPT_PRESETS.map((preset) => {
                    const isSelected = selectedPromptId === preset.id;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => setSelectedPromptId(preset.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#F5EFEB] border-[#8C5E3C] shadow-xs ring-2 ring-[#8C5E3C]/20'
                            : 'bg-[#FFFFFF] border-[#DDD3C5] hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-xs sm:text-sm text-[#2C2420]">
                              {preset.title}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAE0D5] text-[#5A4638] font-medium">
                              {preset.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7A685B] mt-0.5">
                            {preset.subtitle} • {preset.paletteDescription}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#8C5E3C] text-white flex items-center justify-center shrink-0">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Prompt Box & Actions */}
                <div className="pt-3 border-t border-[#E8DFD5] space-y-3">
                  <div className="bg-[#FFFFFF] p-3.5 rounded-2xl border border-[#DDD3C5] text-xs font-mono text-[#5A4638] leading-relaxed max-h-28 overflow-y-auto">
                    {formattedCoverPrompt}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      id="btn-copy-cover-prompt"
                      onClick={handleCopyCoverPrompt}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#3D2C24] hover:bg-[#2C2420] text-[#FAF7F2] text-xs font-semibold transition-all shadow-xs"
                    >
                      {copiedPrompt ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          Prompt Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copiar Prompt Formatado
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => window.open('https://chatgpt.com', '_blank', 'noopener,noreferrer')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DE] text-[#3D2C24] text-xs font-semibold border border-[#DDD3C5] transition-all shadow-2xs"
                    >
                      <ExternalLink className="w-4 h-4 text-[#8C5E3C]" />
                      Abrir ChatGPT
                    </button>
                  </div>
                </div>

                {/* Upload generated image */}
                <div className="pt-3 border-t border-[#E8DFD5]">
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      e.target.files?.[0] && handleCoverUpload(e.target.files[0])
                    }
                  />

                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-[#8C5E3C] bg-[#F5EFEB] hover:bg-[#EFE8DE] text-[#3D2C24] text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-[#8C5E3C]" />
                    {project.cover.imageUrl
                      ? 'Substituir Imagem da Capa'
                      : 'Fazer Upload da Imagem Gerada no ChatGPT'}
                  </button>
                </div>
              </div>
            )}

            {/* Direct Upload Section */}
            {coverTab === 'upload' && (
              <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E8DFD5] shadow-xs space-y-4">
                <h3 className="font-serif text-base font-bold text-[#2C2420]">
                  Upload de Arquivo de Capa Pronto
                </h3>
                <div
                  onClick={() => coverFileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#DDD3C5] hover:border-[#8C5E3C] bg-[#FFFFFF] hover:bg-[#F5EFEB] rounded-2xl p-8 text-center cursor-pointer transition-all"
                >
                  <Upload className="w-8 h-8 text-[#8C5E3C] mx-auto mb-2" />
                  <h4 className="font-semibold text-sm text-[#2C2420]">
                    Clique para selecionar a imagem da capa (15x20 cm vertical)
                  </h4>
                  <p className="text-xs text-[#7A685B] mt-1">Formatos: JPG, PNG, WEBP</p>
                </div>
              </div>
            )}

            {/* Cover Texts Customization */}
            <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E8DFD5] shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-[#2C2420] flex items-center gap-2">
                <Type className="w-4 h-4 text-[#8C5E3C]" />
                Gravação de Título & Subtítulo na Capa
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#7A685B] mb-1">
                    Título da Capa
                  </label>
                  <input
                    type="text"
                    value={project.cover.title || project.clientData.albumTitle}
                    onChange={(e) => onChangeCover({ title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] bg-white text-xs font-serif font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#7A685B] mb-1">
                    Subtítulo / Ano
                  </label>
                  <input
                    type="text"
                    value={project.cover.subtitle || project.clientData.albumSubtitle}
                    onChange={(e) => onChangeCover({ subtitle: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#DDD3C5] bg-white text-xs font-serif"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Physical Cover Preview 15x20 cm (5 Cols) */}
          <div className="lg:col-span-5 sticky top-24">
            <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E8DFD5] shadow-md flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#7A685B]">
                  Prévia da Capa (15x20 cm Vertical)
                </span>
                {project.cover.approved ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Capa Aprovada
                  </span>
                ) : (
                  <span className="text-[11px] text-[#8C7A6B]">Pendente de aprovação</span>
                )}
              </div>

              {/* 15x20 Physical Cover Card (3:4 vertical ratio) */}
              <div className="relative w-64 h-85 rounded-2xl bg-[#FFFFFF] border-4 border-[#3D2C24] shadow-2xl overflow-hidden p-5 flex flex-col justify-between text-center transition-all hover:scale-[1.01]">
                <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />

                {project.cover.imageUrl && (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={project.cover.imageUrl}
                      alt="Capa"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                  </div>
                )}

                <div className="relative z-10">
                  <span className="text-[10px] font-serif tracking-widest uppercase font-bold text-[#8C7A6B]">
                    VILLA7
                  </span>
                </div>

                {!project.cover.imageUrl && project.photos[0] && (
                  <div className="relative z-10 w-32 h-32 mx-auto rounded-xl overflow-hidden border-2 border-[#DDD3C5] bg-white p-1 shadow-sm">
                    <img
                      src={project.photos[0].url}
                      alt=""
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="relative z-10 mt-auto">
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#2C2420]">
                    {project.cover.title || project.clientData.albumTitle || 'VILLA7 ÁLBUM'}
                  </h4>
                  <p className="font-serif italic text-xs text-[#5A4638] mt-0.5">
                    {project.cover.subtitle || project.clientData.albumSubtitle || 'Memórias Especiais'}
                  </p>
                </div>
              </div>

              {/* Cover Approve Toggle */}
              <div className="w-full mt-6 pt-4 border-t border-[#E8DFD5]">
                <button
                  type="button"
                  id="btn-approve-cover-studio"
                  onClick={() =>
                    onChangeCover({
                      approved: !project.cover.approved,
                      approvalDate: new Date().toLocaleDateString('pt-BR'),
                    })
                  }
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    project.cover.approved
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-[#3D2C24] hover:bg-[#2C2420] text-[#FAF7F2]'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {project.cover.approved ? 'Capa Homologada ✓' : 'Aprovar Capa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-[#E8DFD5]">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-[#5A4638] hover:bg-[#EFE8DE] transition-colors border border-[#DDD3C5]"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Preparação
        </button>

        <button
          type="button"
          id="btn-process2-advance"
          onClick={onNext}
          className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-semibold text-sm bg-[#3D2C24] hover:bg-[#2C2420] text-[#FAF7F2] shadow-md transition-all hover:scale-[1.01] cursor-pointer"
        >
          Avançar para Revisão & Produção (PDF / Drive)
          <ArrowRight className="w-4 h-4 text-[#EAE0D5]" />
        </button>
      </div>
    </div>
  );
};
