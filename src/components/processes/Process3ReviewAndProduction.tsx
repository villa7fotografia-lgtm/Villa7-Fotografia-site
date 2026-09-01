import React, { useState } from 'react';
import {
  ShieldCheck,
  Eye,
  Download,
  CheckCircle2,
  Check,
  RefreshCw,
  ArrowLeft,
  User,
  Phone,
  Mail,
  BookOpen,
  FileCheck,
  Send,
  Printer,
  Cloud,
  ArrowLeftRight,
  Move,
  Undo2,
  X,
  Plus,
  ImageIcon,
} from 'lucide-react';
import { AlbumProject, PhotoItem, SpreadItem, CoverData, SlotLayout } from '../../types';
import { generateAlbumPDF, PDFGenerationProgress } from '../../services/pdfGenerator';
import {
  SupabaseStorageService,
  SupabaseUploadResult,
} from '../../services/supabaseStorage';
import confetti from 'canvas-confetti';
import { PhotoCropModal } from '../modals/PhotoCropModal';
import { sanitizeSpreads } from '../../utils/spreadOptimizer';
import { IMAGE_ASSETS } from '../../constants/imageAssets';

interface Process3Props {
  project: AlbumProject;
  onChangeSpread?: (spreadIndex: number, updatedSpread: SpreadItem) => void;
  onUpdateSpreads?: (updatedSpreads: SpreadItem[]) => void;
  onChangeCover?: (updated: Partial<CoverData>) => void;
  onApproveProject: (approved: boolean) => void;
  onOpenPreview: () => void;
  onPrev: () => void;
  onReset: () => void;
}

export const Process3ReviewAndProduction: React.FC<Process3Props> = ({
  project,
  onChangeSpread,
  onUpdateSpreads,
  onChangeCover,
  onApproveProject,
  onOpenPreview,
  onPrev,
  onReset,
}) => {
  const [agreementChecked, setAgreementChecked] = useState<boolean>(
    project.clientData.isApproved || false
  );

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<PDFGenerationProgress>({
    step: 'Iniciando compilação do álbum...',
    percent: 0,
  });
  const [pdfData, setPdfData] = useState<{ blob: Blob; fileName: string; dataUri: string } | null>(
    null
  );
  const [isSentSuccessfully, setIsSentSuccessfully] = useState<boolean>(false);
  const [supabaseResult, setSupabaseResult] = useState<SupabaseUploadResult | null>(null);
  const [showManualUpload, setShowManualUpload] = useState<boolean>(false);

  const [isUploadingManual, setIsUploadingManual] = useState(false);
  const [manualUploadResult, setManualUploadResult] = useState<SupabaseUploadResult | null>(null);

  // Drag and Drop & Click-to-Swap Photo State
  const [selectedSlotForSwap, setSelectedSlotForSwap] = useState<{
    spreadIndex: number;
    slotIndex: number;
    photoId?: string;
  } | { isCover: true } | null>(null);

  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null);
  const [draggedSource, setDraggedSource] = useState<{
    type: 'slot' | 'cover' | 'tray';
    spreadIndex?: number;
    slotIndex?: number;
    photoId?: string;
  } | null>(null);

  const [swapHistory, setSwapHistory] = useState<SpreadItem[][]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPhotoTray, setShowPhotoTray] = useState<boolean>(false);
  const [trayFilter, setTrayFilter] = useState<'all' | 'unused' | 'used'>('all');

  const validSpreads = project.photos.length > 0
    ? sanitizeSpreads(project.spreads, project.photos)
    : project.spreads;

  const [cropModalSlot, setCropModalSlot] = useState<{
    spreadIndex: number;
    slotIndex: number;
    slot: SlotLayout;
    photo: PhotoItem;
  } | null>(null);

  const handleSaveCropModal = (updatedProps: Partial<SlotLayout>) => {
    if (!cropModalSlot) return;
    saveSpreadSnapshot();
    const newSpreads = JSON.parse(JSON.stringify(project.spreads)) as SpreadItem[];
    const targetSlot = newSpreads[cropModalSlot.spreadIndex]?.slots[cropModalSlot.slotIndex];
    if (targetSlot) {
      Object.assign(targetSlot, updatedProps);
      if (onUpdateSpreads) {
        onUpdateSpreads(newSpreads);
      } else if (onChangeSpread) {
        onChangeSpread(cropModalSlot.spreadIndex, newSpreads[cropModalSlot.spreadIndex]);
      }
      setToastMessage('✓ Enquadramento e corte atualizados!');
      setTimeout(() => setToastMessage(null), 3000);
      if (pdfData || isSentSuccessfully) {
        setPdfData(null);
        setIsSentSuccessfully(false);
      }
    }
  };

  const handleManualPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Por favor, selecione um arquivo PDF válido.');
      return;
    }

    setIsUploadingManual(true);
    setManualUploadResult(null);

    try {
      const res = await SupabaseStorageService.salvarPdfNoSupabase(file, file.name.replace(/\.[^/.]+$/, ''));
      setManualUploadResult(res);
      if (res.success) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err: any) {
      setManualUploadResult({
        success: false,
        fileName: file.name,
        fileSizeMB: file.size / (1024 * 1024),
        bucket: 'pdfs',
        error: err?.message || 'Erro ao enviar PDF.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsUploadingManual(false);
      e.target.value = '';
    }
  };

  // Build a map of photo id to photo item for quick lookups
  const photosMap = new Map<string, PhotoItem>();
  project.photos.forEach((photo) => {
    photosMap.set(photo.id, photo);
  });

  // Count photos used
  const usedPhotoIds = new Set<string>();
  project.spreads.forEach((spread) => {
    spread.slots.forEach((slot) => {
      if (slot.photoId) usedPhotoIds.add(slot.photoId);
    });
  });

  const availablePhotosForTray = project.photos.filter((p) => {
    if (trayFilter === 'unused') return !usedPhotoIds.has(p.id);
    if (trayFilter === 'used') return usedPhotoIds.has(p.id);
    return true;
  });

  const totalSlots = project.spreads.reduce(
    (acc, spread) => acc + spread.slots.length,
    0
  );
  const filledSlots = project.spreads.reduce(
    (acc, spread) =>
      acc + spread.slots.filter((slot) => Boolean(slot.photoId)).length,
    0
  );

  // Record spread snapshot for undo
  const saveSpreadSnapshot = () => {
    const prevSpreads = JSON.parse(JSON.stringify(project.spreads)) as SpreadItem[];
    setSwapHistory((prev) => [...prev.slice(-10), prevSpreads]);
  };

  // Swap Two Slots
  const handleSwapSlots = (
    sourceSpreadIdx: number,
    sourceSlotIdx: number,
    targetSpreadIdx: number,
    targetSlotIdx: number
  ) => {
    if (sourceSpreadIdx === targetSpreadIdx && sourceSlotIdx === targetSlotIdx) {
      setSelectedSlotForSwap(null);
      return;
    }

    saveSpreadSnapshot();

    const newSpreads = JSON.parse(JSON.stringify(project.spreads)) as SpreadItem[];
    const srcSlot = newSpreads[sourceSpreadIdx]?.slots[sourceSlotIdx];
    const tgtSlot = newSpreads[targetSpreadIdx]?.slots[targetSlotIdx];

    if (!srcSlot || !tgtSlot) return;

    const tempPhotoId = srcSlot.photoId;
    srcSlot.photoId = tgtSlot.photoId;
    tgtSlot.photoId = tempPhotoId;

    if (onUpdateSpreads) {
      onUpdateSpreads(newSpreads);
    } else if (onChangeSpread) {
      onChangeSpread(sourceSpreadIdx, newSpreads[sourceSpreadIdx]);
      if (sourceSpreadIdx !== targetSpreadIdx) {
        onChangeSpread(targetSpreadIdx, newSpreads[targetSpreadIdx]);
      }
    }

    setSelectedSlotForSwap(null);
    setDragOverTarget(null);
    setDraggedSource(null);

    const sameSpread = sourceSpreadIdx === targetSpreadIdx;
    const msg = sameSpread
      ? `✓ Posições trocadas na Lâmina ${sourceSpreadIdx + 1}!`
      : `✓ Fotos trocadas entre Lâmina ${sourceSpreadIdx + 1} e Lâmina ${targetSpreadIdx + 1}!`;

    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);

    if (pdfData || isSentSuccessfully) {
      setPdfData(null);
      setIsSentSuccessfully(false);
    }
  };

  // Swap Slot with Cover Photo
  const handleSwapSlotWithCover = (spreadIdx: number, slotIdx: number) => {
    saveSpreadSnapshot();

    const slot = project.spreads[spreadIdx]?.slots[slotIdx];
    if (!slot) return;

    const currentCoverUrl = project.cover.imageUrl;
    const currentCoverPhoto = project.photos.find((p) => p.url === currentCoverUrl) || project.photos[0];
    const currentCoverId = currentCoverPhoto?.id;

    const slotPhoto = slot.photoId ? photosMap.get(slot.photoId) : null;
    const newCoverUrl = slotPhoto?.url || currentCoverUrl;

    const newSpreads = JSON.parse(JSON.stringify(project.spreads)) as SpreadItem[];
    const targetSlot = newSpreads[spreadIdx]?.slots[slotIdx];
    if (targetSlot) {
      targetSlot.photoId = currentCoverId;
    }

    if (onUpdateSpreads) {
      onUpdateSpreads(newSpreads);
    }
    if (onChangeCover && newCoverUrl) {
      onChangeCover({ imageUrl: newCoverUrl });
    }

    setSelectedSlotForSwap(null);
    setDragOverTarget(null);
    setDraggedSource(null);
    setToastMessage(`✓ Foto trocada com a Capa do Álbum!`);
    setTimeout(() => setToastMessage(null), 3500);

    if (pdfData || isSentSuccessfully) {
      setPdfData(null);
      setIsSentSuccessfully(false);
    }
  };

  // Assign photo from photo tray to a specific slot
  const handleAssignPhotoToSlot = (photoId: string, spreadIdx: number, slotIdx: number) => {
    saveSpreadSnapshot();
    const newSpreads = JSON.parse(JSON.stringify(project.spreads)) as SpreadItem[];
    const tgtSlot = newSpreads[spreadIdx]?.slots[slotIdx];
    if (!tgtSlot) return;

    tgtSlot.photoId = photoId;
    if (onUpdateSpreads) {
      onUpdateSpreads(newSpreads);
    }

    setSelectedSlotForSwap(null);
    setDragOverTarget(null);
    setDraggedSource(null);
    setToastMessage(`✓ Foto inserida na Lâmina ${spreadIdx + 1}!`);
    setTimeout(() => setToastMessage(null), 3000);

    if (pdfData || isSentSuccessfully) {
      setPdfData(null);
      setIsSentSuccessfully(false);
    }
  };

  // Toggle Fit Mode (Contain / Cover) for a slot directly in Review
  const handleToggleFitMode = (spreadIdx: number, slotIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    saveSpreadSnapshot();
    const newSpreads = JSON.parse(JSON.stringify(project.spreads)) as SpreadItem[];
    const tgtSlot = newSpreads[spreadIdx]?.slots[slotIdx];
    if (!tgtSlot) return;

    tgtSlot.fit = tgtSlot.fit === 'contain' ? 'cover' : 'contain';
    if (onUpdateSpreads) {
      onUpdateSpreads(newSpreads);
    }
    setToastMessage(
      tgtSlot.fit === 'contain'
        ? '✓ Enquadramento: Sem Cortes (100% visível)'
        : '✓ Enquadramento: Preencher Espaço'
    );
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Undo Last Swap
  const handleUndoSwap = () => {
    if (swapHistory.length === 0) return;
    const lastState = swapHistory[swapHistory.length - 1];
    setSwapHistory((prev) => prev.slice(0, -1));
    if (onUpdateSpreads) {
      onUpdateSpreads(lastState);
    }
    setSelectedSlotForSwap(null);
    setToastMessage('✓ Ação desfeita!');
    setTimeout(() => setToastMessage(null), 2500);

    if (pdfData || isSentSuccessfully) {
      setPdfData(null);
      setIsSentSuccessfully(false);
    }
  };

  // Click-to-Swap Slot Handler
  const handleSlotClick = (spreadIdx: number, slotIdx: number) => {
    if (!selectedSlotForSwap) {
      // First click: select slot as swap origin
      setSelectedSlotForSwap({
        spreadIndex: spreadIdx,
        slotIndex: slotIdx,
        photoId: project.spreads[spreadIdx]?.slots[slotIdx]?.photoId,
      });
      setToastMessage(`Foto da Lâmina ${spreadIdx + 1} selecionada. Agora clique em outra foto para trocar a posição.`);
      return;
    }

    if ('isCover' in selectedSlotForSwap) {
      // Swapping Cover with this slot
      handleSwapSlotWithCover(spreadIdx, slotIdx);
      return;
    }

    if (
      selectedSlotForSwap.spreadIndex === spreadIdx &&
      selectedSlotForSwap.slotIndex === slotIdx
    ) {
      // Clicked the same slot -> deselect
      setSelectedSlotForSwap(null);
      setToastMessage(null);
      return;
    }

    // Swapping previously selected slot with clicked slot
    handleSwapSlots(
      selectedSlotForSwap.spreadIndex,
      selectedSlotForSwap.slotIndex,
      spreadIdx,
      slotIdx
    );
  };

  // Click-to-Swap Cover Handler
  const handleCoverClick = () => {
    if (!selectedSlotForSwap) {
      setSelectedSlotForSwap({ isCover: true });
      setToastMessage('Capa selecionada. Clique em qualquer foto de uma lâmina para trocar a posição.');
      return;
    }

    if ('isCover' in selectedSlotForSwap) {
      setSelectedSlotForSwap(null);
      setToastMessage(null);
      return;
    }

    // Swapping previously selected slot with Cover
    handleSwapSlotWithCover(
      selectedSlotForSwap.spreadIndex,
      selectedSlotForSwap.slotIndex
    );
  };

  // Native HTML5 Drag and Drop Event Handlers
  const handleDragStartFromSlot = (
    e: React.DragEvent,
    spreadIdx: number,
    slotIdx: number,
    photoId?: string
  ) => {
    const payload = {
      type: 'slot' as const,
      spreadIndex: spreadIdx,
      slotIndex: slotIdx,
      photoId,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', photoId || '');
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSource(payload);
  };

  const handleDragStartFromCover = (e: React.DragEvent) => {
    const payload = { type: 'cover' as const };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedSource(payload);
  };

  const handleDragStartFromTray = (e: React.DragEvent, photoId: string) => {
    const payload = { type: 'tray' as const, photoId };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
    e.dataTransfer.setData('text/plain', photoId);
    e.dataTransfer.effectAllowed = 'copyMove';
    setDraggedSource(payload);
  };

  const handleDropOnSlot = (
    e: React.DragEvent,
    targetSpreadIdx: number,
    targetSlotIdx: number
  ) => {
    e.preventDefault();
    setDragOverTarget(null);

    let data: any = null;
    try {
      const rawJson = e.dataTransfer.getData('application/json');
      if (rawJson) data = JSON.parse(rawJson);
    } catch {
      // fallback
    }

    if (!data && draggedSource) {
      data = draggedSource;
    }

    if (!data) {
      const plainId = e.dataTransfer.getData('text/plain');
      if (plainId) {
        handleAssignPhotoToSlot(plainId, targetSpreadIdx, targetSlotIdx);
      }
      return;
    }

    if (data.type === 'slot') {
      handleSwapSlots(
        data.spreadIndex,
        data.slotIndex,
        targetSpreadIdx,
        targetSlotIdx
      );
    } else if (data.type === 'cover') {
      handleSwapSlotWithCover(targetSpreadIdx, targetSlotIdx);
    } else if (data.type === 'tray' && data.photoId) {
      handleAssignPhotoToSlot(data.photoId, targetSpreadIdx, targetSlotIdx);
    }
  };

  const handleDropOnCover = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTarget(null);

    let data: any = null;
    try {
      const rawJson = e.dataTransfer.getData('application/json');
      if (rawJson) data = JSON.parse(rawJson);
    } catch {
      // ignore
    }

    if (!data && draggedSource) {
      data = draggedSource;
    }

    if (data?.type === 'slot') {
      handleSwapSlotWithCover(data.spreadIndex, data.slotIndex);
    } else if (data?.type === 'tray' && data.photoId) {
      const photo = photosMap.get(data.photoId);
      if (photo && onChangeCover) {
        onChangeCover({ imageUrl: photo.url });
        setToastMessage('✓ Capa atualizada com nova fotografia!');
        setTimeout(() => setToastMessage(null), 3000);
      }
    }
  };

  const downloadFile = (blob: Blob, fileName: string) => {
    try {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      console.warn('Erro ao disparar download automático:', e);
    }
  };

  const handleApproveAndSendToProduction = async () => {
    setAgreementChecked(true);
    onApproveProject(true);

    try {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#8C5E3C', '#D9CFC4', '#3D2C24', '#10B981'],
      });
    } catch {
      // ignore
    }

    try {
      setIsGenerating(true);
      setIsSentSuccessfully(false);
      setSupabaseResult(null);

      // 1. Generate Album PDF
      const generated = await generateAlbumPDF(project, (prog) => {
        setGenerationProgress(prog);
      });
      setPdfData(generated);

      // 2. Prepare structured path for Supabase Storage (bucket 'pdfs')
      // documentos/{data}/{timestamp}_{id-aleatorio}_{nome-cliente}_{nome-arquivo}.pdf
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);

      const sanitizeText = (str: string) => {
        if (!str) return 'cliente';
        return str
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-_]/g, '-')
          .replace(/-+/g, '-');
      };

      const clientNameSanitized = sanitizeText(project.clientData.name || 'cliente');
      const originalBaseName = generated.fileName.replace(/\.[^/.]+$/, '');
      const sanitizedBaseName = sanitizeText(originalBaseName);
      const customPath = `documentos/${dateStr}/${timestamp}_${randomId}_${clientNameSanitized}_${sanitizedBaseName}.pdf`;

      // 3. Upload to Supabase Storage bucket 'pdfs'
      const uploadRes = await SupabaseStorageService.salvarPdfNoSupabase(
        generated.blob,
        generated.fileName,
        customPath
      );
      setSupabaseResult(uploadRes);

      // 4. Mark success and trigger local copy download
      setIsSentSuccessfully(true);
      downloadFile(generated.blob, generated.fileName);
    } catch (err) {
      console.error('Error generating or uploading PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfData) return;
    downloadFile(pdfData.blob, pdfData.fileName);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Dynamic Toast Feedback when Photos are Swapped */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-[#2C2420] text-white text-xs sm:text-sm font-semibold shadow-2xl border border-amber-500/40 flex items-center gap-3 animate-in slide-in-from-top-4 duration-200 max-w-lg text-center">
          <ArrowLeftRight className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
          <span className="flex-1">{toastMessage}</span>
          {swapHistory.length > 0 && (
            <button
              type="button"
              onClick={handleUndoSwap}
              className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 inline-flex items-center gap-1"
            >
              <Undo2 className="w-3 h-3" />
              Desfazer
            </button>
          )}
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-white/20 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EFE8DE] text-[#5A4638] text-xs font-semibold uppercase tracking-wider mb-3">
          <Printer className="w-3.5 h-3.5 text-[#8C5E3C]" />
          Processo 3 • Revisão & Produção
        </div>
        <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#2C2420]">
          Homologação Final & Envio para Produção
        </h2>
        <p className="text-sm sm:text-base text-[#7A685B] mt-2">
          Revise a capa e as lâminas abaixo. Após conferir, confirme a aprovação para disparar o envio automático para o sistema de produção e nuvem.
        </p>
      </div>

      {/* Top Quick Status Ribbon */}
      <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E8DFD5] shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#5A4638]">
          <div className="flex items-center gap-1.5 font-medium">
            <BookOpen className="w-4 h-4 text-[#8C5E3C]" />
            <span><strong>10 Lâminas Duplas</strong> (20 Págs. 15x20 cm)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <User className="w-4 h-4 text-[#8C5E3C]" />
            <span>Cliente: <strong>{project.clientData.name || 'Cliente Villa7'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Fotos preenchidas: <strong>{filledSlots} de {totalSlots}</strong></span>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPreview}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#EFE8DE] text-xs font-semibold text-[#3D2C24] border border-[#DDD3C5] transition-colors cursor-pointer shadow-2xs"
        >
          <Eye className="w-4 h-4 text-[#8C5E3C]" />
          Abrir Livro 3D
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. REVISÃO DE LÂMINAS (VISÍVEL POR PRIMEIRO)                             */}
      {/* ========================================================================= */}
      <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-7 border-2 border-[#E0D6C8] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8DFD5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-[#3D2C24] text-white flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-amber-400" />
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C2420]">
                Revisão das Lâminas & Capa Fotográfica
              </h3>
            </div>
            <p className="text-xs text-[#7A685B] mt-1">
              Confira a sequência das 10 lâminas. Arraste qualquer foto sobre outra para trocar posições ou clique em <strong>Esquadrar Corte</strong> para ajustar o enquadramento.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {swapHistory.length > 0 && (
              <button
                type="button"
                onClick={handleUndoSwap}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2ECE4] text-[#3D2C24] text-xs font-semibold border border-[#D9CFC4] shadow-2xs transition-colors cursor-pointer"
                title="Desfazer última troca de fotos"
              >
                <Undo2 className="w-3.5 h-3.5 text-[#8C5E3C]" />
                Desfazer ({swapHistory.length})
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPhotoTray(!showPhotoTray)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                showPhotoTray
                  ? 'bg-[#3D2C24] text-white border-[#3D2C24]'
                  : 'bg-white hover:bg-[#F2ECE4] text-[#3D2C24] border-[#D9CFC4]'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
              {showPhotoTray ? 'Fechar Fotos' : 'Gaveta de Fotos'} ({project.photos.length})
            </button>
          </div>
        </div>

        {/* Selected for Swap Highlight Banner */}
        {selectedSlotForSwap && (
          <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-400/80 text-amber-950 flex flex-wrap items-center justify-between gap-2 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>
                {'isCover' in selectedSlotForSwap ? (
                  <strong>Capa do Álbum</strong>
                ) : (
                  <strong>
                    Foto da Lâmina {selectedSlotForSwap.spreadIndex + 1}
                  </strong>
                )}{' '}
                selecionada para troca! Clique agora na foto de destino.
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedSlotForSwap(null);
                setToastMessage(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-white text-amber-900 text-xs font-bold border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Cancelar Seleção ✕
            </button>
          </div>
        )}

        {/* Collapsible Photo Tray for Direct Insertion */}
        {showPhotoTray && (
          <div className="p-4 bg-white rounded-2xl border border-[#E0D6C8] space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-[#3D2C24] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#8C5E3C]" />
                Fotos do Projeto (Arraste uma foto diretamente para qualquer lâmina)
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setTrayFilter('all')}
                  className={`px-2 py-0.5 rounded-md ${trayFilter === 'all' ? 'bg-[#3D2C24] text-white font-bold' : 'text-[#7A685B] hover:bg-[#F2ECE4]'}`}
                >
                  Todas ({project.photos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTrayFilter('unused')}
                  className={`px-2 py-0.5 rounded-md ${trayFilter === 'unused' ? 'bg-[#3D2C24] text-white font-bold' : 'text-[#7A685B] hover:bg-[#F2ECE4]'}`}
                >
                  Não usadas ({project.photos.filter((p) => !usedPhotoIds.has(p.id)).length})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {availablePhotosForTray.map((photo) => {
                const isUsed = usedPhotoIds.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    draggable
                    onDragStart={(e) => handleDragStartFromTray(e, photo.id)}
                    className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-[#D9CFC4] hover:border-[#8C5E3C] relative group cursor-grab active:cursor-grabbing shadow-2xs transition-all hover:scale-105"
                    title="Arraste para uma lâmina"
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    {isUsed && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-600 rounded-full text-white flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold text-center p-1 pointer-events-none">
                      Arraste
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Spreads & Cover Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Cover Card */}
          <div
            className={`p-3.5 bg-[#FFFFFF] rounded-2xl border transition-all relative ${
              dragOverTarget === 'cover'
                ? 'ring-4 ring-amber-500 border-amber-500 bg-amber-50/40 scale-[1.02] shadow-lg z-20'
                : selectedSlotForSwap && 'isCover' in selectedSlotForSwap
                ? 'ring-3 ring-emerald-600 border-emerald-600 bg-emerald-50/20 shadow-md'
                : 'border-[#E0D6C8] shadow-2xs hover:border-[#C4B29E]'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDragEnter={() => setDragOverTarget('cover')}
            onDragLeave={() => setDragOverTarget(null)}
            onDrop={handleDropOnCover}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-[#8C5E3C]" />
                Capa do Álbum (15x20 cm Vertical)
              </span>
              <span className="text-xs text-amber-700 font-sans font-bold flex items-center gap-1">
                <Move className="w-3 h-3" />
                Arraste p/ trocar
              </span>
            </div>

            <div
              draggable={Boolean(project.cover.imageUrl || project.photos[0])}
              onDragStart={handleDragStartFromCover}
              onClick={handleCoverClick}
              className="w-full aspect-[3/2] bg-[#FAF7F2] rounded-xl overflow-hidden border border-[#D9CFC4] relative flex items-center justify-center cursor-grab active:cursor-grabbing group"
              title="Clique ou arraste para trocar foto da capa"
            >
              {project.cover.imageUrl ? (
                <img
                  src={project.cover.imageUrl}
                  alt="Capa"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : project.photos.length > 0 ? (
                <img
                  src={project.photos[0].url}
                  alt="Capa"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="p-2 text-center text-[10px] text-[#7A685B] font-serif font-bold">
                  {project.cover.title || project.clientData.albumTitle}
                </div>
              )}

              {/* Drag over overlay */}
              {dragOverTarget === 'cover' && (
                <div className="absolute inset-0 bg-amber-600/70 text-white flex flex-col items-center justify-center gap-1 text-xs font-bold animate-in fade-in">
                  <ArrowLeftRight className="w-6 h-6 animate-bounce" />
                  <span>Solte para Definir como Capa ⇄</span>
                </div>
              )}

              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-[11px] font-bold pointer-events-none">
                <ArrowLeftRight className="w-3.5 h-3.5 text-amber-400" />
                <span>Trocar Capa</span>
              </div>
            </div>

            <div className="mt-2 text-center text-[11px] font-serif font-bold text-[#3D2C24] truncate">
              {project.cover.title || project.clientData.albumTitle || 'VILLA7 MEMÓRIAS'}
            </div>
          </div>

          {/* Spreads List (10 Spreads) */}
          {validSpreads.map((spread, idx) => (
            <div
              key={spread.id}
              className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#E0D6C8] shadow-2xs hover:border-[#C4B29E] transition-all space-y-2"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] flex items-center justify-between flex-wrap gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[#3D2C24]">
                    Lâmina {idx + 1} (Págs. {idx * 2 + 1}-{idx * 2 + 2})
                  </span>
                  {spread.storyChapter && (
                    <span className="text-[9px] font-bold text-[#8C5E3C] bg-[#EAE0D5] px-1.5 py-0.5 rounded-full capitalize">
                      {spread.storyChapter}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {spread.timeRange && (
                    <span className="text-[9px] font-mono text-[#5A4638] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E8DFD5]">
                      ⏱ {spread.timeRange}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-[#8C5E3C] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#E8DFD5] font-bold flex items-center gap-1">
                    <Move className="w-3 h-3" />
                    {spread.slots.length === 1
                      ? '1 Foto Destaque'
                      : spread.slots.length === 2
                      ? '2 Fotos (1 por pág)'
                      : spread.slots.length === 3
                      ? '3 Fotos (1 a 2 por pág)'
                      : '4 Fotos (2 por pág)'}
                  </span>
                </div>
              </div>

              {/* 30x20 cm Canvas container */}
              <div className="w-full aspect-[3/2] bg-[#FAF7F2] rounded-xl overflow-hidden border border-[#D9CFC4] relative shadow-inner">
                {/* Center Spine Fold Line */}
                <div className="absolute inset-y-0 left-1/2 w-px bg-black/15 -translate-x-1/2 z-10 pointer-events-none" />

                {spread.slots.map((slot, sIdx) => {
                  const photo = slot.photoId ? photosMap.get(slot.photoId) : null;
                  const slotTargetKey = `spread-${idx}-slot-${sIdx}`;
                  const isDragOver = dragOverTarget === slotTargetKey;
                  const isSelected =
                    selectedSlotForSwap &&
                    !('isCover' in selectedSlotForSwap) &&
                    selectedSlotForSwap.spreadIndex === idx &&
                    selectedSlotForSwap.slotIndex === sIdx;

                  return (
                    <div
                      key={slot.id || sIdx}
                      draggable={Boolean(photo)}
                      onDragStart={(e) =>
                        handleDragStartFromSlot(e, idx, sIdx, slot.photoId)
                      }
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }}
                      onDragEnter={() => setDragOverTarget(slotTargetKey)}
                      onDragLeave={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                          setDragOverTarget(null);
                        }
                      }}
                      onDrop={(e) => handleDropOnSlot(e, idx, sIdx)}
                      onClick={() => handleSlotClick(idx, sIdx)}
                      className={`absolute overflow-hidden cursor-grab active:cursor-grabbing transition-all group ${
                        isDragOver
                          ? 'ring-4 ring-amber-500 bg-amber-400/30 scale-[1.03] z-30 shadow-xl'
                          : isSelected
                          ? 'ring-4 ring-emerald-600 ring-offset-2 z-20 shadow-md'
                          : 'hover:ring-2 hover:ring-amber-500/70 hover:z-10'
                      }`}
                      style={{
                        left: `${slot.x}%`,
                        top: `${slot.y}%`,
                        width: `${slot.width}%`,
                        height: `${slot.height}%`,
                      }}
                      title="Arraste para cima de outra foto para trocar"
                    >
                      {photo ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={photo.url}
                            alt=""
                            className="w-full h-full select-none pointer-events-none transition-transform"
                            style={{
                              objectFit: slot.fit || 'cover',
                              transform: `scale(${slot.zoom || 1}) translate(${slot.panX || 0}%, ${
                                slot.panY || 0
                              }%)`,
                              filter:
                                slot.filter === 'bw'
                                  ? 'grayscale(100%)'
                                  : slot.filter === 'warm'
                                  ? 'sepia(30%)'
                                  : slot.filter === 'vintage'
                                  ? 'sepia(50%) contrast(110%)'
                                  : slot.filter === 'soft'
                                  ? 'brightness(105%) contrast(95%)'
                                  : 'none',
                            }}
                          />

                          {/* Fit indicator tag */}
                          {slot.fit === 'contain' && (
                            <div className="absolute top-1 left-1 bg-black/70 text-white text-[8px] px-1 py-0.5 rounded font-sans pointer-events-none">
                              100%
                            </div>
                          )}

                          {/* Drag Hover State Overlay */}
                          {isDragOver && (
                            <div className="absolute inset-0 bg-amber-600/75 text-white flex flex-col items-center justify-center p-1 text-center font-bold text-[10px] animate-in fade-in z-20">
                              <ArrowLeftRight className="w-5 h-5 animate-spin" />
                              <span>Solte para Trocar ⇄</span>
                            </div>
                          )}

                          {/* Selected for Swap Badge */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-emerald-700/60 text-white flex flex-col items-center justify-center p-1 text-center font-bold text-[10px] animate-pulse z-20">
                              <Check className="w-5 h-5 mb-0.5" />
                              <span>Origem Selecionada</span>
                              <span className="text-[8px] font-normal">Clique na foto destino</span>
                            </div>
                          )}

                          {/* Hover Tooltip & Quick Action Toolbar */}
                          {!isDragOver && !isSelected && (
                            <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white p-1 z-10">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCropModalSlot({
                                    spreadIndex: idx,
                                    slotIndex: sIdx,
                                    slot,
                                    photo,
                                  });
                                }}
                                className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded-md shadow-xs transition-transform hover:scale-105 cursor-pointer"
                                title="Esquadrar e arrastar para evitar corte de cabeças, braços ou pernas"
                              >
                                <Move className="w-3 h-3" />
                                <span>🎯 Esquadrar Corte</span>
                              </button>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleFitMode(idx, sIdx, e)}
                                  className="text-[8px] font-semibold bg-white/90 text-[#3D2C24] hover:bg-white px-1.5 py-0.5 rounded shadow-xs cursor-pointer"
                                  title="Alternar Enquadramento (Preencher vs Sem Cortes)"
                                >
                                  {slot.fit === 'contain' ? 'Preencher' : 'Sem Cortes'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full bg-[#FAF7F2] border-2 border-dashed border-[#DDD3C5] flex flex-col items-center justify-center text-[9px] text-[#8C7A6B] p-1 text-center">
                          <Plus className="w-3 h-3 mb-0.5" />
                          <span>Solte foto aqui</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PÓS ELA: CAIXA DE DIÁLOGO SOBRE APROVAÇÃO COM ENVIO AUTOMÁTICO (SUPADATA) */}
      {/* ========================================================================= */}
      {!isSentSuccessfully && !isGenerating && (
        <div className="bg-gradient-to-br from-[#F5EFEB] to-[#EAE0D5] rounded-3xl p-6 sm:p-8 border-2 border-[#8C5E3C] shadow-md space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Visual Product Mockup Card */}
            <div className="lg:col-span-4 relative rounded-2xl overflow-hidden border border-[#E0D6C8] shadow-sm aspect-[4/3] group bg-[#E8DFD5]">
              <img
                src={IMAGE_ASSETS.mockupStack}
                alt="Fotolivro Impresso Villa7"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block">
                  Produção Gráfica Villa7
                </span>
                <span className="font-serif text-sm font-bold drop-shadow-sm">
                  10 Lâminas Duplas 15x20 Vertical
                </span>
              </div>
            </div>

            {/* Approval Info & Automatic Transmission to Supadata */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center shrink-0 shadow-xs">
                  <FileCheck className="w-5 h-5 text-[#EAE0D5]" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Cloud className="w-3 h-3" />
                      Envio Automático Configurado (Supadata / Nuvem)
                    </span>
                  </div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C2420]">
                    Aprovação Final & Envio Automático para Produção
                  </h3>
                  <p className="text-xs sm:text-sm text-[#685547] leading-relaxed">
                    Ao confirmar abaixo, o sistema compila o PDF de alta resolução (15x20 cm vertical / 20x30 cm aberto panorâmico, miolo branco sem linhas de corte) e realiza a <strong>transmissão automática direta para o Supadata / Nuvem de Produção</strong>, salvando também uma cópia no seu dispositivo.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                <label className="flex items-center gap-3 p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#DDD3C5] cursor-pointer hover:bg-white transition-colors flex-1">
                  <input
                    id="checkbox-formal-approval"
                    type="checkbox"
                    checked={agreementChecked}
                    onChange={(e) => setAgreementChecked(e.target.checked)}
                    className="w-4 h-4 text-[#8C5E3C] accent-[#8C5E3C] rounded cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-[#2C2420] font-medium leading-normal">
                    Revisei a capa e todas as 10 lâminas e autorizo o envio automático para produção.
                  </span>
                </label>

                <button
                  type="button"
                  id="btn-approve-and-send-production"
                  onClick={handleApproveAndSendToProduction}
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-[#3D2C24] hover:bg-[#2C2420] text-[#FAF7F2] font-bold text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-emerald-400" />
                  Aprovar & Enviar Automaticamente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generating Progress State */}
      {isGenerating && (
        <div className="bg-[#FAF7F2] rounded-3xl p-8 border border-[#E8DFD5] shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#EFE8DE] text-emerald-700 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <RefreshCw className="w-7 h-7 animate-spin" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#2C2420] mb-2">
            Processando e Transmitindo Álbum para a Nuvem...
          </h3>
          <p className="text-xs sm:text-sm text-[#7A685B] mb-4">{generationProgress.step}</p>

          <div className="w-full max-w-md mx-auto bg-[#E0D6C8] rounded-full h-3 overflow-hidden p-0.5">
            <div
              className="bg-emerald-700 h-full rounded-full transition-all duration-300"
              style={{ width: `${generationProgress.percent}%` }}
            />
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 mt-2 block">
            {generationProgress.percent}% concluído
          </span>
        </div>
      )}

      {/* Confirmation & Production Receipt Card */}
      {!isGenerating && isSentSuccessfully && pdfData && (
        <div className="bg-gradient-to-br from-[#F5EFEB] to-[#EAE0D5] rounded-3xl p-6 sm:p-8 border-2 border-emerald-600/30 shadow-md space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" />
                Envio Automático Concluído com Sucesso
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#2C2420]">
                Álbum Homologado & Transmitido para Produção!
              </h3>
              <p className="text-sm text-[#5A4638] leading-relaxed max-w-2xl">
                O arquivo final do fotolivro de 10 lâminas (15x20 cm vertical) foi transmitido com sucesso para a fila de produção em nuvem. Uma cópia de segurança em PDF foi gerada e salva no seu dispositivo.
              </p>
            </div>
          </div>

          {/* Detailed Cloud Receipt */}
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#DDD3C5] space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-semibold text-[#2C2420] block mb-0.5">
                  Arquivo PDF de Produção:
                </span>
                <span className="font-mono text-[#7A685B] break-all">
                  {pdfData.fileName}
                </span>
              </div>
              {supabaseResult?.publicUrl && (
                <a
                  href={supabaseResult.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs hover:bg-emerald-200 transition-colors inline-flex items-center gap-1 shrink-0"
                >
                  <Cloud className="w-3.5 h-3.5 text-emerald-700" />
                  Ver na Nuvem
                </a>
              )}
            </div>

            <div className="pt-2 border-t border-[#E8DFD5] flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-[#7A685B]">
                Status: <strong>Salvo no Armazenamento Seguro (Bucket: pdfs)</strong>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="btn-download-pdf-copy"
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#3D2C24] hover:bg-[#2C2420] text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Baixar Cópia Local (PDF)
                </button>

                <button
                  type="button"
                  id="btn-resend-album"
                  onClick={handleApproveAndSendToProduction}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#F2ECE4] text-[#5A4638] font-semibold text-xs border border-[#D9CFC4] transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reenviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RESUMO DO PROJETO & OPÇÃO MANUAL SECUNDÁRIA                           */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Client details card */}
        <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#E8DFD5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A685B] mb-2.5">
              <User className="w-4 h-4 text-[#8C5E3C]" />
              Identificação do Cliente
            </div>
            <h4 className="font-bold text-[#2C2420] text-sm">
              {project.clientData.name || 'Cliente Villa7'}
            </h4>
            <div className="text-xs text-[#7A685B] space-y-1 mt-2">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#A39282]" />
                {project.clientData.email || 'Não informado'}
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#A39282]" />
                {project.clientData.phone || 'Não informado'}
              </div>
            </div>
          </div>
        </div>

        {/* Structure details card */}
        <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#E8DFD5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A685B] mb-2.5">
              <BookOpen className="w-4 h-4 text-[#8C5E3C]" />
              Estrutura Gráfica
            </div>
            <h4 className="font-bold text-[#2C2420] text-sm font-serif">
              {project.clientData.albumTitle || 'Álbum Fotográfico'}
            </h4>
            <div className="text-xs text-[#7A685B] mt-2 space-y-0.5">
              <div>• 10 Lâminas Duplas (20 páginas rígidas)</div>
              <div>• Formato: 15x20 cm Vertical (Aberto 20x30 cm)</div>
              <div>• Miolo: Branco Puro com Impressão Livre de Linhas</div>
              <div>• Capa: Foto Proporcional com Zero Distorção</div>
            </div>
          </div>
        </div>

        {/* Manual PDF Upload Card (Optional / Backup) */}
        <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#E8DFD5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A685B] mb-2.5">
              <Cloud className="w-4 h-4 text-[#8C5E3C]" />
              Envio Manual de PDF (Opcional)
            </div>
            <p className="text-xs text-[#7A685B] mb-3">
              Caso tenha um PDF externo pronto, envie diretamente para a nuvem de produção.
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowManualUpload(!showManualUpload)}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-white hover:bg-[#EFE8DE] text-xs font-semibold text-[#3D2C24] border border-[#DDD3C5] transition-colors cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5 text-[#8C5E3C]" />
              {showManualUpload ? 'Ocultar Envio Manual' : 'Enviar PDF Avulso'}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Manual PDF Upload Section */}
      {showManualUpload && (
        <div className="bg-[#FAF7F2] rounded-3xl p-6 border-2 border-[#E8DFD5] shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center shrink-0">
              <Cloud className="w-5 h-5 text-[#EAE0D5]" />
            </div>
            <div>
              <h4 className="font-serif text-lg font-bold text-[#2C2420]">
                Upload Manual de Arquivo PDF
              </h4>
              <p className="text-xs text-[#7A685B]">
                Envie arquivos PDF prontos diretamente para a fila de produção da Villa7.
              </p>
            </div>
          </div>

          {manualUploadResult && manualUploadResult.success ? (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-300 text-emerald-950 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                <Check className="w-4 h-4" />
                PDF avulso enviado com sucesso!
              </div>
              <div className="font-mono text-[11px] break-all">{manualUploadResult.fileName}</div>
              <button
                type="button"
                onClick={() => setManualUploadResult(null)}
                className="mt-2 px-3 py-1 bg-white border border-emerald-300 rounded-lg font-semibold text-emerald-900"
              >
                Enviar Outro Arquivo
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <label className={`px-5 py-2.5 rounded-xl bg-[#3D2C24] hover:bg-[#2C2420] text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2 ${isUploadingManual ? 'opacity-50 pointer-events-none' : ''}`}>
                {isUploadingManual ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 rotate-180 text-emerald-400" />
                    Selecionar PDF do Dispositivo
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleManualPdfUpload}
                  disabled={isUploadingManual}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-[#7A685B]">Até 100MB por arquivo</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t border-[#E8DFD5]">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-[#5A4638] hover:bg-[#EFE8DE] transition-colors border border-[#DDD3C5] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Estúdio de Criação
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-[#8C5E3C] hover:bg-[#EFE8DE] transition-colors cursor-pointer"
        >
          Criar Novo Álbum
        </button>
      </div>

      {/* Photo Crop & Safe Framing Modal */}
      <PhotoCropModal
        isOpen={cropModalSlot !== null}
        slot={cropModalSlot?.slot || null}
        photo={cropModalSlot?.photo || null}
        onSave={handleSaveCropModal}
        onClose={() => setCropModalSlot(null)}
      />
    </div>
  );
};
