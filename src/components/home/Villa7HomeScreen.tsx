import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  BookOpen,
  Heart,
  Users,
  Camera,
  GraduationCap,
  Calendar,
  Baby,
  User,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { AlbumProject, OccasionType } from '../../types';
import { MERCADO_LIVRE_PRODUCT_URL, IMAGE_ASSETS } from '../../constants/imageAssets';

interface Villa7HomeScreenProps {
  project: AlbumProject;
  onStartNew: (occasion?: OccasionType, mlCode?: string) => void;
  onResume: () => void;
  onOpenAdmin: () => void;
}

const CATEGORIES: Array<{
  id: OccasionType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  sampleTitle: string;
  sampleSubtitle: string;
}> = [
  {
    id: 'Casamento',
    title: 'Casamento',
    description: 'O grande dia eternizado em encadernação panorâmica de alto padrão.',
    icon: Heart,
    sampleTitle: 'Nossa História de Amor',
    sampleSubtitle: 'O Início de um Novo Capítulo',
  },
  {
    id: 'Família',
    title: 'Família',
    description: 'Encontros de gerações, viagens e sorrisos que aquecem o coração.',
    icon: Users,
    sampleTitle: 'Momentos em Família',
    sampleSubtitle: 'Amor que Atravessa Gerações',
  },
  {
    id: 'Ensaio Fotográfico',
    title: 'Ensaios',
    description: 'Retratos artísticos e ensaios de casal com estética de revista.',
    icon: Camera,
    sampleTitle: 'Retratos e Essência',
    sampleSubtitle: 'Luz Natural e Singularidade',
  },
  {
    id: 'Eventos',
    title: 'Eventos',
    description: 'Grandes celebrações, festas de 15 anos e momentos memoráveis.',
    icon: Calendar,
    sampleTitle: 'Noite de Comemoração',
    sampleSubtitle: 'Celebração Inesquecível',
  },
  {
    id: 'Conquistas & Formatura',
    title: 'Formatura',
    description: 'A consagração de anos de estudo e vitória compartilhada.',
    icon: GraduationCap,
    sampleTitle: 'Minha Formatura',
    sampleSubtitle: 'A Conquista de um Grande Sonho',
  },
  {
    id: 'Acompanhamento',
    title: 'Acompanhamento',
    description: 'Os primeiros 12 meses do bebê, batizado e gestação com ternura.',
    icon: Baby,
    sampleTitle: 'Primeiro Ano de Amor',
    sampleSubtitle: 'Pequenos Passos, Grandes Memórias',
  },
  {
    id: 'Individual',
    title: 'Individual',
    description: 'Viagens solo, portfólio pessoal e ensaios comemorativos.',
    icon: User,
    sampleTitle: 'Minhas Viagens & Momentos',
    sampleSubtitle: 'Memórias pelo Mundo',
  },
];

export const Villa7HomeScreen: React.FC<Villa7HomeScreenProps> = ({
  project,
  onStartNew,
  onResume,
  onOpenAdmin,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<OccasionType>('Casamento');
  const [mlOrderCode, setMlOrderCode] = useState(project.clientData.mercadoLivreOrderId || '');
  const hasExistingProject = project.photos.length > 0 || project.clientData.name.trim() !== '';

  const handleMlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartNew(selectedCategory, mlOrderCode);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-16">
      {/* HERO SECTION */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#FFFFFF] to-[#F7F3EC] border border-[#DDD3C5] p-6 sm:p-14 shadow-sm text-center max-w-5xl mx-auto space-y-8">
        {/* Subtle Decorative Elements */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAE1D5]/60 text-[#6B5749] text-xs font-semibold tracking-wider uppercase border border-[#DDD3C5]">
          <Sparkles className="w-3.5 h-3.5 text-[#B39770]" />
          <span>Villa7 Álbuns • Fotolivros Fine Art 15x20 Vertical</span>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#211D19] leading-tight tracking-tight">
            Álbuns para guardar histórias.
          </h1>
          <p className="text-base sm:text-xl text-[#6B5749] leading-relaxed font-sans max-w-2xl mx-auto">
            Crie, personalize e aprove seu álbum de forma simples. Nós cuidamos do restante.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => onStartNew(selectedCategory, mlOrderCode)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#3D2C24] hover:bg-[#211D19] text-[#FAF7F2] font-semibold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>CRIAR MEU ÁLBUM</span>
            <ArrowRight className="w-4 h-4 text-[#B39770] group-hover:translate-x-1 transition-transform" />
          </button>

          {hasExistingProject && (
            <button
              type="button"
              onClick={onResume}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#FAF7F2] hover:bg-[#EFE8DE] text-[#3D2C24] font-semibold text-base transition-all border border-[#DDD3C5] flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#8C5E3C]" />
              <span>CONTINUAR MEU PROJETO</span>
            </button>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[#E8DFD5] text-left">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#211D19] block">1. Suas Fotos</span>
            <p className="text-[11px] text-[#7A685B]">Upload organizado e seguro sem perda de resolução.</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#211D19] block">2. Capa com IA</span>
            <p className="text-[11px] text-[#7A685B]">Direção de arte editorial personalizada com seu estilo.</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#211D19] block">3. Visualização 3D</span>
            <p className="text-[11px] text-[#7A685B]">Folheie virtualmente seu álbum antes da impressão.</p>
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#211D19] block">4. Produção Villa7</span>
            <p className="text-[11px] text-[#7A685B]">Impressão Fine Art 300 DPI e envio para todo o Brasil.</p>
          </div>
        </div>
      </div>

      {/* MERCADO LIVRE PURCHASE SECTION */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-[#DDD3C5] shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D3277] bg-[#FFF9E6] px-2.5 py-0.5 rounded-full border border-[#FFE180]">
                Compra Segura Mercado Livre
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#211D19]">
              Adquira seu álbum Villa7
            </h2>
            <p className="text-xs sm:text-sm text-[#6B5749] max-w-xl">
              Você pode adquirir seu álbum diretamente na nossa loja oficial com frete seguro e garantia.
              Se já comprou, basta informar o código para vincular a produção.
            </p>
          </div>

          <a
            href={MERCADO_LIVRE_PRODUCT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-[#FFE600] hover:bg-[#F2DA00] text-[#2D3277] font-bold text-sm transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#2D3277]" />
            <span>COMPRAR NO MERCADO LIVRE</span>
          </a>
        </div>

        {/* Já realizou sua compra? */}
        <div className="p-4 sm:p-6 bg-[#FAF7F2] rounded-2xl border border-[#E8DFD5] space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <h3 className="font-serif text-base font-bold text-[#211D19]">
              Já realizou sua compra no Mercado Livre?
            </h3>
          </div>
          <p className="text-xs text-[#6B5749]">
            Digite o código ou número da sua compra abaixo para vincular ao seu projeto e acelerar a homologação:
          </p>

          <form onSubmit={handleMlSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
            <input
              type="text"
              value={mlOrderCode}
              onChange={(e) => setMlOrderCode(e.target.value)}
              placeholder="Ex: #200000847291 ou Código da compra"
              className="flex-1 w-full px-4 py-3 rounded-xl border border-[#DDD3C5] bg-white text-xs sm:text-sm text-[#211D19] focus:outline-hidden focus:ring-2 focus:ring-[#B39770]"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 bg-[#3D2C24] hover:bg-[#211D19] text-[#FAF7F2] text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
            >
              CONTINUAR
            </button>
          </form>
        </div>
      </div>

      {/* CATEGORIES SECTION */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#B39770]">
            Formatos & Ocasiões
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#211D19]">
            Escolha o tema do seu álbum
          </h2>
          <p className="text-xs sm:text-sm text-[#6B5749]">
            Projetos diagramados com proporção nobre para celebrar qualquer capítulo da sua vida:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-white border-[#B39770] shadow-md ring-2 ring-[#B39770]/20'
                    : 'bg-[#FAF7F2] border-[#E8DFD5] hover:bg-white hover:border-[#DDD3C5]'
                }`}
              >
                <div className="space-y-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#3D2C24] text-[#FAF7F2]'
                        : 'bg-[#EAE1D5] text-[#5A4638]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-base font-bold text-[#211D19]">
                      {cat.title}
                    </h4>
                    <p className="text-xs text-[#7A685B] mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartNew(cat.id, mlOrderCode);
                  }}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[#3D2C24] text-[#FAF7F2]'
                      : 'bg-[#EAE1D5] hover:bg-[#DDD3C5] text-[#3D2C24]'
                  }`}
                >
                  Criar Álbum de {cat.title}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM BANNER / ADMIN LINK */}
      <div className="text-center pt-8 border-t border-[#E8DFD5]">
        <button
          type="button"
          onClick={onOpenAdmin}
          className="inline-flex items-center gap-1.5 text-xs text-[#8C7A6B] hover:text-[#3D2C24] transition-colors"
        >
          <Lock className="w-3.5 h-3.5 text-[#B39770]" />
          <span>Acesso à Produção e Gráfica Villa7 (Área Restrita)</span>
        </button>
      </div>
    </div>
  );
};
