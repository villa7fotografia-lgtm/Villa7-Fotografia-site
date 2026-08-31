import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen, Layers, Maximize2, CheckCircle2 } from 'lucide-react';
import { AlbumProject, PhotoItem } from '../../types';
import { sanitizeSpreads } from '../../utils/spreadOptimizer';

interface AlbumFlipbookModalProps {
  isOpen: boolean;
  project: AlbumProject;
  onClose: () => void;
}

export const AlbumFlipbookModal: React.FC<AlbumFlipbookModalProps> = ({
  isOpen,
  project,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0); // 0 = Cover, 1..N = Spreads

  if (!isOpen) return null;

  const validSpreads = project.photos.length > 0
    ? sanitizeSpreads(project.spreads, project.photos)
    : project.spreads;

  const totalViews = validSpreads.length + 1; // Cover + Spreads
  const photosMap = new Map<string, PhotoItem>();
  project.photos.forEach((p) => photosMap.set(p.id, p));

  const isCover = currentIndex === 0;
  const currentSpread = !isCover ? validSpreads[currentIndex - 1] : null;

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < totalViews - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-[#2C2420]/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-6xl w-full max-h-[96vh] overflow-hidden flex flex-col border border-[#DDD3C5] shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFD5] flex items-center justify-between bg-[#FAF7F2]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#EAE0D5]" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C2420] flex items-center gap-2">
                {project.clientData.albumTitle || 'Álbum Fotográfico'}
                <span className="text-xs font-normal font-sans text-[#7A685B]">
                  • Formato 15x20 cm Vertical (Aberto 20x30 cm)
                </span>
              </h3>
              <p className="text-xs text-[#8C7A6B]">
                {isCover
                  ? 'Visualização da Capa do Álbum (15x20 cm)'
                  : `Lâmina ${currentIndex} de ${project.spreads.length} (Páginas ${(currentIndex - 1) * 2 + 1}-${(currentIndex - 1) * 2 + 2})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#7A685B] hover:bg-[#EFE8DE] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Central Book Stage (20x30 cm / 3:2 ratio) */}
        <div className="flex-1 p-4 sm:p-8 bg-[#EBE4DC] flex items-center justify-center overflow-auto min-h-[300px] sm:min-h-[460px]">
          <div className="relative w-full max-w-3xl aspect-[3/2] bg-[#FFFFFF] rounded-2xl shadow-2xl overflow-hidden border border-[#D9CFC4] flex flex-col justify-between">
            {/* Book Crease Shadow in the exact center */}
            <div className="absolute inset-y-0 left-1/2 w-0.5 bg-black/15 -translate-x-1/2 pointer-events-none z-20" />

            {isCover ? (
              /* Cover View */
              <div
                className="w-full h-full flex"
                style={{ backgroundColor: project.cover.bgColor || '#FFFFFF' }}
              >
                {/* Back Cover (Left Page 15x20) */}
                <div className="w-1/2 h-full flex flex-col items-center justify-center p-6 border-r border-[#D9CFC4]/50 bg-[#FAF7F2]">
                  <span className="font-serif text-lg font-bold tracking-widest text-[#8C7A6B]">
                    VILLA7 ÁLBUNS
                  </span>
                  <span className="text-[11px] uppercase tracking-wider text-[#A39282] mt-1 font-sans">
                    Memórias Colecionáveis • 15x20
                  </span>
                </div>

                {/* Front Cover (Right Page 15x20) */}
                <div className="w-1/2 h-full flex flex-col items-center justify-center p-6 text-center bg-[#FFFFFF]">
                  {project.cover.imageUrl ? (
                    <div className="w-44 h-52 bg-white p-1.5 rounded-xl shadow-md mb-3 overflow-hidden border border-[#DDD3C5]">
                      <img
                        src={project.cover.imageUrl}
                        alt="Capa"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-44 h-52 bg-[#FAF7F2] rounded-xl flex items-center justify-center text-[#8C7A6B] text-xs mb-3 border border-[#DDD3C5]">
                      Arte de Capa 15x20
                    </div>
                  )}

                  <h3 className="font-serif text-base sm:text-xl font-bold text-[#2C2420]">
                    {project.cover.title || project.clientData.albumTitle || 'Álbum de Memórias'}
                  </h3>
                  <p className="font-serif italic text-xs text-[#6E5C50] mt-1">
                    {project.cover.subtitle || project.clientData.albumSubtitle || 'Momentos Especiais'}
                  </p>
                  <span className="text-[11px] text-[#A39282] mt-1.5 block font-sans">
                    {project.cover.yearOrDate || new Date().getFullYear()}
                  </span>
                </div>
              </div>
            ) : currentSpread ? (
              /* Spread View - 100% Pure White miolo */
              <div
                className="w-full h-full relative"
                style={{ backgroundColor: currentSpread.backgroundColor || '#FFFFFF' }}
              >
                {currentSpread.slots.map((slot, sIdx) => {
                  const photo = slot.photoId ? photosMap.get(slot.photoId) : null;

                  return (
                    <div
                      key={slot.id || sIdx}
                      className="absolute overflow-hidden"
                      style={{
                        left: `${slot.x}%`,
                        top: `${slot.y}%`,
                        width: `${slot.width}%`,
                        height: `${slot.height}%`,
                      }}
                    >
                      {photo ? (
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full"
                          style={{
                            objectFit: slot.fit || 'cover',
                            transform: `scale(${slot.zoom || 1}) translate(${slot.panX || 0}%, ${slot.panY || 0}%)`,
                            filter:
                              slot.filter === 'bw'
                                ? 'grayscale(100%) contrast(105%)'
                                : slot.filter === 'warm'
                                ? 'sepia(30%) saturate(120%)'
                                : slot.filter === 'vintage'
                                ? 'sepia(50%) contrast(90%)'
                                : slot.filter === 'soft'
                                ? 'brightness(108%) contrast(92%)'
                                : 'none',
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#FAF7F2] flex items-center justify-center text-xs text-[#A39282] border border-dashed border-[#DDD3C5]">
                          Espaço para Foto
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Footer discrete caption */}
                <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-[10px] text-[#8C7A6B]/80 font-sans pointer-events-none">
                  <span>
                    VILLA7 ÁLBUNS • Lâmina {currentIndex} de {validSpreads.length}
                  </span>
                  <span>
                    Páginas {(currentIndex - 1) * 2 + 1} - {(currentIndex - 1) * 2 + 2}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Bottom Navigation & Spread Thumbnails */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E8DFD5] flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentIndex > 0
                ? 'bg-[#FFFFFF] text-[#3D2C24] hover:bg-[#EFE8DE] border border-[#DDD3C5]'
                : 'opacity-40 cursor-not-allowed text-[#A39282]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Lâmina Anterior
          </button>

          {/* Quick thumbnails strip */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto max-w-lg scrollbar-none py-1">
            {Array.from({ length: totalViews }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-10 h-7 rounded text-[10px] font-bold shrink-0 transition-all border ${
                  currentIndex === i
                    ? 'bg-[#3D2C24] text-[#FAF7F2] border-[#3D2C24] scale-110'
                    : 'bg-[#FFFFFF] text-[#7A685B] border-[#DDD3C5] hover:bg-[#EFE8DE]'
                }`}
              >
                {i === 0 ? 'Capa' : `L${i}`}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === totalViews - 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentIndex < totalViews - 1
                ? 'bg-[#3D2C24] text-[#FAF7F2] hover:bg-[#2C2420] shadow-xs'
                : 'opacity-40 cursor-not-allowed text-[#A39282]'
            }`}
          >
            Próxima Lâmina
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
