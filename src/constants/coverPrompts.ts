import { CoverPromptDef } from '../types';

/**
 * 5 Arquétipos Oficiais Villa7 extraídos diretamente do catálogo de álbuns físicos:
 * 1. Casamento ("Marcelo e Vitória - Uma história de amor")
 * 2. Infantil ("Primeiros Momentos")
 * 3. Ensaio Feminino ("Seu Melhor Momento")
 * 4. Masculino / Lifestyle ("Minha História - Meus caminhos, minhas conquistas")
 * 5. Formatura ("Formatura - Uma nova jornada")
 */
export const COVER_PROMPT_PRESETS: CoverPromptDef[] = [
  {
    id: 'casamento-marcelo-vitoria',
    title: 'Casamento & Amor (Ref: Marcelo e Vitória)',
    subtitle: 'Uma história de amor • Capa Escura & Ouro Champanhe',
    badge: 'Referência Oficial 01',
    referenceArchetype: 'Marcelo e Vitória - Uma história de amor',
    defaultBgColor: '#1A1816',
    defaultFoilColor: 'gold',
    suggestedTitleExample: 'Marcelo e Vitória',
    suggestedSubtitleExample: 'Uma história de amor',
    paletteDescription: 'Couro/linho preto fosco profundo, iluminação noturna acolhedora com luzes de fadas e vegetação botânica, detalhes tipográficos em Hot Stamping Ouro Champanhe.',
    suggestedTypography: 'Serif Display de alto luxo (Trajan / Cormorant Garamond / Didot) e itálico delicado',
    description: 'Inspirado na capa clássica de casamento da Villa7: fotografia cinematográfica de casal em fundo escuro noturno com luzes quentes, terço inferior com títulos em dourado e assinatura oficial by VILLA7.',
    promptText: `Gere uma capa dura fotográfica vertical de altíssimo luxo em formato 15x20 cm (proporção 2:3 ou 3:4) para álbum de casamento, seguindo estritamente a referência oficial da Villa7 "Marcelo e Vitória - Uma história de amor":
- FOTOGRAFIA PRINCIPAL: Casal de noivos em enquadramento nobre, iluminação cinematográfica quente e romântica com luzes de fadas/folhagens suaves e fundo escuro envolvente.
- TERÇO INFERIOR DA CAPA (Diagramação Oficial Villa7):
  1. TÍTULO PRINCIPAL: "{TITLE}" em tipografia serifada romana de alto luxo com efeito metálico Hot Stamping Ouro Champanhe em relevo.
  2. SUBTÍTULO: "{SUBTITLE}" em serifa itálica delicada e espaçada.
  3. FLORÃO CENTRALIZADO: Delicado ornamento floral/botânico clássico (— ❦ —).
  4. ASSINATURA OBRIGATÓRIA: Inscrição "by VILLA7" com o emblema do livro aberto estilizado no rodapé central.
- LOMBADA (2x20 cm): Revestida em couro preto fosco com o título em caixa alta vertical dourado e logotipo Villa7.
- ACABAMENTO: Estética editorial de ateliê fine art, 300 DPI, zero marcas d'água de terceiros, enquadramento vertical com área de respiro para encadernação térmica.`
  },
  {
    id: 'infantil-primeiros-momentos',
    title: 'Infantil & Bebê (Ref: Primeiros Momentos)',
    subtitle: 'Linho Areia Nobre • Ternura, Aconchego & Bronze',
    badge: 'Referência Oficial 02',
    referenceArchetype: 'Primeiros Momentos',
    defaultBgColor: '#EAE1D5',
    defaultFoilColor: 'gold',
    suggestedTitleExample: 'Primeiros Momentos',
    suggestedSubtitleExample: 'Acompanhamento & Primeiros Passos',
    paletteDescription: 'Linho cru, areia e marfim suave com tons acolhedores de algodão, luz natural de berço e tipografia em bronze nobre.',
    suggestedTypography: 'Serifada terna e acolhedora com entrelinha suave',
    description: 'Inspirado na capa infantil da Villa7: fotografia de bebê com elemento afetivo (ursinho/manta), paleta neutra em linho areia e gravação sutil com assinatura by VILLA7.',
    promptText: `Crie uma arte de capa fotográfica vertical 15x20 cm para álbum infantil/acompanhamento, baseando-se estritamente na referência física oficial da Villa7 "Primeiros Momentos":
- FOTOGRAFIA PRINCIPAL: Bebê em repouso terno com ursinho de pelúcia ou manta de algodão, sob iluminação natural suave, envolvente e acolhedora em tons terrosos suaves.
- TERÇO INFERIOR DA CAPA (Diagramação Oficial Villa7):
  1. TÍTULO PRINCIPAL: "{TITLE}" gravado com serifa suave em tom bronze nobre ou dourado champanhe.
  2. SUBTÍTULO: "{SUBTITLE}" em itálico delicado.
  3. FLORÃO CENTRALIZADO: Pequeno ornamento botânico delicado.
  4. ASSINATURA OBRIGATÓRIA: Inscrição "by VILLA7" com ícone de livro aberto no rodapé.
- REVESTIMENTO: Textura tátil de linho fino areia/cru com lombada elegante.
- ACABAMENTO: Pureza visual, proporção vertical perfeita, ausência total de logotipos de terceiros.`
  },
  {
    id: 'ensaio-seu-melhor-momento',
    title: 'Ensaio Feminino & Retrato (Ref: Seu Melhor Momento)',
    subtitle: 'Golden Hour & Âmbar • Elegância Editorial',
    badge: 'Referência Oficial 03',
    referenceArchetype: 'Seu Melhor Momento',
    defaultBgColor: '#261D17',
    defaultFoilColor: 'gold',
    suggestedTitleExample: 'Seu Melhor Momento',
    suggestedSubtitleExample: 'Retratos & Ensaios Fotográficos',
    paletteDescription: 'Tons âmbar, dourado pôr do sol, bosque com bokeh aconchegante e acabamento de alta costura.',
    suggestedTypography: 'Serifada editorial elegante de alto contraste com acabamento dourado',
    description: 'Inspirado no modelo de retrato da Villa7: luz dourada mágica (golden hour), pose poética, encadernação em tom âmbar e tipografia em ouro reluzente.',
    promptText: `Crie uma capa de fotolivro vertical 15x20 cm no estilo editorial de retrato, inspirada diretamente na referência oficial Villa7 "Seu Melhor Momento":
- FOTOGRAFIA PRINCIPAL: Retrato feminino expressivo com vestido suave, iluminado por luz dourada mágica de golden hour / pôr do sol, com reflexos quentes de folhagens e bokeh refinado.
- TERÇO INFERIOR DA CAPA:
  1. TÍTULO PRINCIPAL: "{TITLE}" em serifa elegante de alto padrão com brilho metálico ouro.
  2. SUBTÍTULO: "{SUBTITLE}" em serifa itálica clássica.
  3. FLORÃO CENTRALIZADO: Mini divisor ornamental botânico.
  4. ASSINATURA: Marca "by VILLA7" com ícone do livro no rodapé.
- TEXTURA & LOMBADA: Revestimento premium em tons de terracota/âmbar nobre com lombada personalizada de 2 cm.
- ACABAMENTO: Estética de livro de fotografia de arte de colecionador.`
  },
  {
    id: 'masculino-minha-historia',
    title: 'Masculino & Conquistas (Ref: Minha História)',
    subtitle: 'Meus caminhos, minhas conquistas • Couro Preto Luxo',
    badge: 'Referência Oficial 04',
    referenceArchetype: 'Minha História - Meus caminhos, minhas conquistas',
    defaultBgColor: '#141211',
    defaultFoilColor: 'gold',
    suggestedTitleExample: 'Minha História',
    suggestedSubtitleExample: 'Meus caminhos, minhas conquistas',
    paletteDescription: 'Couro preto fosco nobre, iluminação de estúdio direcional com recorte suave e detalhes em ouro tradicional.',
    suggestedTypography: 'Serifada imponente clássica (Cinzel / Trajan Pro) com espaçamento nobre',
    description: 'Inspirado na referência de retrato individual e masculino da Villa7: fundo escuro minimalista, presença marcante, couro preto fosco e tipografia clássica dourada.',
    promptText: `Gere uma capa fotográfica vertical 15x20 cm para álbum de biografia e conquistas, seguindo a referência oficial Villa7 "Minha História":
- FOTOGRAFIA PRINCIPAL: Retrato expressivo de estúdio com iluminação lateral dramática e sutil luz de contorno (rim light), transmitindo confiança, maturidade e sobriedade.
- TERÇO INFERIOR DA CAPA:
  1. TÍTULO PRINCIPAL: "{TITLE}" em caixa alta/baixa com fonte serifada solene em Hot Stamping Ouro Clássico.
  2. SUBTÍTULO: "{SUBTITLE}" ("Meus caminhos, minhas conquistas") em itálico fino.
  3. FLORÃO: Pequeno traço decorativo central.
  4. ASSINATURA: Inscrição "by VILLA7" com o logotipo do livro aberto.
- REVESTIMENTO: Couro sintético premium preto fosco, com lombada de 2 cm gravada a quente.
- ACABAMENTO: Design sóbrio, atemporal e luxuoso, sem elementos visuais poluídos.`
  },
  {
    id: 'formatura-nova-jornada',
    title: 'Formatura & Acadêmico (Ref: Formatura)',
    subtitle: 'Uma nova jornada • Beca, Capelo & Ouro Nobre',
    badge: 'Referência Oficial 05',
    referenceArchetype: 'Formatura - Uma nova jornada',
    defaultBgColor: '#171615',
    defaultFoilColor: 'gold',
    suggestedTitleExample: 'Formatura',
    suggestedSubtitleExample: 'Uma nova jornada',
    paletteDescription: 'Preto acetinado, azul marinho acadêmico e douração solene para celebração de diploma e formatura.',
    suggestedTypography: 'Serifada acadêmica tradicional (Cinzel / Garamond / Trajan)',
    description: 'Inspirado na capa de formatura oficial da Villa7: retrato do formando em beca e capelo, iluminação solene de estúdio e tipografia em ouro nobre com subtítulo "Uma nova jornada".',
    promptText: `Gere uma arte de capa fotográfica vertical 15x20 cm para álbum de formatura e graduação, inspirada fielmente na referência física oficial da Villa7 "Formatura - Uma nova jornada":
- FOTOGRAFIA PRINCIPAL: Formanda ou formando trajado em beca acadêmica com capelo e diploma, sorriso confiante e iluminação quente de estúdio com fundo escuro elegante.
- TERÇO INFERIOR DA CAPA (Diagramação Oficial Villa7):
  1. TÍTULO PRINCIPAL: "{TITLE}" (Ex: "Formatura" ou Nome do Curso) em serifa acadêmica solene em Hot Stamping Dourado.
  2. SUBTÍTULO: "{SUBTITLE}" (Ex: "Uma nova jornada" ou Nome do Formando e Turma) em itálico refinado.
  3. FLORÃO CENTRALIZADO: Ornamento clássico formal.
  4. ASSINATURA: Selo "by VILLA7" com o emblema do livro no rodapé.
- LOMBADA (2x20 cm): Couro preto luxo com o nome do formando/curso gravado a ouro.
- ACABAMENTO: Padrão comemorativo de alto prestígio, 300 DPI, enquadramento perfeito para encadernação rígida.`
  },
  {
    id: 'personalizado-inteligente',
    title: 'Personalizado com Dados da Obra',
    subtitle: 'Harmonização com a Foto & Referências Enviadas',
    badge: 'Recomendado',
    referenceArchetype: 'Catálogo Oficial Villa7 Fine Art',
    defaultBgColor: '#F7F3EC',
    defaultFoilColor: 'gold',
    suggestedTitleExample: 'Nossas Melhores Memórias',
    suggestedSubtitleExample: 'Momentos Especiais • 2026',
    paletteDescription: 'Harmonização automática com as fotos enviadas, linho nobre, areia, marfim ou grafite.',
    suggestedTypography: 'Serifada contemporânea de alta costura com entrelinha harmônica',
    description: 'Aplica a fórmula estética oficial dos 5 álbuns da Villa7 de forma personalizada com os dados do seu projeto.',
    promptText: `Gere uma capa fotográfica profissional para fotolivro vertical 15x20 cm da Villa7, utilizando a fórmula visual dos álbuns oficiais:
- FOTOGRAFIA PRINCIPAL: Foto selecionada como elemento principal com enquadramento vertical harmonioso e iluminação envolvente.
- TERÇO INFERIOR (Padrão Oficial Villa7):
  1. TÍTULO PRINCIPAL: "{TITLE}" gravado em Hot Stamping metálico.
  2. SUBTÍTULO: "{SUBTITLE}" em itálico delicado.
  3. FLORÃO: Divisor decorativo centralizado (— ❦ —).
  4. ASSINATURA: Marca "by VILLA7" com o ícone do livro aberto.
- LOMBADA: 2 cm com título em caixa alta vertical e acabamento em couro ou linho nobre.
- ACABAMENTO: Respiro generoso de encadernação e acabamento editorial museológico.`
  }
];

/**
 * Constrói a mensagem formatada para o cliente copiar e colar no ChatGPT / DALL-E
 * contendo as 5 referências reais da Villa7 como guia de estilo.
 */
export function buildFormattedChatGPTMessage(
  prompt: CoverPromptDef,
  albumTitle: string,
  albumSubtitle: string,
  clientName: string,
  occasion?: string,
  eventDescription?: string
): string {
  const isFormatura = prompt.id === 'formatura-nova-jornada' || occasion === 'Conquistas & Formatura';

  // Resolved dynamic values with sensible fallbacks
  const projectName = (albumTitle || '').trim() || prompt.suggestedTitleExample || (isFormatura ? 'Formatura' : 'Marcelo e Vitória');
  const projectSubtitle = (albumSubtitle || '').trim() || prompt.suggestedSubtitleExample || (isFormatura ? 'Uma nova jornada' : 'Uma história de amor');
  const projectClient = (clientName || '').trim() || 'Cliente Villa7';

  // Resolved event context / description
  let resolvedDescription = (eventDescription || '').trim();
  if (!resolvedDescription) {
    if (occasion && occasion !== 'Outro') {
      resolvedDescription = `Celebração de ${occasion}, eternizando momentos especiais com alta carga afetiva e estética refinada de ateliê.`;
    } else {
      resolvedDescription = 'Álbum de memórias comemorativas, com diagramação editorial atemporal e acabamento em capa dura.';
    }
  }

  const occasionBadge = occasion && occasion !== 'Outro' ? occasion : (isFormatura ? 'Formatura & Graduação' : 'Celebração Especial');

  // Substituted prompt text
  const customPromptWithTokens = prompt.promptText
    .replace('{TITLE}', projectName)
    .replace('{SUBTITLE}', projectSubtitle);

  return `Olá ChatGPT! Por favor, crie uma imagem de capa dura para álbum fotográfico profissional em FORMATO VERTICAL 15x20 cm (proporção 2:3 ou 3:4) seguindo rigorosamente a identidade visual e os arquétipos físicos dos álbuns da Villa7 Álbuns:

=======================================================
📚 PADRÃO DE REFERÊNCIA OFICIAL VILLA7
=======================================================
Os álbuns da Villa7 seguem uma assinatura de design editorial consagrada:
• MODELO DE INSPIRAÇÃO: "${prompt.referenceArchetype || prompt.title}"
• LIVRO FÍSICO: Encadernação vertical 15x20 cm em capa dura, com lombada espessa de 2 cm revestida em linho nobre ou couro fosco, contendo o título em caixa alta vertical dourado e o emblema da Villa7.
• DIAGRAMAÇÃO DO TERÇO INFERIOR DA CAPA:
  1. TÍTULO PRINCIPAL: Gravado em Hot Stamping Ouro Champanhe (fonte serifada nobre como Trajan / Cormorant Garamond).
  2. SUBTÍTULO: Em serifa itálica delicada e espaçada.
  3. FLORÃO CENTRAL: Pequeno ornamento floral botânico (— ❦ —).
  4. ASSINATURA OBRIGATÓRIA: "by VILLA7" com o ícone do livro aberto estilizado no centro inferior.

=======================================================
🌟 DADOS DO PROJETO PARA ESTA CAPA
=======================================================
📌 TÍTULO PRINCIPAL (NOME DA OBRA):
👉 "${projectName}"

✨ SUBTÍTULO / FRASE / DATA:
👉 "${projectSubtitle}"

👤 CLIENTE / HOMENAGEADO(A): "${projectClient}"
🎉 OCASIÃO DO EVENTO: ${occasionBadge}
📝 CONTEXTO & ATMOSFERA: "${resolvedDescription}"
=======================================================

📸 FOTOGRAFIA PRINCIPAL:
Utilize a foto selecionada em anexo como protagonista da capa, com iluminação envolvente e cinematográfica.

🎨 DIRETIVA DE ESTILO SELECIONADA:
${customPromptWithTokens}

📐 ESPECIFICAÇÕES TÉCNICAS E DE DESIGN:
- Orientação: Estritamente Vertical (15x20 cm / Proporção 2:3 ou 3:4)
- Resolução: Alta definição fotográfica (300 DPI Fine Art)
- Hierarquia: Título "${projectName}", Subtítulo "${projectSubtitle}", Florão e assinatura "by VILLA7".
- Sem elementos de terceiros: Não incluir logomarcas comerciais estranhas, marcas d'água ou textos de empresas terceiras.`;
}

/**
 * Constrói o Prompt Completo e a Diretiva Oculta do Sistema para o Gemini / GPT Imagens
 */
export function buildGptCoverCreationPrompt(params: {
  promptDef: CoverPromptDef;
  albumTitle: string;
  albumSubtitle?: string;
  clientName?: string;
  occasion?: string;
  referenceImagesCount?: number;
  spineText?: string;
  foilColor?: string;
}): { fullPrompt: string; hiddenSystemPrompt: string } {
  const {
    promptDef,
    albumTitle,
    albumSubtitle,
    clientName,
    occasion,
    referenceImagesCount = 0,
    spineText,
    foilColor = 'gold',
  } = params;

  const resolvedTitle = (albumTitle || '').trim() || promptDef.suggestedTitleExample || 'Nossas Memórias';
  const resolvedSubtitle = (albumSubtitle || '').trim() || promptDef.suggestedSubtitleExample || 'Momentos Especiais • 2026';
  const resolvedClient = (clientName || '').trim() || 'Cliente Villa7';
  const resolvedSpine = (spineText || '').trim() || `${resolvedTitle.toUpperCase()} • 2026`;

  // Hidden System Prompt: Art Direction & Reference Matching Engine
  const hiddenSystemPrompt = `[DIRETIVA OCULTA DO SISTEMA - DIRETOR DE ARTE VILLA7 FINE ART]
Você é a IA mestre de design editorial e encadernação artesanal da grife Villa7 Álbuns Fotográficos.
Sua missão é conceber a arte de capa dura fotográfica vertical 15x20 cm com a assinatura autêntica dos 5 álbuns oficiais da Villa7:
1. Casamento ("Marcelo e Vitória - Uma história de amor")
2. Infantil ("Primeiros Momentos")
3. Ensaio Feminino ("Seu Melhor Momento")
4. Masculino ("Minha História - Meus caminhos, minhas conquistas")
5. Formatura ("Formatura - Uma nova jornada")

DIRETRIZES TÉCNICAS OBRIGATÓRIAS:
1. FORMATO: Capa Dura Vertical 15x20 cm (proporção 2:3 ou 3:4).
2. HARMONIZAÇÃO COM ARQUÉTIPO E REFERÊNCIAS:
   - Arquétipo Selecionado: "${promptDef.referenceArchetype || promptDef.title}"
   ${
     referenceImagesCount > 0
       ? `O cliente enviou ${referenceImagesCount} imagem(ns) de referência de capa. Analise a linguagem visual anexada (paleta nobre, iluminação cinematográfica, textura de linho ou couro escuro e gravação a quente) e replique essa atmosfera de luxo com exatidão.`
       : 'Utilize linguagem visual de alto luxo: textura de linho nobre ou couro preto fosco, fotografia cinematográfica e gravação metálica Hot Stamping.'
   }
3. DIAGRAMAÇÃO DO TERÇO INFERIOR:
   - Título Principal: "${resolvedTitle}" em serifa display refinada com acabamento metálico ${foilColor.toUpperCase()}.
   - Subtítulo: "${resolvedSubtitle}" em itálico delicado.
   - Florão botânico centralizado.
   - Assinatura oficial "by VILLA7" com o logotipo do livro aberto.
4. LOMBADA VERTICAL (Área útil de 2x6 cm):
   - Gravação com texto vertical em caixa alta: "${resolvedSpine}".
5. REGRA DE OURO EDITORIAL:
   - Preservar integridade de fisionomias das fotos originais (zero distorção fisionômica).
   - Respiro nobre nas margens (10% de margem de segurança para a vira da encadernação).
   - Sem logotipos comerciais ou textos de empresas terceiras.`;

  const customPromptSubstituted = promptDef.promptText
    .replace('{TITLE}', resolvedTitle)
    .replace('{SUBTITLE}', resolvedSubtitle);

  const fullPrompt = `${hiddenSystemPrompt}

INSTRUÇÃO DE GERAÇÃO PARA O GPT IMAGENS / DALL-E:
Crie uma imagem de capa dura vertical (15x20 cm) no estilo "${promptDef.title}".

ESTILO & PALETA:
${promptDef.paletteDescription}
Tipografia: ${promptDef.suggestedTypography}

ELEMENTOS DA ARTE:
- FOTOGRAFIA: Integrar a fotografia principal da capa com enquadramento vertical harmonioso e atmosfera cinematográfica.
- TERÇO INFERIOR:
  • Título: "${resolvedTitle}"
  • Subtítulo: "${resolvedSubtitle}"
  • Florão floral decorativo
  • Assinatura: "by VILLA7"
- TEXTURA DE REVESTIMENTO: Couro preto fosco ou linho fino areia.
- ACABAMENTO: Hot Stamping metálico ${foilColor} de altíssima definição (300 DPI Fine Art).`;

  return { fullPrompt, hiddenSystemPrompt };
}
