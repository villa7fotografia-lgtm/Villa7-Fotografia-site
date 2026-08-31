import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StepIndicator } from './components/StepIndicator';
import { Process1Preparation } from './components/processes/Process1Preparation';
import { Process2CreationStudio } from './components/processes/Process2CreationStudio';
import { Process3ReviewAndProduction } from './components/processes/Process3ReviewAndProduction';
import { AlbumFlipbookModal } from './components/modals/AlbumFlipbookModal';
import { AlbumProject, ClientData, CoverData, PhotoItem, SpreadItem } from './types';
import { createInitialProject, SAMPLE_PHOTOS } from './constants/sampleData';
import { SPREAD_TEMPLATES } from './constants/templates';
import { distributePhotosToSpreads, sanitizeSpreads } from './utils/spreadOptimizer';

const STORAGE_KEY = 'villa7_album_project_v2';

export default function App() {
  const [project, setProject] = useState<AlbumProject>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Normalize step to 1..3
        if (parsed.currentStep > 3) {
          parsed.currentStep = parsed.currentStep >= 6 ? 3 : 2;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return createInitialProject();
  });

  const [maxReachedStep, setMaxReachedStep] = useState<number>(() =>
    project.currentStep && project.currentStep <= 3 ? project.currentStep : 1
  );
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  // Auto-save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      setSaveStatus('Salvo');
      const timer = setTimeout(() => setSaveStatus(''), 2000);
      return () => clearTimeout(timer);
    } catch (err) {
      console.warn('Storage limit or error:', err);
    }
  }, [project]);

  const handleStepChange = (newStep: number) => {
    setProject((prev) => {
      let updatedSpreads = prev.spreads;
      let updatedSpreadCount = prev.spreadCount;

      if (prev.photos.length > 0) {
        const isUnpopulated = updatedSpreads.every((s) => s.slots.every((slot) => !slot.photoId));
        const hasEmptySpreads = updatedSpreads.some((s) => s.slots.every((slot) => !slot.photoId));

        if (isUnpopulated) {
          updatedSpreads = distributePhotosToSpreads(prev.photos, prev.spreadCount);
          updatedSpreadCount = updatedSpreads.length;
        } else if (newStep === 3 || hasEmptySpreads) {
          // Never leave empty spreads or empty slots
          updatedSpreads = sanitizeSpreads(updatedSpreads, prev.photos);
          updatedSpreadCount = updatedSpreads.length;
        }
      }

      return {
        ...prev,
        currentStep: newStep,
        spreadCount: updatedSpreadCount,
        spreads: updatedSpreads,
      };
    });

    if (newStep > maxReachedStep) {
      setMaxReachedStep(newStep);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Process 1: Client data update
  const handleUpdateClientData = (updated: Partial<ClientData>) => {
    setProject((prev) => ({
      ...prev,
      clientData: { ...prev.clientData, ...updated },
      cover: {
        ...prev.cover,
        title: updated.albumTitle !== undefined ? updated.albumTitle : prev.cover.title,
        subtitle: updated.albumSubtitle !== undefined ? updated.albumSubtitle : prev.cover.subtitle,
      },
    }));
  };

  // Process 1: Photos manipulation
  const handleAddPhotos = (newPhotos: PhotoItem[]) => {
    setProject((prev) => {
      const combined = [...prev.photos, ...newPhotos].slice(0, 40);
      return { ...prev, photos: combined };
    });
  };

  const handleRemovePhoto = (photoId: string) => {
    setProject((prev) => {
      const filtered = prev.photos.filter((p) => p.id !== photoId);
      const cleanedSpreads = prev.spreads.map((spread) => ({
        ...spread,
        slots: spread.slots.map((s) => (s.photoId === photoId ? { ...s, photoId: undefined } : s)),
      }));
      const sanitized = sanitizeSpreads(cleanedSpreads, filtered);
      return {
        ...prev,
        photos: filtered,
        spreads: sanitized.length > 0 ? sanitized : prev.spreads,
        spreadCount: sanitized.length > 0 ? sanitized.length : prev.spreadCount,
      };
    });
  };

  const handleClearAllPhotos = () => {
    if (window.confirm('Deseja realmente remover todas as fotos carregadas?')) {
      setProject((prev) => ({
        ...prev,
        photos: [],
        spreads: prev.spreads.map((s) => ({
          ...s,
          slots: s.slots.map((slot) => ({ ...slot, photoId: undefined })),
        })),
      }));
    }
  };

  // Process 1: Spread count manipulation (10 to 20)
  const handleChangeSpreadCount = (newCount: number) => {
    setProject((prev) => {
      if (prev.photos.length > 0) {
        const newSpreads = distributePhotosToSpreads(prev.photos, newCount);
        return {
          ...prev,
          spreadCount: newSpreads.length,
          spreads: newSpreads,
        };
      }

      let currentSpreads = [...prev.spreads];
      if (newCount > currentSpreads.length) {
        const toAdd = newCount - currentSpreads.length;
        for (let i = 0; i < toAdd; i++) {
          const spreadNumber = currentSpreads.length + 1;
          const template = SPREAD_TEMPLATES[spreadNumber % SPREAD_TEMPLATES.length];
          currentSpreads.push({
            id: `spread-${spreadNumber}-${Date.now()}`,
            spreadNumber,
            templateId: template.id,
            slots: template.slots.map((s, idx) => ({
              id: `slot-${spreadNumber}-${idx + 1}-${Date.now()}`,
              x: s.x,
              y: s.y,
              width: s.width,
              height: s.height,
              zoom: 1,
              panX: 0,
              panY: 0,
              fit: 'cover',
              filter: 'none',
            })),
            layoutTitle: `Lâmina ${spreadNumber} (Páginas ${spreadNumber * 2 - 1}-${spreadNumber * 2})`,
            backgroundColor: '#FAF7F2',
          });
        }
      } else if (newCount < currentSpreads.length) {
        currentSpreads = currentSpreads.slice(0, newCount);
      }

      return {
        ...prev,
        spreadCount: newCount,
        spreads: currentSpreads,
      };
    });
  };

  // Process 2: Spread update
  const handleUpdateSpread = (spreadIndex: number, updatedSpread: SpreadItem) => {
    setProject((prev) => {
      const spreads = [...prev.spreads];
      spreads[spreadIndex] = updatedSpread;
      return { ...prev, spreads };
    });
  };

  // Process 2: Intelligent Auto-diagramming (Anti-Corte & Sem Lâminas Vazias)
  const handleAutoLayoutAll = () => {
    if (project.photos.length === 0) {
      alert('Carregue algumas fotos no Processo 1 antes de auto-diagramar.');
      return;
    }

    setProject((prev) => {
      // Distributes ALL sent photos, ensuring every slot has a photo and no empty spreads remain
      const updatedSpreads = distributePhotosToSpreads(prev.photos, prev.spreadCount);
      return {
        ...prev,
        spreadCount: updatedSpreads.length,
        spreads: updatedSpreads,
      };
    });

    setSaveStatus('Álbum 100% preenchido sem lâminas vazias!');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  // Process 2: Cover update
  const handleUpdateCover = (updated: Partial<CoverData>) => {
    setProject((prev) => ({
      ...prev,
      cover: { ...prev.cover, ...updated },
    }));
  };

  // Process 3: Project Approval
  const handleApproveProject = (approved: boolean) => {
    setProject((prev) => ({
      ...prev,
      clientData: {
        ...prev.clientData,
        isApproved: approved,
        approvalDate: new Date().toLocaleDateString('pt-BR'),
      },
      cover: {
        ...prev.cover,
        approved,
        approvalDate: new Date().toLocaleDateString('pt-BR'),
      },
    }));
  };

  // Demo loader
  const handleLoadSampleData = () => {
    const spreadCount = 10;
    let photoIdx = 0;

    const sampleSpreads = Array.from({ length: spreadCount }, (_, i) => {
      const template = SPREAD_TEMPLATES[i % SPREAD_TEMPLATES.length];
      return {
        id: `spread-${i + 1}`,
        spreadNumber: i + 1,
        templateId: template.id,
        slots: template.slots.map((s, sIdx) => {
          const photo = SAMPLE_PHOTOS[photoIdx % SAMPLE_PHOTOS.length];
          photoIdx++;
          return {
            id: `slot-${i + 1}-${sIdx + 1}-${Date.now()}`,
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height,
            photoId: photo.id,
            zoom: 1,
            panX: 0,
            panY: 0,
            fit: 'cover' as const,
            filter: 'none' as const,
          };
        }),
        layoutTitle: `Lâmina ${i + 1} (Páginas ${i * 2 + 1}-${i * 2 + 2})`,
        backgroundColor: '#FAF7F2',
      };
    });

    setProject({
      id: 'villa7-sample-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clientData: {
        name: 'Mariana & Lucas Silva',
        email: 'mariana.silva@exemplo.com',
        phone: '(11) 98765-4321',
        albumTitle: 'Nossas Melhores Memórias',
        albumSubtitle: 'Momentos Especiais • 2026',
        occasion: 'Casamento',
        isApproved: true,
        approvalDate: new Date().toLocaleDateString('pt-BR'),
      },
      photos: SAMPLE_PHOTOS,
      spreadCount: 10,
      spreads: sampleSpreads,
      cover: {
        type: 'chatgpt',
        imageUrl: SAMPLE_PHOTOS[0].url,
        title: 'Nossas Melhores Memórias',
        subtitle: 'Mariana & Lucas • 2026',
        yearOrDate: '2026',
        approved: true,
        approvalDate: new Date().toLocaleDateString('pt-BR'),
        bgColor: '#F5EFEB',
        textColor: '#3D2C24',
        foilColor: 'gold',
      },
      currentStep: 2,
    });
    setMaxReachedStep(3);
    setSaveStatus('Demonstração carregada!');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleResetProject = () => {
    if (
      window.confirm(
        'Tem certeza que deseja iniciar um novo álbum? Todos os dados atuais serão reiniciados.'
      )
    ) {
      const fresh = createInitialProject();
      setProject(fresh);
      setMaxReachedStep(1);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C2420] flex flex-col font-sans selection:bg-[#E8DFD5] selection:text-[#3D2C24]">
      {/* Brand Header */}
      <Header
        project={project}
        onOpenPreview={() => setIsPreviewModalOpen(true)}
        onSaveProgress={() => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
          setSaveStatus('Salvo com sucesso!');
          setTimeout(() => setSaveStatus(''), 2500);
        }}
        onResetProject={handleResetProject}
        onLoadSample={handleLoadSampleData}
        saveStatus={saveStatus}
      />

      {/* 3-Process Wizard Navigator */}
      <StepIndicator
        currentStep={project.currentStep}
        onStepClick={handleStepChange}
        maxReachedStep={maxReachedStep}
      />

      {/* Main Process Canvas */}
      <main className="flex-1">
        {/* PROCESSO 1: PREPARAÇÃO (Identificação, Fotos & Estrutura) */}
        {project.currentStep === 1 && (
          <Process1Preparation
            clientData={project.clientData}
            photos={project.photos}
            spreadCount={project.spreadCount}
            cover={project.cover}
            onChangeClientData={handleUpdateClientData}
            onChangeCover={handleUpdateCover}
            onAddPhotos={handleAddPhotos}
            onRemovePhoto={handleRemovePhoto}
            onClearAllPhotos={handleClearAllPhotos}
            onChangeSpreadCount={handleChangeSpreadCount}
            onLoadDemo={handleLoadSampleData}
            onNext={() => handleStepChange(2)}
            onNextAndAutoDiagram={() => {
              handleAutoLayoutAll();
              handleStepChange(2);
            }}
          />
        )}

        {/* PROCESSO 2: ESTÚDIO DE CRIAÇÃO (Diagramação 60x30 & Capa com IA/Arte) */}
        {project.currentStep === 2 && (
          <Process2CreationStudio
            project={project}
            onChangeSpread={handleUpdateSpread}
            onChangeCover={handleUpdateCover}
            onAutoLayoutAll={handleAutoLayoutAll}
            onOpenPreview={() => setIsPreviewModalOpen(true)}
            onNext={() => handleStepChange(3)}
            onPrev={() => handleStepChange(1)}
          />
        )}

        {/* PROCESSO 3: REVISÃO & PRODUÇÃO (Aprovação Final, PDF & Drive) */}
        {project.currentStep === 3 && (
          <Process3ReviewAndProduction
            project={project}
            onChangeSpread={handleUpdateSpread}
            onUpdateSpreads={(updatedSpreads) =>
              setProject((prev) => ({ ...prev, spreads: updatedSpreads }))
            }
            onChangeCover={handleUpdateCover}
            onApproveProject={handleApproveProject}
            onOpenPreview={() => setIsPreviewModalOpen(true)}
            onPrev={() => handleStepChange(2)}
            onReset={handleResetProject}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#FAF7F2] border-t border-[#E8DFD5] py-6 px-4 text-center text-xs text-[#8C7A6B]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-sm tracking-wide text-[#3D2C24]">
              Villa7 Álbuns
            </span>
            <span>• Memórias Colecionáveis</span>
          </div>
          <p>
            Feito por: @villa7albuns
          </p>
        </div>
      </footer>

      {/* Full Album Flipbook Modal */}
      <AlbumFlipbookModal
        isOpen={isPreviewModalOpen}
        project={project}
        onClose={() => setIsPreviewModalOpen(false)}
      />
    </div>
  );
}
