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
} from 'lucide-react';
import { AlbumProject, PhotoItem } from '../../types';
import { generateAlbumPDF, PDFGenerationProgress } from '../../services/pdfGenerator';
import {
  SupabaseStorageService,
  SupabaseUploadResult,
} from '../../services/supabaseStorage';
import confetti from 'canvas-confetti';

interface Process3Props {
  project: AlbumProject;
  onApproveProject: (approved: boolean) => void;
  onOpenPreview: () => void;
  onPrev: () => void;
  onReset: () => void;
}

export const Process3ReviewAndProduction: React.FC<Process3Props> = ({
  project,
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
  const [, setSupabaseResult] = useState<SupabaseUploadResult | null>(null);

  const [isUploadingManual, setIsUploadingManual] = useState(false);
  const [manualUploadResult, setManualUploadResult] = useState<SupabaseUploadResult | null>(null);

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

  const totalSlots = project.spreads.reduce(
    (acc, spread) => acc + spread.slots.length,
    0
  );
  const filledSlots = project.spreads.reduce(
    (acc, spread) =>
      acc + spread.slots.filter((slot) => Boolean(slot.photoId)).length,
    0
  );

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
          Revise a composição completa e clique em <strong>Aprovar e Enviar para a Produção</strong>. O arquivo de alta resolução será enviado e uma cópia será baixada em seu dispositivo.
        </p>
      </div>

      {/* STANDALONE CLIENT PDF UPLOAD FORM (Envio de PDFs para Fila de Produção) */}
      <div className="bg-[#FAF7F2] rounded-3xl p-6 sm:p-8 border-2 border-[#E8DFD5] shadow-xs space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center shrink-0 shadow-xs">
              <Cloud className="w-6 h-6 text-[#EAE0D5]" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C5E3C] bg-[#EFE8DE] px-2.5 py-0.5 rounded-full">
                Produção & Armazenamento Seguro
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2C2420] mt-1">
                Envio Direto de PDF para Impressão
              </h3>
              <p className="text-xs sm:text-sm text-[#7A685B]">
                Envie seus arquivos PDF diretamente para a fila de homologação e produção da Villa7. Sem perda de qualidade ou compressão.
              </p>
            </div>
          </div>
        </div>

        {/* Upload Success Card */}
        {manualUploadResult && manualUploadResult.success && (
          <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/60 rounded-2xl border-2 border-emerald-500/40 text-emerald-950 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h4 className="font-serif text-lg font-bold text-emerald-950">
                  ✓ Arquivo enviado com sucesso!
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800">
                  Recebemos seu PDF. Você já pode fechar esta página.
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-emerald-200/80 text-xs space-y-1 font-mono text-emerald-900 break-all">
              <div><strong>Arquivo:</strong> {manualUploadResult.fileName}</div>
              <div><strong>Tamanho:</strong> {manualUploadResult.fileSizeMB?.toFixed(2)} MB</div>
              <div><strong>Destino:</strong> Armazenamento Seguro em Nuvem</div>
              {manualUploadResult.publicUrl && (
                <div className="pt-1">
                  <strong>Link:</strong>{' '}
                  <a href={manualUploadResult.publicUrl} target="_blank" rel="noreferrer" className="underline font-bold text-emerald-800 hover:text-emerald-950">
                    {manualUploadResult.publicUrl}
                  </a>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setManualUploadResult(null);
                }}
                className="px-4 py-2 rounded-xl bg-white text-emerald-900 font-semibold text-xs border border-emerald-300 hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Enviar Outro Arquivo PDF
              </button>
            </div>
          </div>
        )}

        {/* Upload Form Area */}
        {(!manualUploadResult || !manualUploadResult.success) && (
          <div className="space-y-4">
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <label className={`px-6 py-3.5 rounded-2xl bg-[#3D2C24] hover:bg-[#2C2420] text-white text-sm font-bold shadow-md transition-all hover:scale-[1.01] cursor-pointer inline-flex items-center gap-2.5 ${isUploadingManual ? 'opacity-50 pointer-events-none' : ''}`}>
                {isUploadingManual ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    Enviando seu arquivo...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 rotate-180 text-emerald-400" />
                    Selecionar Arquivo PDF e Enviar
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
              <span className="text-xs text-[#7A685B]">
                Formatos aceitos: <strong>.pdf</strong> (Até 100MB por arquivo)
              </span>
            </div>

            {manualUploadResult && !manualUploadResult.success && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2 animate-in fade-in duration-150">
                <ShieldCheck className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong>Erro no envio:</strong> {manualUploadResult.error}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Summary Cards Row */}
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
              <div>• {project.spreadCount} Lâminas Duplas ({project.spreadCount * 2} páginas)</div>
              <div>• Formato: 15x20 cm Vertical (Aberto 20x30 cm)</div>
              <div>• Miolo: Branco Puro com Impressão Livre de Linhas</div>
              <div>• Impressão: 1 Lâmina por Página A4 (Papel 297x210 mm)</div>
              <div>• Capa: Foto Proporcional com Zero Distorção</div>
            </div>
          </div>
        </div>

        {/* Status card */}
        <div className="bg-[#FAF7F2] rounded-3xl p-5 border border-[#E8DFD5] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#7A685B] mb-2.5">
              <ShieldCheck className="w-4 h-4 text-[#8C5E3C]" />
              Status da Produção
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#7A685B]">Espaços preenchidos:</span>
                <span className="font-bold text-[#2C2420]">
                  {filledSlots} de {totalSlots}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#7A685B]">Status:</span>
                <span className={`font-semibold ${isSentSuccessfully ? 'text-emerald-700 font-bold' : 'text-[#8C5E3C]'}`}>
                  {isSentSuccessfully ? 'Enviado com Sucesso ✓' : 'Pendente de Aprovação'}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenPreview}
            className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#EFE8DE] text-xs font-semibold text-[#3D2C24] border border-[#DDD3C5] transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#8C5E3C]" />
            Abrir Livro 3D (15x20)
          </button>
        </div>
      </div>

      {/* Spreads & Cover Gallery Overview */}
      <div className="bg-[#FAF7F2] rounded-3xl p-6 border border-[#E8DFD5] shadow-xs space-y-4">
        <h3 className="font-serif text-lg font-bold text-[#2C2420] flex items-center justify-between">
          <span>Galeria de Lâminas (20x30 cm Aberto / 15x20 Vertical)</span>
          <span className="text-xs font-sans font-normal text-[#7A685B]">
            {project.spreads.length} lâminas panorâmicas prontas
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Cover */}
          <div className="p-3 bg-[#FFFFFF] rounded-2xl border border-[#E0D6C8] shadow-2xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-1.5 flex items-center justify-between">
              <span>Capa do Álbum (15x20 cm Vertical)</span>
              <span className="text-emerald-700">✓ Pronta</span>
            </div>
            <div className="w-full aspect-[3/2] bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#D9CFC4] relative flex items-center justify-center">
              {project.cover.imageUrl ? (
                <img
                  src={project.cover.imageUrl}
                  alt="Capa"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="p-2 text-center text-[10px] text-[#7A685B] font-serif font-bold">
                  {project.cover.title || project.clientData.albumTitle}
                </div>
              )}
            </div>
          </div>

          {/* Spreads */}
          {project.spreads.map((spread, idx) => (
            <div
              key={spread.id}
              className="p-3 bg-[#FFFFFF] rounded-2xl border border-[#E0D6C8] shadow-2xs"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] mb-1.5 flex items-center justify-between">
                <span>
                  Lâmina {idx + 1} (Págs. {idx * 2 + 1}-{idx * 2 + 2})
                </span>
                <span className="font-mono text-[#A39282]">{spread.slots.length} fotos</span>
              </div>

              <div className="w-full aspect-[3/2] bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#D9CFC4] relative">
                <div className="absolute inset-y-0 left-1/2 w-px bg-black/10 -translate-x-1/2" />
                {spread.slots.map((slot, sIdx) => {
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
                          alt=""
                          className="w-full h-full"
                          style={{
                            objectFit: slot.fit || 'cover',
                            filter:
                              slot.filter === 'bw'
                                ? 'grayscale(100%)'
                                : slot.filter === 'warm'
                                ? 'sepia(30%)'
                                : 'none',
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-[#FAF7F2] border border-dashed border-[#DDD3C5]" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formal Digital Approval Box (Visible when not yet completed) */}
      {!isSentSuccessfully && !isGenerating && (
        <div className="bg-gradient-to-br from-[#F5EFEB] to-[#EAE0D5] rounded-3xl p-6 sm:p-8 border-2 border-[#8C5E3C] shadow-md space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#3D2C24] text-[#FAF7F2] flex items-center justify-center shrink-0 shadow-xs">
              <FileCheck className="w-6 h-6 text-[#EAE0D5]" />
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C2420]">
                  Aprovação Final & Envio para a Produção
                </h3>
                <p className="text-xs sm:text-sm text-[#685547] mt-1 leading-relaxed">
                  Ao clicar no botão abaixo, o arquivo oficial de alta resolução (15x20 cm vertical / 20x30 cm aberto, capa com foto sem distorção, miolo branco sem linhas, 1 página por lâmina A4 com guias de corte) será processado, enviado para a produção e uma cópia será baixada automaticamente em seu dispositivo.
                </p>
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
                    Revisei a capa e lâminas e autorizo o envio do álbum para produção.
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
                  Aprovar e Enviar para a Produção
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
            Processando e Enviando Álbum...
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

      {/* Confirmation & Download Card */}
      {!isGenerating && isSentSuccessfully && pdfData && (
        <div className="bg-gradient-to-br from-[#F5EFEB] to-[#EAE0D5] rounded-3xl p-6 sm:p-8 border-2 border-emerald-600/30 shadow-md space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2 text-center sm:text-left flex-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                <Check className="w-3.5 h-3.5" />
                Envio Confirmado
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#2C2420]">
                Álbum Enviado com Sucesso!
              </h3>
              <p className="text-sm text-[#5A4638] leading-relaxed max-w-2xl">
                O arquivo final do álbum de alta resolução foi processado e homologado para a produção gráfica. Uma cópia do arquivo PDF foi salva no seu dispositivo.
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#DDD3C5] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#5A4638] text-center sm:text-left">
              <span className="font-semibold text-[#2C2420] block mb-0.5">
                Cópia de Segurança:
              </span>
              <span className="font-mono text-[#7A685B] break-all">
                {pdfData.fileName}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                id="btn-download-pdf-copy"
                onClick={handleDownloadPdf}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#3D2C24] hover:bg-[#2C2420] text-white font-bold text-sm shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                Baixar Cópia no Dispositivo (PDF)
              </button>

              <button
                type="button"
                id="btn-resend-album"
                onClick={handleApproveAndSendToProduction}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl bg-white hover:bg-[#F2ECE4] text-[#5A4638] font-semibold text-xs border border-[#D9CFC4] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reenviar
              </button>
            </div>
          </div>
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
    </div>
  );
};
