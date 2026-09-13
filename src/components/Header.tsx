import React from 'react';
import {
  Eye,
  Save,
  CheckCircle,
  ShieldCheck,
  Rotate3d,
  Lock,
  Home,
  ShoppingBag,
} from 'lucide-react';
import { AlbumProject } from '../types';
import { Villa7Logo } from './common/Villa7Logo';
import { MERCADO_LIVRE_PRODUCT_URL } from '../constants/imageAssets';

interface HeaderProps {
  project: AlbumProject;
  onOpenPreview: () => void;
  onOpen3D?: () => void;
  onOpenAdmin?: () => void;
  onGoHome?: () => void;
  onSaveProgress: () => void;
  onResetProject: () => void;
  onLoadSample: () => void;
  saveStatus?: string;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onOpenPreview,
  onOpen3D,
  onOpenAdmin,
  onGoHome,
  onSaveProgress,
  saveStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Essence */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onGoHome}
              className="text-left cursor-pointer hover:opacity-90 transition-opacity"
              title="Voltar à tela inicial"
            >
              <Villa7Logo variant="full" size="md" iconColor="#B39770" textColor="#211D19" />
            </button>

            <div className="hidden lg:block h-8 w-[1px] bg-[#E8DFD5]" />

            <div className="hidden md:block">
              <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium tracking-wider uppercase bg-[#EAE1D5] text-[#5A4638] rounded-full">
                {project.clientData.albumTitle
                  ? `${project.clientData.albumTitle} • 15x20 Vertical`
                  : 'Fotolivro Fine Art • 15x20 Vertical'}
              </span>
            </div>

            <a
              href={MERCADO_LIVRE_PRODUCT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold text-[#2D3277] bg-[#FFF9E6] border border-[#FFE180] rounded-full hover:bg-[#FFF3CC] transition-colors"
              title="Loja Oficial Mercado Livre"
            >
              <ShieldCheck className="w-3 h-3 text-[#2D3277]" />
              <span>Mercado Livre Oficial</span>
            </a>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Discrete Auto-save Indicator */}
            {saveStatus ? (
              <span className="text-[11px] text-[#6E5536] flex items-center gap-1 bg-[#EAE1D5] px-2.5 py-1 rounded-full font-medium transition-all animate-in fade-in">
                <CheckCircle className="w-3 h-3 text-emerald-700" />
                Alterações salvas
              </span>
            ) : (
              <span className="hidden sm:inline text-[10px] text-[#9A9187]">
                ✓ Salvo automaticamente
              </span>
            )}

            {/* Início */}
            {onGoHome && (
              <button
                type="button"
                onClick={onGoHome}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#6B5749] bg-[#FAF7F2] hover:bg-[#F2ECE4] rounded-xl transition-colors border border-[#DDD3C5]"
                title="Ir para a página inicial"
              >
                <Home className="w-3.5 h-3.5 text-[#B39770]" />
                <span>Início</span>
              </button>
            )}

            {/* Ver em 3D */}
            {onOpen3D && (
              <button
                type="button"
                onClick={onOpen3D}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#211D19] bg-[#FAF7F2] hover:bg-[#F2ECE4] rounded-xl transition-colors border border-[#DDD3C5] shadow-2xs"
                title="Visualizar álbum físico em 3D"
              >
                <Rotate3d className="w-3.5 h-3.5 text-[#B39770]" />
                <span className="hidden sm:inline">Ver em 3D</span>
              </button>
            )}

            {/* Painel de Produção */}
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#FAF7F2] bg-[#3D2C24] hover:bg-[#211D19] rounded-xl transition-colors shadow-2xs"
                title="Acesso restrito à equipe de produção"
              >
                <Lock className="w-3.5 h-3.5 text-[#B39770]" />
                <span className="hidden md:inline">Produção Villa7</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
