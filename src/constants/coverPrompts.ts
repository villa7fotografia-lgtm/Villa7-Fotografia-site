import { CoverPromptDef } from '../types';

export const COVER_PROMPT_PRESETS: CoverPromptDef[] = [
  {
    id: 'personalizado-inteligente',
    title: 'Personalizado com Dados da Obra',
    subtitle: 'Preenchimento automático do álbum',
    badge: 'Recomendado',
    paletteDescription: 'Tons orgânicos, linho nobre, off-white e detalhes sutis de gravação.',
    suggestedTypography: 'Serifada elegante ou Minimalista contemporânea',
    description: 'Prompt dinâmico gerado em tempo real com o Nome do Cliente, Título da Obra, Subtítulo e Ocasião.',
    promptText: `Gere uma capa fotográfica profissional para um fotolivro de luxo formato vertical 15x20 cm (proporção 2:3 ou 3:4) para a marca Villa7 Álbuns.
Instruções de composição:
- Use a fotografia enviada como elemento principal com enquadramento nobre e iluminação envolvente.
- Fundo em textura de linho cru ou papel algodão com textura tátil fina em tons neutros atemporais (off-white, areia, fendi suave).
- Espaço harmonioso no terço inferior/superior para o título gravado com elegância e sofisticação.
- Proporção estritamente vertical (2:3 ou 3:4), alta nitidez e acabamento editorial de estúdio fotográfico.`
  },
  {
    id: 'minimalista-elegante',
    title: 'Minimalista & Linho Fino',
    subtitle: 'Design limpo & Tipografia nobre',
    badge: 'Mais Popular',
    paletteDescription: 'Tons de areia, linho cru, off-white e detalhes em folha dourada sutil.',
    suggestedTypography: 'Serifa refinada (Cormorant Garamond / Didot)',
    description: 'Capa contemporânea com textura de linho nobre, foco central na foto com paspatur generoso e tipografia clean em baixo-relevo.',
    promptText: `Gere uma capa de álbum fotográfico de alta qualidade e luxo no estilo "Minimalista Elegante" em formato vertical 15x20 cm (proporção 2:3).
Instruções visuais:
- Use a fotografia como a imagem principal no centro da capa, com enquadramento vertical equilibrado.
- Fundo com textura tátil de linho nobre ou papel algodão artesanal em tons quentes e neutros (areia, off-white suave, terracota claro).
- Espaço de respiro para título e subtítulo gravados em tipografia serifada minimalista de alta classe, como deboss ou hot stamping sutil.
- Estética atemporal, clean, sem excesso de elementos gráficos, valorizando a fotografia original.`
  },
  {
    id: 'casamento-fine-art',
    title: 'Casamento & Ensaio Romântico',
    subtitle: 'Golden hour & Atmosfera etérea',
    badge: 'Casamentos & Noivados',
    paletteDescription: 'Champagne, marfim suave, dourado sutil e tons terrosos quentes.',
    suggestedTypography: 'Caligrafia fina com serifa clássica',
    description: 'Ideal para ensaios de casal, pré-wedding e cerimônias de casamento inesquecíveis.',
    promptText: `Crie uma arte de capa fotográfica vertical 15x20 cm para álbum de casamento no estilo Fine Art Romântico.
Instruções visuais:
- Destaque o casal com luz dourada suave (golden hour), transmitindo emoção genuína e afeto.
- Moldura sutil com efeito de paspatur em linho marfim ou couro vegetal claro.
- Acabamento clássico, suave e sofisticado com atmosfera de cinema e editorial de noivas.
- Proporção vertical 2:3 em alta resolução 300 DPI, livre de poluição visual.`
  },
  {
    id: 'familia-afeto',
    title: 'Família & Infantil Aconchegante',
    subtitle: 'Luz natural & Momentos espontâneos',
    badge: 'Família & Crianças',
    paletteDescription: 'Tons de baunilha, amêndoa, terracota suave e verde oliva claro.',
    suggestedTypography: 'Serifada humanista acolhedora',
    description: 'Perfeito para celebrar o crescimento dos filhos, aniversários e encontros em família.',
    promptText: `Crie uma capa para álbum fotográfico de família em formato vertical 15x20 cm (proporção 2:3).
Instruções visuais:
- Integre a foto de família com iluminação natural acolhedora e atmosfera calorosa de lar e carinho.
- Textura de fundo suave e orgânica em tons neutros terrosos (bege, baunilha e linho lavado).
- Sensação de memória afetiva que atravessa gerações, com visual alegre, nobre e atemporal.`
  },
  {
    id: 'editorial-feminino',
    title: 'Ensaio Feminino / Editorial',
    subtitle: 'Elegância contemporânea & Estilo revista',
    badge: 'Moda & Retratos',
    paletteDescription: 'Neutros sofisticados, bege quente, fendi e iluminação de estúdio.',
    suggestedTypography: 'Sans-serif geométrica minimalista',
    description: 'Diagramação de livro de arte internacional com recorte impactante e luz marcante.',
    promptText: `Gere uma capa de photobook vertical 15x20 cm (proporção 2:3) no estilo Retrato Editorial de Alta Moda.
Instruções visuais:
- Valorize a expressão e presença da pessoa na foto com iluminação suave de estúdio e bokeh sofisticado.
- Fundo em tom neutro com textura de papel de arte fosco.
- Hierarquia tipográfica limpa e contemporânea, como capa de livro de fotografia de autor.`
  },
  {
    id: 'debutante-15anos',
    title: '15 Anos & Celebração',
    subtitle: 'Brilho sutil & Sofisticação jovem',
    badge: '15 Anos & Debutante',
    paletteDescription: 'Rose gold, lavanda suave, marfim e micropartículas de brilho.',
    suggestedTypography: 'Moderna refinada com detalhes elegantes',
    description: 'Perfeita para eternizar festas de debutante e grandes comemorações juvenis.',
    promptText: `Crie uma capa de álbum vertical 15x20 cm para celebração de 15 Anos / Debutante.
Instruções visuais:
- Destaque a debutante com iluminação brilhante e suave, capturando a energia e encanto da celebração.
- Textura com detalhes sutis em rose gold ou foil metálico delicado sobre linho marfim.
- Composição elegante, jovem e memorável pronta para encadernação.`
  },
  {
    id: 'gestante-newborn',
    title: 'Gestante & Bebê (Newborn)',
    subtitle: 'Delicadeza, pureza e ternura',
    badge: 'Maternidade',
    paletteDescription: 'Tons pastéis terrosos, camomila, areia e branco quente.',
    suggestedTypography: 'Tipografia suave e orgânica',
    description: 'Aconchegante e suave para os primeiros dias e a doce espera da maternidade.',
    promptText: `Gere uma capa de álbum de maternidade e gestante no formato vertical 15x20 cm (proporção 2:3).
Instruções visuais:
- Fotografia em primeiro plano com suavidade extrema, tons claros e iluminação difusa etérea.
- Textura de algodão puro ou veludo suave no fundo, evocando ternura e cuidado.
- Visual limpo, puro e atemporal que valoriza esse momento sagrado.`
  },
  {
    id: 'viagem-paisagem',
    title: 'Viagens & Aventuras',
    subtitle: 'Fotografia de paisagem & Exploração',
    badge: 'Viagens',
    paletteDescription: 'Tons da natureza, areia dourada, céu suave e terracota.',
    suggestedTypography: 'Display clean ou serifa contemporânea',
    description: 'Destaque para cenários inesquecíveis, passeios e registros de férias pelo mundo.',
    promptText: `Crie uma capa de livro de memórias de viagem em formato vertical 15x20 cm (proporção 2:3).
Instruções visuais:
- Destaque a foto da paisagem ou dos viajantes com profundidade de campo e cores naturais ricas.
- Moldura de encadernação de viagem tipo diário de bordo refinado em linho cru.
- Espaço limpo para título do destino e ano da expedição.`
  }
];

export function buildFormattedChatGPTMessage(
  prompt: CoverPromptDef,
  albumTitle: string,
  albumSubtitle: string,
  clientName: string,
  occasion?: string
): string {
  const occasionText = occasion && occasion !== 'Outro' ? `\n🎉 OCASIÃO: ${occasion}` : '';
  
  return `Olá ChatGPT! Por favor, crie uma imagem de capa de álbum fotográfico profissional em FORMATO VERTICAL 15x20 cm (proporção 2:3 ou 3:4) para a marca Villa7 Álbuns seguindo as especificações abaixo:

📸 FOTOGRAFIA: (Em anexo está a foto principal que deve ser utilizada como base/destaque na capa)
📖 TÍTULO DA OBRA: "${albumTitle || 'Nossas Melhores Memórias'}"
✨ SUBTÍTULO / DATA: "${albumSubtitle || 'Momentos Especiais • 2026'}"
👤 CLIENTE / AUTOR: "${clientName || 'Família & Memórias'}"${occasionText}

🎨 ESTILO SOLICITADO: ${prompt.title} — ${prompt.subtitle}
${prompt.promptText}

📐 ESPECIFICAÇÕES TÉCNICAS:
- Orientação: Vertical (Proporção 2:3 / 15x20 cm)
- Resolução: Alta definição (300 DPI)
- Miolo do Álbum: 100% Branco puro
- Foco: Alta estética editorial sem cortes nos elementos principais

Por favor, gere a imagem de capa pronta para upload na vertical!`;
}

