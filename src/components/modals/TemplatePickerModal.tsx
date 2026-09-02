import React, { useState } from 'react';
import { X, LayoutGrid, Check } from 'lucide-react';
import { SPREAD_TEMPLATES } from '../../constants/templates';
import { TemplateDef } from '../../types';

interface TemplatePickerModalProps {
  isOpen: boolean;
  currentTemplateId: string;
  onSelectTemplate: (template: TemplateDef) => void;
  onClose: () => void;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  currentTemplateId,
  onSelectTemplate,
  onClose,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | '1' | '2' | '3' | '4'>('all');

  if (!isOpen) return null;

  const filteredTemplates = SPREAD_TEMPLATES.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.photoCount.toString() === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2C2420]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FAF7F2] rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-[#DDD3C5] shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E8DFD5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFE8DE] text-[#3D2C24] flex items-center justify-center border border-[#D9CFC4]">
              <LayoutGrid className="w-5 h-5 text-[#8C5E3C]" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-[#2C2420]">
                Disposição de Fotos da Lâmina (20x30 cm Aberto)
              </h3>
              <p className="text-xs text-[#7A685B]">
                Escolha o arranjo de fotos com miolo 100% branco para esta página dupla.
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

        {/* Category Filters */}
        <div className="px-6 py-3 bg-[#F5EFEB] border-b border-[#E8DFD5] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-xs font-semibold uppercase text-[#7A685B] mr-2">Fotos por Lâmina:</span>
          {(['all', '1', '2', '3', '4'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#3D2C24] text-[#FAF7F2] shadow-xs'
                  : 'bg-[#FFFFFF] text-[#5A4638] hover:bg-[#EAE0D5] border border-[#DDD3C5]'
              }`}
            >
              {cat === 'all' ? 'Todos os Layouts' : `${cat} ${cat === '1' ? 'Foto' : 'Fotos'}`}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => {
            const isSelected = currentTemplateId === template.id;

            return (
              <div
                key={template.id}
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
                className={`group p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#8C5E3C] bg-[#F5EFEB] ring-2 ring-[#8C5E3C]/20'
                    : 'border-[#E0D6C8] bg-[#FFFFFF] hover:border-[#8C5E3C] hover:bg-[#FDFCFB]'
                }`}
              >
                {/* 3:2 Aspect Ratio Mini Preview Box (20x30 cm) */}
                <div className="w-full aspect-[3/2] bg-[#FFFFFF] rounded-xl border border-[#D9CFC4] relative overflow-hidden p-1 shadow-inner">
                  {/* Subtle center fold spine */}
                  <div className="absolute inset-y-0 left-1/2 w-px bg-black/15 -translate-x-1/2 z-10" />

                  {/* Draw Template Slots in CSS percentage */}
                  {template.slots.map((slot, sIdx) => (
                    <div
                      key={sIdx}
                      className="absolute rounded bg-[#E4DACD] group-hover:bg-[#D9CFC4] border border-[#C5B7A8] transition-colors flex items-center justify-center"
                      style={{
                        left: `${slot.x}%`,
                        top: `${slot.y}%`,
                        width: `${slot.width}%`,
                        height: `${slot.height}%`,
                      }}
                    >
                      <span className="text-[10px] font-bold text-[#7A685B]">{sIdx + 1}</span>
                    </div>
                  ))}
                </div>

                {/* Template Info */}
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-xs sm:text-sm text-[#2C2420] flex items-center gap-1.5">
                      {template.name}
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#EAE0D5] text-[#5A4638]">
                        {template.photoCount} {template.photoCount === 1 ? 'foto' : 'fotos'}
                      </span>
                    </h4>
                    <p className="text-[11px] text-[#7A685B] mt-0.5 line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#8C5E3C] text-white flex items-center justify-center shrink-0 ml-2">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
