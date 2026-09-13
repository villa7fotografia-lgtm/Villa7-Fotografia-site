import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Check,
  Download,
  Printer,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Lock,
  ArrowLeft,
  MapPin,
  FileCheck,
  RotateCcw,
  MessageCircle,
  Clock,
  Phone,
  Mail,
  User,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { AlbumProject, ClientData, CoverData } from '../../types';
import { generateAlbumPDF, PDFGenerationProgress } from '../../services/pdfGenerator';
import { SupabaseStorageService, SupabaseUploadResult } from '../../services/supabaseStorage';
import confetti from 'canvas-confetti';
import { MERCADO_LIVRE_PRODUCT_URL } from '../../constants/imageAssets';

interface Process4ProductionProps {
  project: AlbumProject;
  onChangeClientData?: (data: Partial<ClientData>) => void;
  onApproveProject: (approved: boolean) => void;
  onPrev: () => void;
  onReset: () => void;
}

export const Process4Production: React.FC<Process4ProductionProps> = ({
  project,
  onChangeClientData,
  onApproveProject,
  onPrev,
  onReset,
}) => {
  const [termApproved, setTermApproved] = useState<boolean>(project.clientData.isApproved || false);
  const [mercadoLivreCode, setMercadoLivreCode] = useState<string>(
    project.clientData.mercadoLivreOrderId || ''
  );
  const [specialPassword, setSpecialPassword] = useState<string>(
    project.clientData.specialReleasePassword || ''
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<PDFGenerationProgress>({
    step: 'Iniciando compilação do álbum...',
    percent: 0,
  });
  const [pdfResult, setPdfResult] = useState<{ blob: Blob; fileName: string; dataUri: string } | null>(
    null
  );
  const [supabaseResult, setSupabaseResult] = useState<SupabaseUploadResult | null>(null);
  const [backupCopyResult, setBackupCopyResult] = useState<{
    fileName: string;
    timestamp: string;
    jsonBlobUrl: string;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(project.orderStatus === 'in_production');
  const [projectV7Code] = useState<string>(() => {
    return `V7-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  });

  const isCodeValid = mercadoLivreCode.trim().length > 0;
  const isPasswordValid = specialPassword.trim().toLowerCase() === 'villapaz26';
  const canApprove = (isCodeValid || isPasswordValid) && termApproved && !isGenerating;

  const handleStartProduction = async () => {
    if (!canApprove) return;
    setIsGenerating(true);

    try {
      // 1. Generate 300 DPI Fine Art Production PDF (with Horizontal Cover Wrap, Spine 2x6 cm, and open-source browser-based Miolo processing)
      const result = await generateAlbumPDF(
        project,
        (p) => setProgress(p)
      );

      setPdfResult(result);

      // 2. CÓPIA AUTOMÁTICA PÓS-APROVAÇÃO & DIGITAÇÃO DA SENHA
      const approvedCopyTimestamp = new Date().toISOString();
      const approvedProjectCopy: AlbumProject = {
        ...project,
        id: `V7-APPROVED-${Date.now()}`,
        orderStatus: 'in_production',
        clientData: {
          ...project.clientData,
          isApproved: true,
          approvalDate: new Date().toLocaleDateString('pt-BR'),
          mercadoLivreOrderId: mercadoLivreCode,
          specialReleasePassword: specialPassword,
        },
      };

      const cleanClientName = SupabaseStorageService.sanitizeText(project.clientData.name || 'cliente');
      const copyFileName = `copia_aprovada_${projectV7Code}_${cleanClientName}_${Date.now()}.json`;
      const copyJsonString = JSON.stringify(approvedProjectCopy, null, 2);
      const copyBlob = new Blob([copyJsonString], { type: 'application/json' });
      const copyUrl = URL.createObjectURL(copyBlob);

      // 2a. Salvar cópia homologada no localStorage (Arquivo Permanente de Projetos Aprovados)
      try {
        localStorage.setItem('villa7_latest_approved_copy', copyJsonString);
        const existingArchiveStr = localStorage.getItem('villa7_approved_projects_archive');
        const existingArchive = existingArchiveStr ? JSON.parse(existingArchiveStr) : [];
        existingArchive.unshift({
          code: projectV7Code,
          approvedAt: approvedCopyTimestamp,
          clientName: project.clientData.name || 'Cliente Villa7',
          albumTitle: project.clientData.albumTitle || project.cover.title,
          spreadCount: project.spreadCount,
          mercadoLivreOrderId: mercadoLivreCode,
          fileName: copyFileName,
        });
        localStorage.setItem(
          'villa7_approved_projects_archive',
          JSON.stringify(existingArchive.slice(0, 25))
        );
      } catch (storageErr) {
        console.warn('Persistência local da cópia:', storageErr);
      }

      // 2b. Upload automático da cópia para o Supabase Storage
      try {
        await SupabaseStorageService.salvarJsonNoSupabase(approvedProjectCopy, copyFileName);
      } catch (jsonUpErr) {
        console.warn('Backup JSON no Supabase:', jsonUpErr);
      }

      // 2c. Disparo de download automático da cópia do projeto para segurança imediata do usuário
      try {
        const copyDownloadLink = document.createElement('a');
        copyDownloadLink.href = copyUrl;
        copyDownloadLink.download = copyFileName;
        document.body.appendChild(copyDownloadLink);
        copyDownloadLink.click();
        document.body.removeChild(copyDownloadLink);
      } catch (dlErr) {
        console.warn('Disparo de download automático da cópia:', dlErr);
      }

      setBackupCopyResult({
        fileName: copyFileName,
        timestamp: new Date().toLocaleString('pt-BR'),
        jsonBlobUrl: copyUrl,
      });

      // 3. Upload do PDF para Supabase Storage
      try {
        const uploadRes = await SupabaseStorageService.salvarPdfNoSupabase(
          result.blob,
          result.fileName
        );
        setSupabaseResult(uploadRes);
      } catch (err) {
        console.warn('Upload Supabase opcional falhou:', err);
      }

      // 4. Marcar como aprovado no estado do aplicativo
      onApproveProject(true);
      if (onChangeClientData) {
        onChangeClientData({
          isApproved: true,
          approvalDate: new Date().toLocaleDateString('pt-BR'),
          mercadoLivreOrderId: mercadoLivreCode,
          specialReleasePassword: specialPassword,
        });
      }

      setIsCompleted(true);

      // 5. Confetti Celebration
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#B39770', '#3D2C24', '#FAF7F2', '#211D19'],
      });
    } catch (err) {
      console.error('Erro na produção do álbum:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!pdfResult) return;
    const a = document.createElement('a');
    a.href = pdfResult.dataUri;
    a.download = pdfResult.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadCopyJson = () => {
    if (!backupCopyResult) return;
    const a = document.createElement('a');
    a.href = backupCopyResult.jsonBlobUrl;
    a.download = backupCopyResult.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {!isCompleted ? (
        <>
          {/* Header */}
          <div className="text-center space-y-2 pb-6 border-b border-[#E8DFD5]">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#B39770] block">
              Etapa 4 de 4 • Finalização & Envio
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#211D19]">
              Seu álbum está quase a caminho da gráfica.
            </h2>
            <p className="text-sm text-[#7A685B] max-w-xl mx-auto">
              Confira as informações finais para colocarmos seu projeto em produção com padrão Fine Art.
            </p>
          </div>

          {/* Resumo do Pedido */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DDD3C5] shadow-xs space-y-6">
            <h3 className="font-serif text-lg font-bold text-[#211D19] flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#B39770]" />
              <span>Resumo Completo do Pedido</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
              {/* Product Specifications */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3D2C24] block">
                  Especificações do Álbum
                </span>
                <div className="space-y-1 text-[#5A4638]">
                  <p>
                    <strong className="text-[#211D19]">Título do Projeto:</strong>{' '}
                    {project.cover.title || project.clientData.albumTitle || 'Álbum Fotográfico'}
                  </p>
                  <p>
                    <strong className="text-[#211D19]">Formato:</strong> 15x20 cm Vertical (20x30 cm aberto)
                  </p>
                  <p>
                    <strong className="text-[#211D19]">Extensão:</strong> 10 lâminas panorâmicas (20 páginas)
                  </p>
                  <p>
                    <strong className="text-[#211D19]">Papel & Impressão:</strong> Papel Fotográfico Silk 800g/m² com laminação térmica UV e abertura 180° Flat-lay
                  </p>
                  <p>
                    <strong className="text-[#211D19]">Capa Dura:</strong> Gravação Hot Stamping ({project.cover.foilColor || 'Dourado'})
                  </p>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#3D2C24] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B39770]" />
                  <span>Endereço de Entrega</span>
                </span>
                <div className="space-y-1 text-[#5A4638]">
                  <p>
                    <strong className="text-[#211D19]">Destinatário:</strong>{' '}
                    {project.clientData.clientName || 'Cliente Villa7'}
                  </p>
                  <p>
                    <strong className="text-[#211D19]">Endereço:</strong>{' '}
                    {project.clientData.deliveryAddress?.street
                      ? `${project.clientData.deliveryAddress.street}, ${project.clientData.deliveryAddress.number || 'S/N'}`
                      : 'Endereço fornecido no pedido Mercado Livre'}
                  </p>
                  <p>
                    <strong className="text-[#211D19]">Bairro / Cidade:</strong>{' '}
                    {project.clientData.deliveryAddress?.neighborhood
                      ? `${project.clientData.deliveryAddress.neighborhood}, ${project.clientData.deliveryAddress.city} - ${project.clientData.deliveryAddress.state}`
                      : 'Cadastrado'}
                  </p>
                  <p>
                    <strong className="text-[#211D19]">CEP:</strong>{' '}
                    {project.clientData.deliveryAddress?.cep || 'Informado na compra'}
                  </p>
                  <p>
                    <strong className="text-[#211D19]">Contato:</strong>{' '}
                    {project.clientData.clientPhone || project.clientData.clientEmail || 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Código Mercado Livre Verification */}
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#3D2C24] block">
                    Código da Compra Mercado Livre
                  </label>
                  <span className="text-xs text-[#7A685B]">
                    Insira o número do pedido Mercado Livre para vincular a produção:
                  </span>
                </div>
                <a
                  href={MERCADO_LIVRE_PRODUCT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-[#8C5E3C] hover:underline flex items-center gap-1 self-start sm:self-auto"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Comprar no Mercado Livre</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={mercadoLivreCode}
                  onChange={(e) => {
                    setMercadoLivreCode(e.target.value);
                    if (onChangeClientData) {
                      onChangeClientData({ mercadoLivreOrderId: e.target.value });
                    }
                  }}
                  placeholder="Ex: MLB-200000492837482"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-white text-xs font-mono text-[#211D19]"
                />

                <input
                  type="password"
                  value={specialPassword}
                  onChange={(e) => {
                    setSpecialPassword(e.target.value);
                    if (onChangeClientData) {
                      onChangeClientData({ specialReleasePassword: e.target.value });
                    }
                  }}
                  placeholder="Senha de liberação direta (opcional)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DDD3C5] bg-white text-xs text-[#211D19]"
                />
              </div>

              {!isCodeValid && !isPasswordValid && (
                <p className="text-[11px] text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Insira o código do seu pedido Mercado Livre ou senha de liberação para autorizar a impressão.
                </p>
              )}
            </div>

            {/* Termo de Aprovação Checkbox */}
            <div className="p-4 rounded-2xl bg-[#F7F3EC] border border-[#DDD3C5] flex items-start gap-3">
              <input
                type="checkbox"
                id="checkbox-term-approval"
                checked={termApproved}
                onChange={(e) => setTermApproved(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-[#DDD3C5] text-[#3D2C24] accent-[#3D2C24] cursor-pointer"
              />
              <label
                htmlFor="checkbox-term-approval"
                className="text-xs sm:text-sm text-[#211D19] leading-relaxed cursor-pointer select-none"
              >
                <strong>Termo de Aprovação:</strong> Eu revisei a capa, os textos e as fotos do álbum e aprovo este projeto para impressão. Estou ciente de que após o envio para a gráfica, nenhuma alteração poderá ser realizada.
              </label>
            </div>

            {/* Progress Bar during generation */}
            {isGenerating && (
              <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-bold text-[#3D2C24]">
                  <span>{progress.step}</span>
                  <span className="font-mono">{progress.percent}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#EAE0D5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#3D2C24] transition-all duration-300 rounded-full"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              type="button"
              disabled={!canApprove}
              onClick={handleStartProduction}
              className="w-full py-4 bg-[#3D2C24] hover:bg-[#211D19] disabled:opacity-50 text-[#FAF7F2] rounded-2xl font-bold text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-5 h-5 text-[#B39770]" />
              <span>
                {isGenerating
                  ? 'Compilando e enviando para produção...'
                  : 'APROVAR E ENVIAR PARA PRODUÇÃO'}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#DDD3C5] bg-white text-xs font-semibold text-[#5A4638] hover:bg-[#FAF7F2] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar e Conferir Álbum</span>
            </button>
          </div>
        </>
      ) : (
        /* CELEBRATION SCREEN: SUCESSO ABSOLUTO */
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#DDD3C5] shadow-xl text-center space-y-6 animate-in zoom-in-95">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-700 shadow-sm">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#B39770]/20 text-[#6E5536] text-xs font-bold uppercase tracking-wider">
              Produção Iniciada
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#211D19]">
              Projeto aprovado com sucesso!
            </h2>
            <p className="text-sm text-[#7A685B] max-w-lg mx-auto leading-relaxed">
              Seu álbum fotográfico entrou na fila de impressão e encadernação artesanal do Ateliê Villa7.
            </p>
          </div>

          {/* Project Details Badge */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5] space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-[#E8DFD5] pb-2 text-xs">
              <span className="text-[#7A685B]">Código do Projeto:</span>
              <span className="font-mono font-bold text-[#211D19]">{projectV7Code}</span>
            </div>
            <div className="flex items-center justify-between border-b border-[#E8DFD5] pb-2 text-xs">
              <span className="text-[#7A685B]">Status:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Em Produção (Travado)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7A685B]">Prazo Estimado:</span>
              <span className="font-bold text-[#3D2C24] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#B39770]" /> 5 a 7 dias úteis
              </span>
            </div>
          </div>

          {/* Backup Copy Notice */}
          {backupCopyResult && (
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-left space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cópia de Segurança Criada e Arquivada Automaticamente</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                O arquivo de backup completo com todas as definições da capa e miolo foi registrado em {backupCopyResult.timestamp} e arquivado com segurança para a produção gráfica.
              </p>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 pt-4">
            {pdfResult && (
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="w-full sm:w-auto px-6 py-3 bg-[#3D2C24] hover:bg-[#211D19] text-[#FAF7F2] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <Download className="w-4 h-4 text-[#B39770]" />
                <span>Baixar PDF de Produção (300 DPI)</span>
              </button>
            )}

            {backupCopyResult && (
              <button
                type="button"
                onClick={handleDownloadCopyJson}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-[#FAF7F2] text-[#3D2C24] border border-[#DDD3C5] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <FileText className="w-4 h-4 text-[#B39770]" />
                <span>Baixar Cópia do Projeto (.JSON)</span>
              </button>
            )}

            <a
              href="https://wa.me/5511999999999?text=Ol%C3%A1%20Villa7!%20Aprovei%20meu%20%C3%A1lbum%20com%20o%20c%C3%B3digo%20"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-[#25D366] hover:bg-[#1EBE5B] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Suporte via WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={onReset}
              className="w-full sm:w-auto px-5 py-3 text-xs text-[#7A685B] hover:text-[#211D19] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Criar Novo Álbum</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
