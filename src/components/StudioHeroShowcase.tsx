import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Gem,
  Eye,
  X,
  Maximize2,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
  Lock,
  AlertTriangle,
  ShoppingBag,
} from 'lucide-react';
import { IMAGE_ASSETS, COLLECTIBLE_ALBUM_MOMENTS, CollectibleMoment } from '../constants/imageAssets';
import { OccasionType } from '../types';

interface StudioHeroShowcaseProps {
  onSelectOccasion?: (occasion: OccasionType, titleSuggestion?: string, subtitleSuggestion?: string) => void;
  onScrollToForm?: () => void;
}

export const StudioHeroShowcase: React.FC<StudioHeroShowcaseProps> = ({
  onSelectOccasion,
  onScrollToForm,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string>('casamento');

  const handleSelectMoment = (moment: CollectibleMoment) => {
    setSelectedThemeId(moment.id);
    if (onSelectOccasion) {
      onSelectOccasion(
        moment.category as OccasionType,
        moment.titleExample,
        moment.subtitleExample
      );
    }
  };

  const handleStart = () => {
    if (onScrollToForm) {
      onScrollToForm();
    } else {
      const el = document.getElementById('secao-preparacao-projeto');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const currentTheme = COLLECTIBLE_ALBUM_MOMENTS.find((m) => m.id === selectedThemeId) || COLLECTIBLE_ALBUM_MOMENTS[0];
  const mercadoLivreUrl = 'https://www.mercadolivre.com.br';

  return (
    <div className="w-full bg-[#FFFFFF] rounded-3xl p-5 sm:p-7 border border-[#E8DFD5] shadow-xs space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Visual do Catálogo / Imagem Oficial */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div
            onClick={() => setIsLightboxOpen(true)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E2D8CC] shadow-sm hover:shadow-md transition-all w-full max-w-sm bg-[#FAF7F2]"
            title="Clique para ver o catálogo completo"
          >
            <img
              src={IMAGE_ASSETS.catalogoMaster}
              alt="Catálogo de Álbuns Fotográficos Villa7"
              className="w-full h-auto object-cover transform group-hover:scale-[1.01] transition-transform duration-300"
            />

            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <span className="bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-white/40">
                <Maximize2 className="w-3.5 h-3.5" /> Ampliar Catálogo
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="mt-2 text-xs text-[#8C5E3C] hover:text-[#5A3B22] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Ver imagem ampliada
          </button>
        </div>

        {/* Texto Minimalista e Objetivo */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C5E3C] block mb-1">
              Linha Editorial Villa7 • Formato 15x20 Vertical
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C2420] leading-snug">
              Álbuns Fotográficos para Todos os Momentos
            </h2>
            <p className="text-sm text-[#6B5749] mt-1.5">
              Casamento, ensaios, eventos, acompanhamento, individual, formatura e família.
              Peças de alta durabilidade projetadas para decorar seu espaço e guardar memórias reais.
            </p>
          </div>

          {/* 3 Especificações em linha limpa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFE8DE]">
              <BookOpen className="w-4 h-4 text-[#8C5E3C] shrink-0" />
              <span className="text-xs font-semibold text-[#2C2420]">15x20 vertical (aberto 20x30)</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFE8DE]">
              <Sparkles className="w-4 h-4 text-[#8C5E3C] shrink-0" />
              <span className="text-xs font-semibold text-[#2C2420]">Papel microporoso</span>
            </div>
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EFE8DE]">
              <Gem className="w-4 h-4 text-[#8C5E3C] shrink-0" />
              <span className="text-xs font-semibold text-[#2C2420]">Acabamento premium</span>
            </div>
          </div>

          {/* Seleção de Tema em Chips Minimalistas */}
          <div className="space-y-2 pt-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#7A685B] block">
              Escolha a ocasião do seu álbum:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COLLECTIBLE_ALBUM_MOMENTS.map((moment) => {
                const isSelected = selectedThemeId === moment.id;
                return (
                  <button
                    key={moment.id}
                    type="button"
                    onClick={() => handleSelectMoment(moment)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#3D2C24] text-[#FAF7F2] border-[#3D2C24] shadow-xs'
                        : 'bg-white text-[#5A4638] border-[#E0D6C8] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    {moment.theme}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ações Diretas: Personalizar & Canal Oficial Mercado Livre */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 bg-[#3D2C24] hover:bg-[#2A1D17] text-[#FAF7F2] text-xs sm:text-sm font-bold py-3 px-5 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Personalizar Álbum Agora</span>
              <ArrowRight className="w-4 h-4 text-[#C9A96E]" />
            </button>

            <a
              href={mercadoLivreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#FFF9E6] hover:bg-[#FFF3CC] text-[#2D3277] border border-[#FFE180] text-xs sm:text-sm font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-95"
              title="Compra 100% Segura no Mercado Livre com Entrega Garantida"
            >
              <ShoppingBag className="w-4 h-4 text-[#2D3277]" />
              <span>Comprar no Mercado Livre</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>

      {/* Aviso Oficial de Segurança e Política de Venda Exclusiva no Mercado Livre */}
      <div className="rounded-2xl bg-[#FFFDF7] border border-[#EADBBD] p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF4D1] text-[#92400E] flex items-center justify-center shrink-0 border border-[#FDE68A]">
              <ShieldCheck className="w-5 h-5 text-[#B45309]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#2D3277] text-white">
                  Mercado Livre Oficial
                </span>
                <span className="text-xs font-bold text-[#2C2420]">
                  Venda Oficial com Entrega Garantida & Compra Segura
                </span>
              </div>
              <p className="text-xs text-[#5A4638] leading-relaxed">
                Toda a comercialização da Villa7 é realizada <strong>oficialmente e com exclusividade na nossa conta do Mercado Livre</strong>, com rastreamento Mercado Envios e proteção integral do Mercado Pago.
              </p>
              <p className="text-[11px] font-medium text-[#842029] bg-rose-50/80 rounded-lg p-2 border border-rose-200/80 inline-block mt-1">
                <strong className="font-bold">Aviso importante de segurança:</strong> Não vendemos no WhatsApp, não vendemos no TikTok Shopping, não vendemos na Shopee e não vendemos no Instagram. Nunca realize pagamentos fora do Mercado Livre.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2 self-start md:self-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DDD3C5] text-xs font-semibold text-[#2C2420] shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Compra Segura</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#DDD3C5] text-xs font-semibold text-[#2C2420] shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2D3277]" />
              <span>Entrega Garantida</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Minimalista */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-3xl w-full bg-[#FAF7F2] rounded-2xl p-4 border border-[#E8DFD5] shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E8DFD5]">
              <span className="font-serif font-bold text-sm text-[#2C2420]">
                Catálogo Villa7 • Álbuns Fotográficos 15x20
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/15 text-[#2C2420] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-[#EDE4D8] rounded-xl p-2">
              <img
                src={IMAGE_ASSETS.catalogoMaster}
                alt="Catálogo Ampliado Villa7"
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
