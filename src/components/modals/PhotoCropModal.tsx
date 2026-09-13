import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Move,
  Check,
  RefreshCw,
  User,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Grid3X3,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { PhotoFilterMode, PhotoFitMode, PhotoItem, SlotLayout } from '../../types';

interface PhotoCropModalProps {
  isOpen: boolean;
  slot: SlotLayout | null;
  photo: PhotoItem | null;
  onSave: (updatedSlot: Partial<SlotLayout>) => void;
  onClose: () => void;
}

export const PhotoCropModal: React.FC<PhotoCropModalProps> = ({
  isOpen,
  slot,
  photo,
  onSave,
  onClose,
}) => {
  const [zoom, setZoom] = useState<number>(slot?.zoom || 1);
  const [panX, setPanX] = useState<number>(slot?.panX || 0);
  const [panY, setPanY] = useState<number>(slot?.panY || 0);
  const [fit, setFit] = useState<PhotoFitMode>(slot?.fit || 'cover');
  const [filter, setFilter] = useState<PhotoFilterMode>(slot?.filter || 'none');
  const [showGuides, setShowGuides] = useState<boolean>(true);

  // Dragging state for direct canvas interaction
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number }>({
    x: 0,
    y: 0,
    startPanX: 0,
    startPanY: 0,
  });
  const previewBoxRef = useRef<HTMLDivElement>(null);

  // Sync state if slot changes
  useEffect(() => {
    if (slot) {
      setZoom(slot.zoom || 1);
      setPanX(slot.panX || 0);
      setPanY(slot.panY || 0);
      setFit(slot.fit || 'cover');
      setFilter(slot.filter || 'none');
    }
  }, [slot]);

  // If modal is not open or required data is missing, render nothing (after all hooks have been invoked)
  if (!isOpen || !slot || !photo) return null;

  // Pointer drag events for direct interactive repositioning
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: panX,
      startPanY: panY,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const rect = previewBoxRef.current?.getBoundingClientRect();
    if (!rect) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    // Convert pixel delta to percentage (-60% to +60%)
    const sensitivity = 0.8;
    const percentX = (deltaX / rect.width) * 100 * sensitivity;
    const percentY = (deltaY / rect.height) * 100 * sensitivity;

    const newPanX = Math.round(
      Math.max(-50, Math.min(50, dragStartRef.current.startPanX + percentX))
    );
    const newPanY = Math.round(
      Math.max(-50, Math.min(50, dragStartRef.current.startPanY + percentY))
    );

    setPanX(newPanX);
    setPanY(newPanY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsDragging(false);
  };

  const handleApply = () => {
    onSave({
      zoom,
      panX,
      panY,
      fit,
      filter,
    });
    onClose();
  };

  const handleReset = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setFit('cover');
    setFilter('none');
  };

  // Quick focal presets to easily protect heads, legs, bodies, and edges
  const applyPreset = (preset: 'head' | 'center' | 'legs' | 'left' | 'right') => {
    setFit('cover');
    if (preset === 'head') {
      // Shift image down to reveal top of photo (heads/faces)
      setPanY(25);
      setPanX(0);
    } else if (preset === 'center') {
      setPanY(0);
      setPanX(0);
    } else if (preset === 'legs') {
      // Shift image up to reveal bottom (legs/feet/dresses)
      setPanY(-25);
      setPanX(0);
    } else if (preset === 'left') {
      // Shift image right to reveal left side (people/arms on left)
      setPanX(25);
    } else if (preset === 'right') {
      // Shift image left to reveal right side
      setPanX(-25);
    }
  };

  const getFilterStyle = (f: PhotoFilterMode): string => {
    switch (f) {
      case 'bw':
        return 'grayscale(100%) contrast(105%)';
      case 'warm':
        return 'sepia(30%) saturate(120%)';
      case 'vintage':
        return 'sepia(50%) contrast(90%) brightness(105%)';
      case 'soft':
        return 'brightness(108%) contrast(92%)';
      default:
        return 'none';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#2C2420]/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-3xl w-full overflow-hidden flex flex-col border border-[#DDD3C5] shadow-2xl max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFD5] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center shrink-0 shadow-xs">
              <Move className="w-5 h-5 text-[#EAE0D5]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EFE8DE] text-[#5A4638] text-[10px] font-bold uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3 h-3 text-[#8C5E3C]" />
                Enquadramento Anti-Corte Villa7
              </div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C2420]">
                Ajustar Enquadramento da Foto
              </h3>
              <p className="text-xs text-[#7A685B] hidden sm:block">
                Arraste a foto diretamente para ajustar o enquadramento e evitar cortes indesejados.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A685B] hover:bg-[#EFE8DE] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Interactive Preview Stage (Drag directly on the image) */}
        <div className="p-4 sm:p-6 bg-[#261E1A] flex flex-col items-center justify-center relative overflow-hidden select-none">
          {/* Instructions banner on stage */}
          <div className="mb-3 flex items-center justify-between w-full max-w-md text-xs text-[#EAE0D5]">
            <span className="flex items-center gap-1.5 font-medium">
              <Move className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <strong>Dica:</strong> Clique e arraste na foto para ajustar o enquadramento
            </span>
            <button
              type="button"
              onClick={() => setShowGuides(!showGuides)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border flex items-center gap-1 transition-colors ${
                showGuides
                  ? 'bg-[#3D2C24] text-white border-[#8C5E3C]'
                  : 'bg-transparent text-[#DDD3C5] border-[#5A4638]'
              }`}
            >
              <Grid3X3 className="w-3 h-3 text-amber-400" />
              {showGuides ? 'Guias Ativas' : 'Ocultar Guias'}
            </button>
          </div>

          {/* Canvas Box representing the slot */}
          <div
            ref={previewBoxRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`relative w-full max-w-md aspect-[3/2] bg-[#FFFFFF] rounded-2xl overflow-hidden border-2 shadow-2xl transition-all ${
              isDragging
                ? 'cursor-grabbing border-amber-400 ring-4 ring-amber-400/30 scale-[1.01]'
                : 'cursor-grab border-[#D9C1AA] hover:border-amber-300'
            }`}
          >
            <img
              src={photo.url}
              alt={photo.name}
              draggable={false}
              className="w-full h-full pointer-events-none transition-transform duration-75"
              style={{
                objectFit: fit === 'contain' ? 'contain' : 'cover',
                transform: `scale(${zoom}) translate(${panX}%, ${panY}%)`,
                filter: getFilterStyle(filter),
              }}
            />

            {/* Visual Safe Zone & Composition Guides */}
            {showGuides && (
              <div className="absolute inset-0 pointer-events-none border border-white/20">
                {/* Rule of Thirds Lines */}
                <div className="absolute inset-x-0 top-1/3 h-px bg-white/30" />
                <div className="absolute inset-x-0 top-2/3 h-px bg-white/30" />
                <div className="absolute inset-y-0 left-1/3 w-px bg-white/30" />
                <div className="absolute inset-y-0 left-2/3 w-px bg-white/30" />

                {/* Safe Margins (Proteção de Cabeça no topo, Pernas na base, Braços nas laterais) */}
                <div className="absolute top-1.5 inset-x-2 flex items-center justify-between text-[9px] font-mono text-emerald-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                  <span>👤 Zona Segura Cabeça & Rosto</span>
                  <span>Topo</span>
                </div>
                <div className="absolute bottom-1.5 inset-x-2 flex items-center justify-between text-[9px] font-mono text-emerald-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
                  <span>🚶 Zona Segura Pernas & Vestido</span>
                  <span>Base</span>
                </div>

                {/* Center crosshair */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border border-amber-400/80 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-amber-400 rounded-full" />
                </div>
              </div>
            )}

            {/* Status pills inside stage */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5 pointer-events-none">
              <span className="px-2 py-0.5 rounded-md bg-[#2C2420]/85 text-[#FAF7F2] text-[10px] font-mono shadow-xs backdrop-blur-xs">
                Zoom: {zoom.toFixed(1)}x
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#2C2420]/85 text-amber-300 text-[10px] font-mono shadow-xs backdrop-blur-xs">
                Pan: ({panX > 0 ? `+${panX}` : panX}%, {panY > 0 ? `+${panY}` : panY}%)
              </span>
            </div>

            {isDragging && (
              <div className="absolute inset-0 bg-amber-500/10 pointer-events-none flex items-center justify-center">
                <span className="bg-[#2C2420]/90 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                  Arrastando Enquadramento...
                </span>
              </div>
            )}
          </div>

          {/* Quick Focal Presets Row (1-click auto align to protect heads/legs) */}
          <div className="mt-3.5 flex items-center justify-center gap-2 flex-wrap max-w-md w-full">
            <span className="text-[11px] font-semibold text-[#DDD3C5] mr-1">
              Atalhos de Enquadramento:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('head')}
              className="px-2.5 py-1 rounded-lg bg-[#3D2C24] hover:bg-[#5A3822] text-[#FAF7F2] text-xs font-semibold flex items-center gap-1 transition-colors border border-[#6F452A] shadow-xs"
              title="Ajusta o corte para proteger a cabeça e o rosto no topo"
            >
              <ArrowDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Proteger Cabeça</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('center')}
              className="px-2.5 py-1 rounded-lg bg-[#3D2C24] hover:bg-[#5A3822] text-[#FAF7F2] text-xs font-semibold flex items-center gap-1 transition-colors border border-[#6F452A] shadow-xs"
              title="Centraliza a foto exatamente no meio"
            >
              <span>⚖️ Centro</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('legs')}
              className="px-2.5 py-1 rounded-lg bg-[#3D2C24] hover:bg-[#5A3822] text-[#FAF7F2] text-xs font-semibold flex items-center gap-1 transition-colors border border-[#6F452A] shadow-xs"
              title="Ajusta o corte para proteger pernas, pés e vestido"
            >
              <ArrowUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Proteger Pernas</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('left')}
              className="px-2 py-1 rounded-lg bg-[#3D2C24] hover:bg-[#5A3822] text-[#FAF7F2] text-xs font-semibold flex items-center gap-1 transition-colors border border-[#6F452A]"
              title="Ajusta para a esquerda"
            >
              <ArrowRight className="w-3 h-3 text-amber-400" />
              <span>Esq.</span>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('right')}
              className="px-2 py-1 rounded-lg bg-[#3D2C24] hover:bg-[#5A3822] text-[#FAF7F2] text-xs font-semibold flex items-center gap-1 transition-colors border border-[#6F452A]"
              title="Ajusta para a direita"
            >
              <ArrowLeft className="w-3 h-3 text-amber-400" />
              <span>Dir.</span>
            </button>
          </div>
        </div>

        {/* Controls Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto max-h-72">
          {/* Fit Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-2xl border border-[#E8DFD5]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#3D2C24] block">
                Modo de Enquadramento no Slot
              </span>
              <span className="text-[11px] text-[#7A685B]">
                {fit === 'cover'
                  ? 'Preenche todo o espaço (use o arrasto acima para ajustar a posição)'
                  : 'Exibe 100% da foto sem nenhum corte, com fundo branco elegante'}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setFit('cover')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  fit === 'cover'
                    ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#5A4638] border border-[#DDD3C5] hover:bg-[#EFE8DE]'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                Preencher Slot
              </button>
              <button
                type="button"
                onClick={() => setFit('contain')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  fit === 'contain'
                    ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                    : 'bg-[#FAF7F2] text-[#5A4638] border border-[#DDD3C5] hover:bg-[#EFE8DE]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Sem Cortes (100%)
              </button>
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="p-3 bg-white rounded-2xl border border-[#E8DFD5]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#5A4638] mb-1.5">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-[#8C5E3C]" />
                Ampliação / Zoom
              </span>
              <span className="font-mono font-bold text-[#8C5E3C]">{zoom.toFixed(1)}x</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.1).toFixed(1)))}
                disabled={zoom <= 1}
                className="p-1 rounded-lg bg-[#FAF7F2] border border-[#DDD3C5] text-[#5A4638] disabled:opacity-30"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="1"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-[#8C5E3C] cursor-pointer"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.1).toFixed(1)))}
                disabled={zoom >= 2.5}
                className="p-1 rounded-lg bg-[#FAF7F2] border border-[#DDD3C5] text-[#5A4638] disabled:opacity-30"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Fine Tuning Position Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-2xl border border-[#E8DFD5]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#5A4638] mb-1">
                <span>Posição Horizontal (Esquerda / Direita)</span>
                <span className="font-mono text-[#8C5E3C]">{panX}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={panX}
                onChange={(e) => setPanX(parseInt(e.target.value, 10))}
                className="w-full accent-[#8C5E3C] cursor-pointer"
              />
            </div>

            <div className="p-3 bg-white rounded-2xl border border-[#E8DFD5]">
              <div className="flex items-center justify-between text-xs font-semibold text-[#5A4638] mb-1">
                <span>Posição Vertical (Topo / Base)</span>
                <span className="font-mono text-[#8C5E3C]">{panY}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="1"
                value={panY}
                onChange={(e) => setPanY(parseInt(e.target.value, 10))}
                className="w-full accent-[#8C5E3C] cursor-pointer"
              />
            </div>
          </div>

          {/* Filter Tonalities */}
          <div className="p-3 bg-white rounded-2xl border border-[#E8DFD5]">
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#7A685B] mb-2">
              Tonalidade Fotográfica:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'none', label: 'Original' },
                { id: 'bw', label: 'P&B Nobre' },
                { id: 'warm', label: 'Aconchegante' },
                { id: 'vintage', label: 'Vintage' },
                { id: 'soft', label: 'Luz Suave' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id as PhotoFilterMode)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-medium text-center transition-all ${
                    filter === f.id
                      ? 'bg-[#3D2C24] text-[#FAF7F2] font-semibold shadow-xs'
                      : 'bg-[#FAF7F2] text-[#5A4638] hover:bg-[#EFE8DE] border border-[#DDD3C5]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-[#E8DFD5] bg-[#FAF7F2] flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#7A685B] hover:bg-[#EFE8DE] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restaurar Padrão
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5A4638] hover:bg-[#EFE8DE] transition-colors border border-[#DDD3C5]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#3D2C24] hover:bg-[#2C2420] text-[#FAF7F2] transition-colors shadow-md hover:scale-[1.02]"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              Salvar Enquadramento
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
