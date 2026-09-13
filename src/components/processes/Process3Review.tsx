import React, { useState } from 'react';
import {
  Rotate3d,
  BookOpen,
  Grid,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Sparkles,
  Maximize2,
  ZoomIn,
  Crop,
  Layers,
} from 'lucide-react';
import { AlbumProject, PhotoItem, SpreadItem, SlotLayout } from '../../types';
import { Album3DViewer } from '../common/Album3DViewer';
import { sanitizeSpreads } from '../../utils/spreadOptimizer';
import { PhotoCropModal } from '../modals/PhotoCropModal';

interface Process3ReviewProps {
  project: AlbumProject;
  onChangeSpread?: (spreadIndex: number, updatedSpread: SpreadItem) => void;
  onUpdateSpreads?: (updatedSpreads: SpreadItem[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Process3Review: React.FC<Process3ReviewProps> = ({
  project,
  onChangeSpread,
  onUpdateSpreads,
  onNext,
  onPrev,
}) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d' | 'miniaturas'>('3d');
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState<number>(0);
  const [cropModalSlot, setCropModalSlot] = useState<{
    spreadIndex: number;
    slotIndex: number;
    slot: SlotLayout;
    photo: PhotoItem;
  } | null>(null);

  const validSpreads = project.photos.length > 0
    ? sanitizeSpreads(project.spreads, project.photos)
    : project.spreads;

  const totalSpreads = validSpreads.length;
  const currentSpread = validSpreads[currentSpreadIndex] || validSpreads[0];

  const photosMap = new Map<string, PhotoItem>();
  project.photos.forEach((p) => photosMap.set(p.id, p));

  const handleSaveCropModal = (updatedProps: Partial<SlotLayout>) => {
    if (!cropModalSlot) return;
    const newSpreads = JSON.parse(JSON.stringify(project.spreads)) as SpreadItem[];
    const targetSlot = newSpreads[cropModalSlot.spreadIndex]?.slots[cropModalSlot.slotIndex];
    if (targetSlot) {
      Object.assign(targetSlot, updatedProps);
      if (onUpdateSpreads) {
        onUpdateSpreads(newSpreads);
      } else if (onChangeSpread) {
        onChangeSpread(cropModalSlot.spreadIndex, newSpreads[cropModalSlot.spreadIndex]);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E8DFD5]">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#B39770] block">
            Etapa 3 de 4 • Conferência Final
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#211D19] mt-1">
            Veja como ficou o seu álbum.
          </h2>
          <p className="text-sm text-[#7A685B] mt-1 max-w-2xl">
            Folheie as páginas, confira a capa e veja todos os detalhes antes de aprovar.
          </p>
        </div>

        {/* View Mode Tabs: 2D, 3D, Miniaturas */}
        <div className="flex items-center gap-1.5 p-1 bg-[#EAE0D5] rounded-2xl self-start md:self-auto border border-[#DDD3C5]">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === '3d'
                ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                : 'text-[#5A4638] hover:bg-[#DDD3C5]'
            }`}
          >
            <Rotate3d className="w-3.5 h-3.5 text-[#B39770]" />
            <span>Álbum 3D</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === '2d'
                ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                : 'text-[#5A4638] hover:bg-[#DDD3C5]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Lâmina Aberta (2D)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('miniaturas')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'miniaturas'
                ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                : 'text-[#5A4638] hover:bg-[#DDD3C5]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Miniaturas</span>
          </button>
        </div>
      </div>

      {/* VIEWPORT AREA */}
      {viewMode === '3d' && (
        <div className="space-y-4">
          <div className="bg-[#FAF7F2] p-4 sm:p-6 rounded-3xl border border-[#E8DFD5] shadow-xs">
            <Album3DViewer project={project} />
          </div>
        </div>
      )}

      {viewMode === '2d' && (
        <div className="space-y-4">
          <div className="bg-[#FAF7F2] p-4 sm:p-6 rounded-3xl border border-[#E8DFD5] shadow-xs space-y-4">
            {/* Lâmina Controller Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-[#211D19]">
                  Lâmina {currentSpreadIndex + 1} de {totalSpreads}
                </span>
                <span className="text-xs text-[#7A685B]">
                  (20x30 cm panorâmica • 15x20 cm cada página)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentSpreadIndex === 0}
                  onClick={() => setCurrentSpreadIndex((prev) => Math.max(0, prev - 1))}
                  className="p-2 rounded-xl border border-[#DDD3C5] bg-white text-[#3D2C24] disabled:opacity-40 hover:bg-[#FAF7F2] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-[#8C5E3C]">
                  {currentSpreadIndex + 1} / {totalSpreads}
                </span>
                <button
                  type="button"
                  disabled={currentSpreadIndex >= totalSpreads - 1}
                  onClick={() => setCurrentSpreadIndex((prev) => Math.min(totalSpreads - 1, prev + 1))}
                  className="p-2 rounded-xl border border-[#DDD3C5] bg-white text-[#3D2C24] disabled:opacity-40 hover:bg-[#FAF7F2] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Flat-lay 3:2 Canvas (20x30 cm aberto) */}
            <div className="relative w-full aspect-[3/2] bg-[#FFFFFF] rounded-2xl overflow-hidden border-2 border-[#D9CFC4] shadow-md select-none">
              {currentSpread.slots.map((slot, sIdx) => {
                const photo = slot.photoId ? photosMap.get(slot.photoId) : null;
                return (
                  <div
                    key={slot.id}
                    style={{
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      width: `${slot.width}%`,
                      height: `${slot.height}%`,
                    }}
                    className="absolute p-2 sm:p-3 overflow-hidden"
                  >
                    <div className="w-full h-full rounded-lg overflow-hidden bg-[#FAF7F2] border border-[#DDD3C5] relative group shadow-2xs">
                      {photo ? (
                        <>
                          <img
                            src={photo.url}
                            alt=""
                            className="w-full h-full object-cover transition-transform"
                            style={{
                              transform: `scale(${slot.zoom || 1}) translate(${slot.panX || 0}%, ${slot.panY || 0}%)`,
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setCropModalSlot({
                                spreadIndex: currentSpreadIndex,
                                slotIndex: sIdx,
                                slot,
                                photo,
                              })
                            }
                            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] cursor-pointer"
                          >
                            <Crop className="w-3 h-3" />
                            <span>Enquadrar</span>
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#A39282]">
                          Espaço vazio
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Central Spine Fold Line */}
              <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-black/25 to-transparent pointer-events-none -translate-x-1/2 shadow-xs" />
            </div>
          </div>
        </div>
      )}

      {viewMode === 'miniaturas' && (
        <div className="space-y-4">
          <div className="bg-[#FAF7F2] p-6 rounded-3xl border border-[#E8DFD5] shadow-xs space-y-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#211D19]">
                Visão Geral das 10 Lâminas
              </h3>
              <p className="text-xs text-[#7A685B]">
                Clique em qualquer lâmina para abri-la e conferir em tamanho ampliado:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {validSpreads.map((spread, idx) => {
                const firstSlotPhoto = spread.slots.find((s) => s.photoId)
                  ? photosMap.get(spread.slots.find((s) => s.photoId)!.photoId!)
                  : null;

                return (
                  <div
                    key={spread.id}
                    onClick={() => {
                      setCurrentSpreadIndex(idx);
                      setViewMode('2d');
                    }}
                    className="p-3 rounded-2xl bg-white border border-[#DDD3C5] hover:border-[#B39770] hover:shadow-md cursor-pointer transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#211D19]">
                      <span>Lâmina {idx + 1}</span>
                      <span className="text-[10px] text-[#B39770] group-hover:underline">
                        Ver 2D
                      </span>
                    </div>

                    <div className="w-full aspect-[3/2] bg-[#FAF7F2] rounded-xl overflow-hidden border border-[#E8DFD5] relative flex items-center justify-center">
                      {firstSlotPhoto ? (
                        <img
                          src={firstSlotPhoto.url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <span className="text-[10px] text-[#A39282]">Sem fotos</span>
                      )}
                      <div className="absolute inset-y-0 left-1/2 w-px bg-black/20" />
                    </div>

                    <div className="text-[10px] text-[#7A685B] flex items-center justify-between">
                      <span>{spread.slots.filter((s) => s.photoId).length} fotos</span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#E8DFD5]">
        <button
          type="button"
          onClick={onPrev}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#DDD3C5] bg-white hover:bg-[#FAF7F2] text-xs sm:text-sm font-semibold text-[#5A4638] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>QUERO AJUSTAR</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#3D2C24] hover:bg-[#211D19] text-[#FAF7F2] text-xs sm:text-sm font-bold shadow-md hover:scale-[1.01] transition-all cursor-pointer"
        >
          <span>ESTÁ PERFEITO, CONTINUAR</span>
          <ArrowRight className="w-4 h-4 text-[#B39770]" />
        </button>
      </div>

      {/* Crop Modal */}
      {cropModalSlot && (
        <PhotoCropModal
          isOpen={true}
          slot={cropModalSlot.slot}
          photo={cropModalSlot.photo}
          onSave={handleSaveCropModal}
          onClose={() => setCropModalSlot(null)}
        />
      )}
    </div>
  );
};
