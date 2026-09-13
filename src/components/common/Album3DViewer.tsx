import React, { useState, useRef, useEffect } from 'react';
import {
  Rotate3d,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Check,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { AlbumProject, PhotoItem, SpreadItem } from '../../types';
import { sanitizeSpreads } from '../../utils/spreadOptimizer';

interface Album3DViewerProps {
  project: AlbumProject;
  className?: string;
}

export const Album3DViewer: React.FC<Album3DViewerProps> = ({ project, className = '' }) => {
  const [isOpen, setIsOpen] = useState(true); // Closed vs Open
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0); // 0..N-1
  const [rotationX, setRotationX] = useState(12); // subtle tilt
  const [rotationY, setRotationY] = useState(-8); // subtle angle
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const photosMap = new Map<string, PhotoItem>();
  project.photos.forEach((p) => photosMap.set(p.id, p));

  const validSpreads = project.photos.length > 0
    ? sanitizeSpreads(project.spreads, project.photos)
    : project.spreads;

  const totalSpreads = validSpreads.length;
  const currentSpread = validSpreads[currentSpreadIndex] || validSpreads[0];

  // Mouse rotation handler
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setRotationY((prev) => Math.max(-45, Math.min(45, prev + deltaX * 0.3)));
    setRotationX((prev) => Math.max(-25, Math.min(35, prev - deltaY * 0.3)));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch rotation handler
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - dragStart.x;
    const deltaY = e.touches[0].clientY - dragStart.y;
    setRotationY((prev) => Math.max(-45, Math.min(45, prev + deltaX * 0.3)));
    setRotationX((prev) => Math.max(-25, Math.min(35, prev - deltaY * 0.3)));
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const handleNextSpread = () => {
    if (currentSpreadIndex < totalSpreads - 1 && !isFlipping) {
      setFlipDirection('next');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpreadIndex((prev) => prev + 1);
        setIsFlipping(false);
      }, 400);
    }
  };

  const handlePrevSpread = () => {
    if (currentSpreadIndex > 0 && !isFlipping) {
      setFlipDirection('prev');
      setIsFlipping(true);
      setTimeout(() => {
        setCurrentSpreadIndex((prev) => prev - 1);
        setIsFlipping(false);
      }, 400);
    }
  };

  const resetPerspective = () => {
    setRotationX(12);
    setRotationY(-8);
    setZoom(1);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Foil style
  const getFoilStyle = () => {
    const foil = project.cover.foilColor || 'gold';
    switch (foil) {
      case 'gold':
        return 'text-[#B39770] drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]';
      case 'silver':
        return 'text-[#A0A5AA] drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]';
      case 'rose':
        return 'text-[#C59B9B] drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]';
      case 'white':
        return 'text-[#FFFFFF] drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]';
      case 'black':
      default:
        return 'text-[#211D19]';
    }
  };

  const coverBg = project.cover.bgColor || '#F7F3EC';

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl bg-[#ECE4DA] border border-[#DDD3C5] shadow-lg overflow-hidden flex flex-col ${className}`}
    >
      {/* Top Bar with Emotion Heading & Viewer Controls */}
      <div className="p-4 sm:p-5 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E5DACD] flex flex-wrap items-center justify-between gap-3 z-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#B39770]/20 text-[#6E5536] rounded-md">
              Visualização 3D Realista
            </span>
            <span className="text-xs text-[#8C7A6B]">
              Formato 15x20 cm Vertical • Aberto 20x30 cm
            </span>
          </div>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#211D19] mt-0.5">
            Agora veja sua história como ela ficará em suas mãos.
          </h3>
        </div>

        {/* Viewer Tools */}
        <div className="flex items-center gap-2">
          {/* Open / Closed Toggle */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              isOpen
                ? 'bg-[#3D2C24] text-[#FAF7F2] border-[#2C2420] shadow-xs'
                : 'bg-[#FAF7F2] text-[#3D2C24] border-[#DDD3C5] hover:bg-[#F2ECE4]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-[#B39770]" />
            <span>{isOpen ? 'Álbum Aberto' : 'Álbum Fechado'}</span>
          </button>

          {/* Reset Orbit */}
          <button
            type="button"
            onClick={resetPerspective}
            className="p-2 rounded-xl bg-[#FAF7F2] text-[#6B5749] hover:bg-[#F2ECE4] border border-[#DDD3C5] transition-colors"
            title="Redefinir ângulo de visão 3D"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.75, z - 0.1))}
            className="p-2 rounded-xl bg-[#FAF7F2] text-[#6B5749] hover:bg-[#F2ECE4] border border-[#DDD3C5] transition-colors"
            title="Diminuir Zoom"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          {/* Zoom In */}
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))}
            className="p-2 rounded-xl bg-[#FAF7F2] text-[#6B5749] hover:bg-[#F2ECE4] border border-[#DDD3C5] transition-colors"
            title="Aumentar Zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#FAF7F2] text-[#6B5749] hover:bg-[#F2ECE4] border border-[#DDD3C5] transition-colors"
            title="Tela cheia"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D Canvas / Stage */}
      <div
        className="relative w-full h-[460px] sm:h-[560px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ perspective: '1600px' }}
      >
        {/* Subtle Ambient Light Floor Shadow */}
        <div
          className="absolute w-[500px] h-[120px] bg-black/20 rounded-full blur-2xl pointer-events-none"
          style={{
            transform: `translateY(220px) scale(${zoom})`,
          }}
        />

        {/* 3D BOOK CONTAINER */}
        <div
          className="transition-transform duration-100 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `scale(${zoom}) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
          }}
        >
          {/* ========================================================= */}
          {/* MODE 1: OPEN ALBUM SPREAD (20x30 cm aberto, 3:2 aspect)   */}
          {/* ========================================================= */}
          {isOpen ? (
            <div
              className={`relative w-[340px] sm:w-[620px] aspect-[3/2] rounded-r-lg rounded-l-lg bg-white shadow-2xl transition-all duration-300 ${
                isFlipping ? 'scale-[0.98]' : 'scale-100'
              }`}
              style={{
                boxShadow:
                  '0 25px 50px -12px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(0,0,0,0.06), inset 0 0 15px rgba(0,0,0,0.02)',
              }}
            >
              {/* Hardcover Outer Thickness Border (Capa dura com borda volumétrica) */}
              <div
                className="absolute -inset-1.5 rounded-r-xl rounded-l-xl -z-10 shadow-xl"
                style={{ backgroundColor: coverBg }}
              />

              {/* Book Spine Deep Shadow in Center Crease */}
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-gradient-to-r from-black/15 via-black/25 to-black/15 pointer-events-none z-30 opacity-70" />
              <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-black/40 pointer-events-none z-30" />

              {/* Left & Right Page Spread Content (Miolo Branco Puro #FFFFFF) */}
              <div className="w-full h-full relative overflow-hidden rounded-r-md rounded-l-md bg-white flex">
                {/* Left Page (15x20) */}
                <div className="w-1/2 h-full relative overflow-hidden p-2 sm:p-3 border-r border-[#EAE1D5]/40">
                  {currentSpread?.slots
                    .filter((s) => s.x + s.width / 2 <= 50)
                    .map((slot) => {
                      const photo = slot.photoId ? photosMap.get(slot.photoId) : null;
                      return (
                        <div
                          key={slot.id}
                          className="absolute overflow-hidden bg-[#FAF7F2] rounded-xs transition-transform"
                          style={{
                            left: `${slot.x * 2}%`,
                            top: `${slot.y}%`,
                            width: `${slot.width * 2}%`,
                            height: `${slot.height}%`,
                          }}
                        >
                          {photo ? (
                            <img
                              src={photo.url}
                              alt={photo.name}
                              className="w-full h-full object-cover pointer-events-none"
                              style={{
                                transform: `scale(${slot.zoom || 1}) translate(${slot.panX || 0}%, ${slot.panY || 0}%)`,
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#A39282] italic">
                              Foto
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Right Page (15x20) */}
                <div className="w-1/2 h-full relative overflow-hidden p-2 sm:p-3">
                  {currentSpread?.slots
                    .filter((s) => s.x + s.width / 2 > 50)
                    .map((slot) => {
                      const photo = slot.photoId ? photosMap.get(slot.photoId) : null;
                      return (
                        <div
                          key={slot.id}
                          className="absolute overflow-hidden bg-[#FAF7F2] rounded-xs transition-transform"
                          style={{
                            left: `${(slot.x - 50) * 2}%`,
                            top: `${slot.y}%`,
                            width: `${slot.width * 2}%`,
                            height: `${slot.height}%`,
                          }}
                        >
                          {photo ? (
                            <img
                              src={photo.url}
                              alt={photo.name}
                              className="w-full h-full object-cover pointer-events-none"
                              style={{
                                transform: `scale(${slot.zoom || 1}) translate(${slot.panX || 0}%, ${slot.panY || 0}%)`,
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-[#A39282] italic">
                              Foto
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Spreads crossing the gutter (Panoramics) */}
                {currentSpread?.slots
                  .filter((s) => s.x < 50 && s.x + s.width > 50)
                  .map((slot) => {
                    const photo = slot.photoId ? photosMap.get(slot.photoId) : null;
                    return (
                      <div
                        key={slot.id}
                        className="absolute overflow-hidden bg-[#FAF7F2] rounded-xs z-10"
                        style={{
                          left: `${slot.x}%`,
                          top: `${slot.y}%`,
                          width: `${slot.width}%`,
                          height: `${slot.height}%`,
                        }}
                      >
                        {photo && (
                          <img
                            src={photo.url}
                            alt={photo.name}
                            className="w-full h-full object-cover pointer-events-none"
                            style={{
                              transform: `scale(${slot.zoom || 1}) translate(${slot.panX || 0}%, ${slot.panY || 0}%)`,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
              </div>

              {/* Page Curl & Turn Effect */}
              {isFlipping && (
                <div
                  className={`absolute inset-y-0 w-1/2 pointer-events-none z-40 bg-gradient-to-r ${
                    flipDirection === 'next'
                      ? 'right-0 from-black/10 via-white/40 to-transparent animate-pulse'
                      : 'left-0 from-transparent via-white/40 to-black/10 animate-pulse'
                  }`}
                />
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* MODE 2: CLOSED ALBUM (15x20 Vertical com Capa Dura & Lombada) */
            /* ========================================================= */
            <div
              className="relative w-[240px] sm:w-[320px] aspect-[2/3] rounded-r-xl rounded-l-md shadow-2xl overflow-hidden flex flex-col justify-between p-6 sm:p-8"
              style={{
                backgroundColor: coverBg,
                boxShadow:
                  '0 30px 60px -15px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08), inset 0 0 20px rgba(0,0,0,0.05)',
              }}
            >
              {/* Left Spine Thickness Simulation (Área da Lombada 2 x 6 cm) */}
              <div className="absolute inset-y-0 left-0 w-4 bg-black/15 shadow-inner" />

              {/* Cover Top Header */}
              <div className="text-center z-10">
                <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C7A6B]">
                  Villa7 Álbuns
                </span>
              </div>

              {/* Center Main Cover Image */}
              <div className="my-auto flex flex-col items-center justify-center z-10">
                {project.cover.imageUrl ? (
                  <div className="w-36 sm:w-48 aspect-[3/4] bg-white p-1.5 rounded-lg shadow-lg overflow-hidden border border-black/10">
                    <img
                      src={project.cover.imageUrl}
                      alt="Capa do Álbum"
                      className="w-full h-full object-cover"
                      style={{
                        transform: `scale(${project.cover.photoZoom || 1}) translate(${project.cover.photoPanX || 0}%, ${project.cover.photoPanY || 0}%)`,
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-36 sm:w-48 aspect-[3/4] rounded-lg border-2 border-dashed border-[#DDD3C5] flex flex-col items-center justify-center p-3 text-center">
                    <Sparkles className="w-6 h-6 text-[#B39770] mb-2" />
                    <span className="text-xs font-serif font-bold text-[#6B5749]">
                      Capa com Direção IA
                    </span>
                  </div>
                )}
              </div>

              {/* Cover Typography with Foil Effect */}
              <div className="text-center space-y-1 z-10">
                <h4
                  className={`font-serif text-lg sm:text-xl font-bold tracking-wide ${getFoilStyle()}`}
                >
                  {project.cover.title || project.clientData.albumTitle || 'Nossas Memórias'}
                </h4>
                <p className="text-xs font-sans text-[#7A685B]">
                  {project.cover.subtitle || project.clientData.albumSubtitle || 'Momentos Especiais'}
                </p>
                <p className="text-[10px] font-sans font-medium text-[#9A9187]">
                  {project.cover.yearOrDate || '2026'}
                </p>
              </div>

              {/* Discrete Spine Text Tag */}
              <div className="absolute bottom-2 left-2 text-[8px] uppercase tracking-widest text-[#9A9187]/60 rotate-90 origin-bottom-left pointer-events-none">
                {project.cover.spineText || `${project.clientData.albumTitle} • 2026`}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Spread Navigator (when open) */}
      {isOpen && (
        <div className="p-3.5 sm:p-4 bg-[#FAF7F2] border-t border-[#E5DACD] flex items-center justify-between z-20">
          <button
            type="button"
            onClick={handlePrevSpread}
            disabled={currentSpreadIndex === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentSpreadIndex === 0
                ? 'opacity-30 cursor-not-allowed text-[#A39282]'
                : 'bg-[#EAE1D5] hover:bg-[#DDD3C5] text-[#3D2C24]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Página Anterior</span>
          </button>

          <div className="flex items-center gap-2 text-center">
            <span className="font-serif text-sm font-bold text-[#211D19]">
              Lâmina {currentSpreadIndex + 1} de {totalSpreads}
            </span>
            <span className="text-xs text-[#8C7A6B]">
              (Páginas {currentSpreadIndex * 2 + 1}-{currentSpreadIndex * 2 + 2})
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextSpread}
            disabled={currentSpreadIndex >= totalSpreads - 1}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              currentSpreadIndex >= totalSpreads - 1
                ? 'opacity-30 cursor-not-allowed text-[#A39282]'
                : 'bg-[#3D2C24] hover:bg-[#211D19] text-[#FAF7F2]'
            }`}
          >
            <span className="hidden sm:inline">Próxima Página</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Helper text instructions */}
      <div className="px-4 py-2 bg-[#F2ECE4] text-[11px] text-[#7A685B] flex items-center justify-between border-t border-[#E5DACD]/70">
        <span className="flex items-center gap-1.5">
          <Rotate3d className="w-3.5 h-3.5 text-[#B39770]" />
          Arraste com o mouse ou toque para rotacionar o álbum em 3D livremente.
        </span>
        <span className="hidden md:inline font-serif italic text-[#8C7A6B]">
          Villa7 Álbuns • Acabamento Fine Art
        </span>
      </div>
    </div>
  );
};
