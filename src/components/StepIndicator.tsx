import React from 'react';
import { Layers, LayoutGrid, CheckSquare, Check, Sparkles } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  maxReachedStep: number;
}

export const PROCESS_STEPS = [
  {
    id: 1,
    label: '1. Preparação do Álbum',
    sub: 'Identificação, Fotos & Estrutura',
    badge: 'Passo 1',
    icon: Layers,
    description: 'Dados do cliente, até 40 fotos e definição de 10 a 20 lâminas',
  },
  {
    id: 2,
    label: '2. Estúdio de Criação',
    sub: 'Diagramação 20x30 & Capa 15x20',
    badge: 'Passo 2',
    icon: LayoutGrid,
    description: 'Montagem das lâminas 20x30 cm e foto da capa 15x20 vertical',
  },
  {
    id: 3,
    label: '3. Revisão & Produção',
    sub: 'Aprovação Final, PDF & Drive',
    badge: 'Passo 3',
    icon: CheckSquare,
    description: 'Homologação digital, geração do PDF de impressão e envio à nuvem',
  },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onStepClick,
  maxReachedStep,
}) => {
  return (
    <div className="bg-[#FAF7F2] border-b border-[#E8DFD5] py-3.5 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PROCESS_STEPS.map((step, index) => {
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
                className={`relative flex items-center gap-3.5 p-3 sm:p-4 rounded-2xl transition-all text-left border ${
                  isCurrent
                    ? 'bg-[#3D2C24] text-[#FAF7F2] border-[#2C2420] shadow-md ring-2 ring-[#8C5E3C]/25'
                    : isCompleted
                    ? 'bg-[#F5EFEB] text-[#3D2C24] border-[#DDD3C5] hover:bg-[#EFE8DE]'
                    : isAccessible
                    ? 'bg-[#FAF7F2] text-[#7A685B] border-[#E8DFD5] hover:bg-[#F5EFEB]'
                    : 'opacity-50 cursor-not-allowed bg-transparent border-[#EFE8DE] text-[#A39282]'
                }`}
              >
                {/* Number Badge / Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 transition-colors shadow-2xs ${
                    isCurrent
                      ? 'bg-[#FAF7F2] text-[#3D2C24]'
                      : isCompleted
                      ? 'bg-[#8C5E3C] text-[#FAF7F2]'
                      : 'bg-[#EAE0D5] text-[#5A4638]'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-5 h-5" />}
                </div>

                {/* Text Labels */}
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className={`text-xs font-bold font-serif tracking-wide truncate ${
                        isCurrent ? 'text-[#FAF7F2]' : 'text-[#2C2420]'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-100/90 px-2 py-0.2 rounded-full shrink-0">
                        Concluído
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-medium truncate ${
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
