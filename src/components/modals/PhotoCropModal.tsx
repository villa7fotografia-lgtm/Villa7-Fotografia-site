import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Move, Sliders, Check, RefreshCw } from 'lucide-react';
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
  if (!isOpen || !slot || !photo) return null;

  const [zoom, setZoom] = useState<number>(slot.zoom || 1);
  const [panX, setPanX] = useState<number>(slot.panX || 0);
  const [panY, setPanY] = useState<number>(slot.panY || 0);
  const [fit, setFit] = useState<PhotoFitMode>(slot.fit || 'cover');
  const [filter, setFilter] = useState<PhotoFilterMode>(slot.filter || 'none');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2420]/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-2xl w-full overflow-hidden flex flex-col border border-[#DDD3C5] shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-[#E8DFD5] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2C2420]">
              Ajuste de Enquadramento & Zoom da Foto
            </h3>
            <p className="text-xs text-[#7A685B]">
              Ajuste o posicionamento (pan), ampliação (zoom) e tonalidade sem distorcer a proporção.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A685B] hover:bg-[#EFE8DE] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Stage */}
        <div className="p-6 bg-[#2C2420]/5 flex items-center justify-center">
          <div
            className="relative w-72 h-48 bg-[#EFE8DE] rounded-xl overflow-hidden border-2 border-[#8C5E3C] shadow-inner flex items-center justify-center"
          >
            <img
              src={photo.url}
              alt={photo.name}
              style={{
                width: fit === 'contain' ? 'auto' : '100%',
                height: fit === 'contain' ? 'auto' : '100%',
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: fit,
                transform: `scale(${zoom}) translate(${panX}%, ${panY}%)`,
                filter: getFilterStyle(filter),
                transition: 'transform 0.1s ease-out',
              }}
            />

            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#2C2420]/80 text-[#FAF7F2] text-[10px] font-mono">
              Zoom: {zoom.toFixed(1)}x | Pan: ({panX}%, {panY}%)
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-72">
          {/* Fit mode */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7A685B]">
              Modo de Ajuste:
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFit('cover')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  fit === 'cover'
                    ? 'bg-[#3D2C24] text-[#FAF7F2]'
                    : 'bg-[#FFFFFF] text-[#5A4638] border border-[#DDD3C5]'
                }`}
              >
                Preencher Slot (Cover)
              </button>
              <button
                type="button"
                onClick={() => setFit('contain')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  fit === 'contain'
                    ? 'bg-[#3D2C24] text-[#FAF7F2]'
                    : 'bg-[#FFFFFF] text-[#5A4638] border border-[#DDD3C5]'
                }`}
              >
                Foto Inteira (Letterbox)
              </button>
            </div>
          </div>

          {/* Zoom Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-[#7A685B] mb-1">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-[#8C5E3C]" />
                Zoom / Ampliação
              </span>
              <span className="font-mono">{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[#8C5E3C] cursor-pointer"
            />
          </div>

          {/* Pan X / Pan Y */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#7A685B] mb-1">
                <span>Posição Horizontal (X)</span>
                <span className="font-mono">{panX}%</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                step="2"
                value={panX}
                onChange={(e) => setPanX(parseInt(e.target.value))}
                className="w-full accent-[#8C5E3C] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#7A685B] mb-1">
                <span>Posição Vertical (Y)</span>
                <span className="font-mono">{panY}%</span>
              </div>
              <input
                type="range"
                min="-40"
                max="40"
                step="2"
                value={panY}
                onChange={(e) => setPanY(parseInt(e.target.value))}
                className="w-full accent-[#8C5E3C] cursor-pointer"
              />
            </div>
          </div>

          {/* Filter Tonalities */}
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wider text-[#7A685B] mb-2">
              Tonalidade Fotográfica:
            </span>
            <div className="grid grid-cols-5 gap-2">
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
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center transition-all ${
                    filter === f.id
                      ? 'bg-[#3D2C24] text-[#FAF7F2] font-semibold'
                      : 'bg-[#FFFFFF] text-[#5A4638] hover:bg-[#EFE8DE] border border-[#DDD3C5]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[#E8DFD5] bg-[#FAF7F2] flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#7A685B] hover:bg-[#EFE8DE] transition-colors"
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
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-[#3D2C24] hover:bg-[#2C2420] text-[#FAF7F2] transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Aplicar ao Álbum
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
