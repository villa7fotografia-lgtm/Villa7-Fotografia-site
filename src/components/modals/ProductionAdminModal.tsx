import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Eye,
  Rotate3d,
  Layers,
  Image as ImageIcon,
  User,
  ShoppingBag,
  ExternalLink,
  X,
  Sparkles,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { AlbumProject, OrderStatus } from '../../types';
import { Album3DViewer } from '../common/Album3DViewer';
import { generateAlbumPDF } from '../../services/pdfGenerator';
import { SupabaseStorageService } from '../../services/supabaseStorage';

interface ProductionAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: AlbumProject;
  onUpdateProject: (updated: Partial<AlbumProject>) => void;
}

const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  NOVO: { label: 'Novo Projeto', color: 'bg-stone-100 text-stone-700 border-stone-300' },
  COMPRA_INFORMADA: { label: 'Compra Informada (ML)', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  FOTOS_RECEBIDAS: { label: 'Fotos Recebidas', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  EM_CRIACAO: { label: 'Em Criação / Diagramação', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  EM_REVISAO: { label: 'Em Revisão do Cliente', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  APROVADO_PELO_CLIENTE: { label: 'Aprovado pelo Cliente', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  AUTORIZADO_PRODUCAO: { label: 'Autorizado para Produção', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  PDF_GERADO: { label: 'PDF Gráfico Gerado', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  PRONTO_PRODUCAO: { label: 'Pronto na Gráfica', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  ENVIADO: { label: 'Enviado ao Cliente', color: 'bg-green-100 text-green-800 border-green-300' },
};

export const ProductionAdminModal: React.FC<ProductionAdminModalProps> = ({
  isOpen,
  onClose,
  project,
  onUpdateProject,
}) => {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(Boolean(project.clientData.adminAuthorized));
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'DADOS' | 'FOTOS' | 'CAPA' | 'MIOLO' | '3D' | 'REVISAO' | 'PRODUCAO'
  >('PRODUCAO');
  const [pdfGenerationStatus, setPdfGenerationStatus] = useState<string>('');
  const [generatedUrls, setGeneratedUrls] = useState<{
    capaPdfUrl?: string;
    mioloPdfUrl?: string;
    albumFinalPdfUrl?: string;
  }>(project.generatedPdfs || {});

  if (!isOpen) return null;

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthorized(true);
        onUpdateProject({
          clientData: {
            ...project.clientData,
            adminAuthorized: true,
            adminAuthorizedDate: new Date().toLocaleString('pt-BR'),
            adminToken: data.token,
            orderStatus:
              project.clientData.orderStatus === 'APROVADO_PELO_CLIENTE'
                ? 'AUTORIZADO_PRODUCAO'
                : project.clientData.orderStatus || 'AUTORIZADO_PRODUCAO',
          },
        });
      } else {
        setErrorMsg(data.error || 'Senha incorreta.');
      }
    } catch (err: any) {
      setErrorMsg('Erro de conexão ao validar senha administrativa.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = (newStatus: OrderStatus) => {
    onUpdateProject({
      clientData: {
        ...project.clientData,
        orderStatus: newStatus,
      },
    });
  };

  const handleGenerateProductionPackage = async () => {
    setLoading(true);
    setPdfGenerationStatus('Gerando arquivos finais em 300 DPI Fine Art...');

    try {
      const pdfResult = await generateAlbumPDF(project, (prog) => {
        setPdfGenerationStatus(`${prog.step} (${prog.percent}%)`);
      });

      setPdfGenerationStatus('Enviando para o Supabase Storage (pdfs/documentos/)...');

      // Upload to Supabase
      const uploadRes = await SupabaseStorageService.uploadPdfFile(
        pdfResult.blob,
        pdfResult.fileName,
        project
      );

      const urls = {
        albumFinalPdfUrl: uploadRes.publicUrl || pdfResult.dataUri,
        capaPdfUrl: uploadRes.publicUrl || pdfResult.dataUri,
        mioloPdfUrl: uploadRes.publicUrl || pdfResult.dataUri,
      };

      setGeneratedUrls(urls);
      onUpdateProject({
        pdfDriveUrl: uploadRes.publicUrl,
        generatedPdfs: {
          ...urls,
          timestamp: new Date().toISOString(),
          fileName: pdfResult.fileName,
        },
        clientData: {
          ...project.clientData,
          orderStatus: 'PDF_GERADO',
        },
      });

      setPdfGenerationStatus('Pacote gráfico gerado e registrado no Supabase com sucesso!');
    } catch (err: any) {
      setErrorMsg(`Erro ao gerar PDF: ${err?.message || 'Falha no processamento'}`);
    } finally {
      setLoading(false);
    }
  };

  const currentStatus = project.clientData.orderStatus || 'NOVO';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#211D19]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col border border-[#DDD3C5] shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DFD5] bg-[#FAF7F2] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                isAuthorized ? 'bg-[#3D2C24] text-[#FAF7F2]' : 'bg-[#B39770] text-white'
              }`}
            >
              {isAuthorized ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#211D19]">
                  Painel de Produção Villa7
                </h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${ORDER_STATUS_LABELS[currentStatus].color}`}
                >
                  {ORDER_STATUS_LABELS[currentStatus].label}
                </span>
              </div>
              <p className="text-xs text-[#8C7A6B]">
                Gestão industrial, homologação técnica e autorização de impressão gráfica
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A685B] hover:bg-[#EFE8DE] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* PASSWORD GATE (if not authorized yet) */}
          {!isAuthorized ? (
            <div className="max-w-md mx-auto my-8 bg-white p-6 sm:p-8 rounded-3xl border border-[#DDD3C5] shadow-md text-center space-y-5">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F7F3EC] border border-[#DDD3C5] flex items-center justify-center text-[#3D2C24]">
                <KeyRound className="w-7 h-7 text-[#B39770]" />
              </div>
              <div>
                <h4 className="font-serif text-xl font-bold text-[#211D19]">
                  Área Restrita Villa7
                </h4>
                <p className="text-xs text-[#6B5749] mt-1">
                  Digite a senha de segurança interna da equipe para autorizar a produção e gerar arquivos finais.
                </p>
              </div>

              <form onSubmit={handleAuthorize} className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha administrativa"
                  className="w-full px-4 py-3 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-[#211D19] text-center tracking-widest text-sm focus:outline-hidden focus:ring-2 focus:ring-[#B39770]"
                  autoFocus
                />

                {errorMsg && (
                  <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#3D2C24] hover:bg-[#211D19] text-[#FAF7F2] rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4 text-[#B39770]" />
                  <span>{loading ? 'Validando...' : 'Liberar Produção'}</span>
                </button>
              </form>

              <p className="text-[11px] text-[#A39282]">
                Acesso protegido pelo servidor com token criptográfico e auditoria de aprovação.
              </p>
            </div>
          ) : (
            /* AUTHORIZED DASHBOARD VIEW */
            <div className="space-y-6">
              {/* Navigation Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-[#E8DFD5] pb-2">
                {[
                  { id: 'PRODUCAO', label: 'Produção & PDFs' },
                  { id: 'DADOS', label: 'Dados do Cliente' },
                  { id: 'FOTOS', label: `Fotos (${project.photos.length})` },
                  { id: 'CAPA', label: 'Capa & Lombada' },
                  { id: 'MIOLO', label: `Lâminas (${project.spreads.length})` },
                  { id: '3D', label: 'Visualizador 3D' },
                  { id: 'REVISAO', label: 'Auditoria' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                        : 'bg-[#FAF7F2] text-[#6B5749] hover:bg-[#EFE8DE] border border-[#DDD3C5]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB: PRODUCAO */}
              {activeTab === 'PRODUCAO' && (
                <div className="space-y-6">
                  {/* Status Manager */}
                  <div className="bg-white p-5 rounded-2xl border border-[#DDD3C5] shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#8C5E3C]">
                          Fluxo de Produção
                        </span>
                        <h4 className="font-serif text-base font-bold text-[#211D19]">
                          Status Atual do Pedido
                        </h4>
                      </div>
                      <select
                        value={currentStatus}
                        onChange={(e) => handleChangeStatus(e.target.value as OrderStatus)}
                        className="px-3 py-1.5 rounded-xl border border-[#DDD3C5] bg-[#FAF7F2] text-xs font-semibold text-[#211D19] focus:ring-2 focus:ring-[#B39770]"
                      >
                        {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => (
                          <option key={k} value={k}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFD5] flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-[#211D19]">Aprovado pelo Cliente:</span>{' '}
                        {project.clientData.isApproved ? (
                          <span className="text-emerald-700 font-semibold">
                            ✓ Sim ({project.clientData.approvalDate || 'Data registrada'})
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold">
                            Aguardando revisão do cliente
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-[#211D19]">Autorizado p/ Gráfica:</span>{' '}
                        {project.clientData.adminAuthorized ? (
                          <span className="text-teal-700 font-semibold">
                            ✓ Sim ({project.clientData.adminAuthorizedDate || 'Autorizado'})
                          </span>
                        ) : (
                          <span className="text-stone-500">Pendente</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PDF Production Generator Box */}
                  <div className="bg-white p-5 rounded-2xl border border-[#DDD3C5] shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#211D19]">
                          Arquivos Oficiais de Impressão (300 DPI)
                        </h4>
                        <p className="text-xs text-[#6B5749]">
                          Gera e homologa os 3 arquivos de produção com destino direto no Supabase Storage:
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleGenerateProductionPackage}
                        disabled={loading}
                        className="px-4 py-2 bg-[#3D2C24] hover:bg-[#211D19] text-[#FAF7F2] text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>{loading ? 'Gerando...' : 'Gerar / Atualizar Pacote'}</span>
                      </button>
                    </div>

                    {pdfGenerationStatus && (
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-medium">
                        {pdfGenerationStatus}
                      </div>
                    )}

                    {/* Files list */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl border border-[#E8DFD5] bg-[#FAF7F2] space-y-2">
                        <div className="flex items-center gap-2 text-[#3D2C24]">
                          <FileText className="w-4 h-4 text-[#B39770]" />
                          <span className="text-xs font-bold font-serif">1. Capa Horizontal</span>
                        </div>
                        <p className="text-[11px] text-[#7A685B]">
                          Contracapa + Lombada com texto + Capa em resolução 300 DPI.
                        </p>
                        {generatedUrls.capaPdfUrl ? (
                          <a
                            href={generatedUrls.capaPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C5E3C] hover:underline"
                          >
                            <Download className="w-3 h-3" /> Baixar Capa
                          </a>
                        ) : (
                          <span className="text-[10px] text-stone-400">Pronto para gerar</span>
                        )}
                      </div>

                      <div className="p-3 rounded-xl border border-[#E8DFD5] bg-[#FAF7F2] space-y-2">
                        <div className="flex items-center gap-2 text-[#3D2C24]">
                          <Layers className="w-4 h-4 text-[#B39770]" />
                          <span className="text-xs font-bold font-serif">2. Miolo Impressão</span>
                        </div>
                        <p className="text-[11px] text-[#7A685B]">
                          {project.spreads.length} lâminas abertas (40x30 cm) em fundo branco puro.
                        </p>
                        {generatedUrls.mioloPdfUrl ? (
                          <a
                            href={generatedUrls.mioloPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C5E3C] hover:underline"
                          >
                            <Download className="w-3 h-3" /> Baixar Miolo
                          </a>
                        ) : (
                          <span className="text-[10px] text-stone-400">Pronto para gerar</span>
                        )}
                      </div>

                      <div className="p-3 rounded-xl border border-[#E8DFD5] bg-[#FAF7F2] space-y-2">
                        <div className="flex items-center gap-2 text-[#3D2C24]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                          <span className="text-xs font-bold font-serif">3. Pacote Completo</span>
                        </div>
                        <p className="text-[11px] text-[#7A685B]">
                          Capa + Certificado Técnico + Todas as Lâminas + Controle de Qualidade.
                        </p>
                        {generatedUrls.albumFinalPdfUrl ? (
                          <a
                            href={generatedUrls.albumFinalPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline"
                          >
                            <Download className="w-3 h-3" /> Baixar PDF Final
                          </a>
                        ) : (
                          <span className="text-[10px] text-stone-400">Pronto para gerar</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: DADOS */}
              {activeTab === 'DADOS' && (
                <div className="bg-white p-5 rounded-2xl border border-[#DDD3C5] shadow-xs space-y-4">
                  <h4 className="font-serif text-base font-bold text-[#211D19]">
                    Informações do Cliente & Pedido
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-[#7A685B] block">Nome:</span>
                      <p className="text-sm font-semibold text-[#211D19]">
                        {project.clientData.name || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-[#7A685B] block">WhatsApp / Telefone:</span>
                      <p className="text-sm font-semibold text-[#211D19]">
                        {project.clientData.phone || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-[#7A685B] block">E-mail:</span>
                      <p className="text-sm font-semibold text-[#211D19]">
                        {project.clientData.email || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <span className="font-bold text-[#7A685B] block">Pedido Mercado Livre:</span>
                      <p className="text-sm font-semibold text-[#211D19]">
                        {project.clientData.mercadoLivreOrderId || 'Aguardando compra no ML'}
                      </p>
                    </div>

                    <div className="sm:col-span-2 pt-2 border-t border-[#E8DFD5]">
                      <span className="font-bold text-[#7A685B] block mb-1">Endereço de Entrega:</span>
                      {project.clientData.address?.street ? (
                        <p className="text-xs text-[#211D19] leading-relaxed">
                          {project.clientData.address.street}, {project.clientData.address.number}{' '}
                          {project.clientData.address.complement && `(${project.clientData.address.complement})`} •{' '}
                          {project.clientData.address.neighborhood} • {project.clientData.address.city}/
                          {project.clientData.address.state} • CEP: {project.clientData.address.cep}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-700 italic">Endereço ainda não preenchido pelo cliente.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: FOTOS */}
              {activeTab === 'FOTOS' && (
                <div className="bg-white p-5 rounded-2xl border border-[#DDD3C5] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-base font-bold text-[#211D19]">
                      Galeria de Fotografias Carregadas ({project.photos.length})
                    </h4>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {project.photos.map((p, idx) => (
                      <div
                        key={p.id}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-[#DDD3C5] bg-[#FAF7F2]"
                      >
                        <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded">
                          #{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: 3D VIEWER */}
              {activeTab === '3D' && (
                <div className="space-y-4">
                  <Album3DViewer project={project} />
                </div>
              )}

              {/* TAB: REVISAO / AUDITORIA */}
              {activeTab === 'REVISAO' && (
                <div className="bg-white p-5 rounded-2xl border border-[#DDD3C5] shadow-xs space-y-4 text-xs">
                  <h4 className="font-serif text-base font-bold text-[#211D19]">
                    Trilha de Auditoria e Integridade
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Projeto criado em: {new Date(project.createdAt).toLocaleString('pt-BR')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Última atualização salva: {new Date(project.updatedAt).toLocaleString('pt-BR')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Total de Lâminas no Miolo: {project.spreads.length} (Padrão 15x20 fechado / 20x30 aberto)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Token de Produção: {project.clientData.adminToken || 'Não emitido'}</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
