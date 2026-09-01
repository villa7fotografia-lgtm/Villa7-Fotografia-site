import React, { useState } from 'react';
import { Sparkles, Eye, Layers, ShieldCheck, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { IMAGE_ASSETS, STUDIO_SHOWCASE_FEATURES } from '../constants/imageAssets';

export const StudioHeroShowcase: React.FC = () => {
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  return (
    <div className="w-full bg-white/70 backdrop-blur-sm rounded-3xl p-5 sm:p-6 border border-[#E8DFD5] shadow-xs space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8DFD5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-[#EAE0D5]" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2C2420] flex items-center gap-2">
              Fotolivros Villa7 15x20 cm
              <span className="text-[10px] font-sans font-bold uppercase tracking-widest px-2 py-0.5 bg-[#8C5E3C] text-white rounded-full">
                Capa Fotográfica
              </span>
            </h3>
            <p className="text-xs text-[#7A685B]">
              Capa dura fotográfica personalizada, abertura panorâmica 180° e impressão profissional
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-[#8C5E3C] bg-[#F5EFEB] px-3 py-1.5 rounded-xl border border-[#E0D6C8] shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Formato Padrão: 15x20 Vertical (Aberto 20x30)</span>
        </div>
      </div>

      {/* 3 Organized Image Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STUDIO_SHOWCASE_FEATURES.map((feature, idx) => (
          <div
            key={idx}
            className="group relative bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#E8DFD5] hover:border-[#8C5E3C]/50 transition-all duration-300 shadow-xs hover:shadow-md flex flex-col"
          >
            {/* Image Thumbnail Container */}
            <div className="relative h-44 overflow-hidden bg-[#E8DFD5]">
              <img
                src={feature.image}
                alt={feature.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

              {/* Tag Badge */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-[#3D2C24] shadow-xs">
                {feature.tag}
              </div>

              {/* Expand Button */}
              <button
                onClick={() => setActiveImageModal(feature.image)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                title="Ampliar imagem de referência"
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Title overlay over image */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#EAE0D5] block">
                  {feature.subtitle}
                </span>
                <h4 className="font-serif text-base font-bold drop-shadow-sm leading-snug">
                  {feature.title}
                </h4>
              </div>
            </div>

            {/* Description Body */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <p className="text-xs text-[#5A4638] leading-relaxed">
                {feature.description}
              </p>
              
              <div className="mt-3 pt-3 border-t border-[#E8DFD5] flex items-center justify-between text-[11px] font-medium text-[#8C5E3C]">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Homologado Villa7
                </span>
                <button
                  onClick={() => setActiveImageModal(feature.image)}
                  className="flex items-center gap-0.5 hover:underline font-semibold"
                >
                  Ver detalhe <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* High-Res Image Modal Lightbox */}
      {activeImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveImageModal(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#FAF7F2] rounded-3xl p-3 border border-[#E8DFD5] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activeImageModal}
              alt="Ampliada"
              referrerPolicy="no-referrer"
              className="w-full h-auto max-h-[82vh] object-contain rounded-2xl"
            />
            <div className="p-3 text-center text-xs text-[#7A685B] font-medium">
              Fotolivro Villa7 • Amostra Visual de Qualidade Fine Art (15x20 cm Vertical)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
