import React from 'react';
import { BookOpen, Sparkles, Download, Eye, RotateCcw, CheckCircle, Save } from 'lucide-react';
import { AlbumProject } from '../types';

interface HeaderProps {
  project: AlbumProject;
  onOpenPreview: () => void;
  onSaveProgress: () => void;
  onResetProject: () => void;
  onLoadSample: () => void;
  saveStatus?: string;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  onOpenPreview,
  onSaveProgress,
  onResetProject,
  onLoadSample,
  saveStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8DFD5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo & Essence */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center shadow-sm border border-[#2C2420]">
              <span className="font-serif text-xl font-bold tracking-widest">V7</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#2C2420]">
                  Villa7 Álbuns
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] font-medium tracking-wider uppercase bg-[#EAE0D5] text-[#5A4638] rounded-full">
                  Memórias Colecionáveis
                </span>
              </div>
              <p className="text-xs text-[#7A685B] font-light">
                {project.clientData.albumTitle
                  ? `${project.clientData.albumTitle} • 15x20 Vertical (Aberto 20x30 cm)`
                  : 'Diagramação & Produção de Álbuns 15x20 Vertical'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {project.photos.length === 0 && (
              <button
                id="btn-load-demo"
                onClick={onLoadSample}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#6B5749] bg-[#EFE8DE] hover:bg-[#E4DACD] rounded-lg transition-colors border border-[#DDD3C5]"
                title="Carregar fotos de exemplo para testar"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8C5E3C]" />
                Carregar Exemplo
              </button>
            )}

            <button
              id="btn-preview-album"
              onClick={onOpenPreview}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#3D2C24] bg-[#FAF7F2] hover:bg-[#F2ECE4] rounded-lg transition-colors border border-[#D9CFC4] shadow-xs"
              title="Visualizar álbum completo em tela cheia"
            >
              <Eye className="w-4 h-4 text-[#8C5E3C]" />
              <span className="hidden sm:inline">Visualizar Álbum</span>
            </button>

            <button
              id="btn-save-progress"
              onClick={onSaveProgress}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#FAF7F2] bg-[#3D2C24] hover:bg-[#2C2420] rounded-lg transition-colors shadow-xs"
              title="Salvar alterações no navegador"
            >
              <Save className="w-4 h-4 text-[#EAE0D5]" />
              <span className="hidden sm:inline">Salvar</span>
            </button>

            {saveStatus && (
              <span className="text-[11px] text-[#7A685B] flex items-center gap-1 bg-[#EFE8DE] px-2 py-1 rounded">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                {saveStatus}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
