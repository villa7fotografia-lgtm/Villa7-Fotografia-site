import React from 'react';
import { Camera, Palette, Eye, CheckCircle, Check, ChevronRight } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  maxReachedStep: number;
}

export const PROCESS_STEPS = [
  {
    id: 1,
    short: 'Fotos',
    label: '1. Suas Fotos',
    sub: 'Fotos & Identificação',
    icon: Camera,
    description: 'Upload das fotos da capa, referências e miolo do álbum',
  },
  {
    id: 2,
    short: 'Personalizar',
    label: '2. Seu Álbum',
    sub: 'Capa IA & Lâminas',
    icon: Palette,
    description: 'Estúdio de IA para capa e diagramação de lâminas',
  },
  {
    id: 3,
    short: 'Conferir',
    label: '3. Veja Como Ficou',
    sub: 'Visualização 2D & 3D',
    icon: Eye,
    description: 'Folheie seu álbum virtualmente antes de enviar',
  },
  {
    id: 4,
    short: 'Pronto',
    label: '4. Tudo Pronto',
    sub: 'Aprovação & Produção',
    icon: CheckCircle,
    description: 'Aprovação final, geração de PDFs e envio à gráfica',
  },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onStepClick,
  maxReachedStep,
}) => {
  return (
    <div className="bg-[#FAF7F2] border-b border-[#E8DFD5] py-2.5 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-2.5">
        {/* Discrete Top Progress Breadcrumb: Fotos → Personalizar → Conferir → Pronto */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-xs text-[#7A685B] py-0.5">
          {PROCESS_STEPS.map((step, idx) => {
            const isCurrent = currentStep === step.id;
            const isCompleted = step.id < currentStep;

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => step.id <= maxReachedStep && onStepClick(step.id)}
                  disabled={step.id > maxReachedStep}
                  className={`flex items-center gap-1 font-medium transition-colors ${
                    isCurrent
                      ? 'text-[#211D19] font-bold underline decoration-[#B39770] decoration-2 underline-offset-4'
                      : isCompleted
                      ? 'text-[#6E5536] hover:text-[#211D19]'
                      : 'text-[#A39282] cursor-not-allowed'
                  }`}
                >
                  {isCompleted && <Check className="w-3 h-3 text-[#B39770]" />}
                  <span>{step.short}</span>
                </button>
                {idx < PROCESS_STEPS.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-[#D9CFC4] shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* 4 Responsive Step Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {PROCESS_STEPS.map((step) => {
            const Icon = step.icon;
            const isCurrent = currentStep === step.id;
            const isCompleted = step.id < currentStep;
            const isAccessible = step.id <= Math.max(currentStep, maxReachedStep);

            return (
              <button
                key={step.id}
                id={`process-tab-${step.id}`}
                type="button"
                onClick={() => isAccessible && onStepClick(step.id)}
                disabled={!isAccessible}
                className={`relative flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl transition-all text-left border ${
                  isCurrent
                    ? 'bg-[#3D2C24] text-[#FAF7F2] border-[#2C2420] shadow-md ring-2 ring-[#B39770]/30'
                    : isCompleted
                    ? 'bg-[#F5EFEB] text-[#3D2C24] border-[#DDD3C5] hover:bg-[#EFE8DE]'
                    : isAccessible
                    ? 'bg-[#FAF7F2] text-[#7A685B] border-[#E8DFD5] hover:bg-[#F5EFEB]'
                    : 'opacity-50 cursor-not-allowed bg-transparent border-[#EFE8DE] text-[#A39282]'
                }`}
              >
                {/* Number Badge / Icon */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                    isCurrent
                      ? 'bg-[#FAF7F2] text-[#3D2C24]'
                      : isCompleted
                      ? 'bg-[#B39770] text-white'
                      : 'bg-[#EAE1D5] text-[#5A4638]'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Icon className="w-4 h-4" />}
                </div>

                {/* Text Labels */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span
                    className={`text-xs font-bold font-serif tracking-wide truncate ${
                      isCurrent ? 'text-[#FAF7F2]' : 'text-[#211D19]'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span
                    className={`text-[10px] sm:text-[11px] font-medium truncate ${
                      isCurrent ? 'text-[#EAE0D5]' : 'text-[#8C5E3C]'
                    }`}
                  >
                    {step.sub}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
