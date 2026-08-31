import { CoverPromptDef } from '../types';

export const COVER_PROMPT_PRESETS: CoverPromptDef[] = [
  {
    id: 'formatura-graduacao',
    title: 'Formatura & Colação de Grau',
    subtitle: 'Nome do Curso, Formando & Subtexto',
    badge: 'Formatura & Acadêmico',
    paletteDescription: 'Tons nobres acadêmicos (azul marinho, verde esmeralda, bordeaux ou preto acetinado) com detalhes em dourado ou prata.',
    suggestedTypography: 'Serifada solene acadêmica (Trajan / Garamond / Cinzel) e sans-serif refinada',
    description: 'Composição solene para formaturas: destaque total para o Nome do Curso (Projeto), Nome do Aluno e Descrição do Evento/Turma.',
    promptText: `Gere uma arte de capa fotográfica vertical em formato 15x20 cm (proporção 2:3) para álbum de formatura e graduação.
Instruções de composição:
- FOTOGRAFIA PRINCIPAL: Destaque a fotografia da formanda/formando selecionada como elemento central nobre e imponente.
- TEXTOS NA CAPA (conter estritamente apenas estes elementos):
  1. TÍTULO PRINCIPAL / NOME DO CURSO (Em grande destaque na arte)
  2. NOME DO ALUNO(A) / FORMANDO(A)
  3. SUBTEXTO / DESCRIÇÃO (Turma, Ano de Formatura ou Mensagem Comemorativa)
- FUNDO E ESTÉTICA: Fundo com textura requintada de linho escuro, papel algodão ou acabamento fosco em tons sóbrios (azul marinho, grafite profundo, verde esmeralda ou preto), com detalhes tipográficos solenes em baixo-relevo ou hot stamping dourado/prateado.
- REGRA DE IDENTIDADE: A arte deve conter única e exclusivamente a foto selecionada e os textos informados (Curso, Aluno e Subtexto), sem logotipos comerciais ou textos institucionais de empresas.`
  },
  {
    id: 'personalizado-inteligente',
    title: 'Personalizado com Dados da Obra',
    subtitle: 'Nome do Projeto, Descrição do Evento & Subtexto',
    badge: 'Recomendado',
    paletteDescription: 'Tons orgânicos, linho nobre, areia, off-white e acabamento em baixo-relevo.',
    suggestedTypography: 'Serifada contemporânea com espaçamento editorial generoso',
    description: 'Prompt dinâmico preenchido automaticamente com o Nome do Projeto e a Descrição do Evento em destaque supremo.',
    promptText: `Gere uma capa fotográfica profissional para um fotolivro vertical 15x20 cm (proporção 2:3 ou 3:4).
Instruções de composição:
- FOTOGRAFIA PRINCIPAL: Use a fotografia selecionada como o elemento de destaque principal, com iluminação envolvente e enquadramento vertical harmonioso.
- TEXTOS NA CAPA (conter apenas estes elementos essenciais):
  1. NOME DO PROJETO (Título Principal da Obra em destaque)
  2. SUBTÍTULO / DATA / SUBTEXTO SECUNDÁRIO
- CONTEXTO & DESCRIÇÃO DO EVENTO: Harmonize a atmosfera visual e a iluminação conforme a descrição do evento fornecida.
- FUNDO E TEXTURA: Fundo em textura nobre de linho cru, papel algodão artesanal ou couro vegetal em tons neutros (off-white, areia, fendi suave).
- REGRA DE IDENTIDADE: Apenas a foto selecionada, o título e o subtítulo devem constar na arte, sem marcas d'água, logotipos ou menções comerciais.`
  },
  {
    id: 'minimalista-elegante',
    title: 'Minimalista & Linho Fino',
    subtitle: 'Design limpo, Foto central & Tipografia nobre',
    badge: 'Mais Popular',
    paletteDescription: 'Tons de areia, linho cru, marfim e gravação sutil em baixo-relevo.',
    suggestedTypography: 'Serifa refinada de alto contraste (Cormorant Garamond / Didot)',
    description: 'Capa atemporal com foco central na fotografia com paspatur generoso, Nome do Projeto e Descrição do Evento.',
    promptText: `Gere uma capa fotográfica no estilo "Minimalista Elegante" em formato vertical 15x20 cm (proporção 2:3).
Instruções de composição:
- FOTOGRAFIA: Posicione a foto selecionada no centro com paspatur generoso e enquadramento vertical equilibrado.
- TEXTOS: Inclua o Nome do Projeto (Título Principal) e o Subtítulo/Subtexto gravados com tipografia serifada minimalista de alto padrão.
- FUNDO: Textura tátil de linho nobre ou papel algodão em tons neutros quentes (areia, off-white, terracota suave).
- ACABAMENTO: Estética clean, elegante e sem excesso de elementos gráficos, sem inclusão de logomarcas comerciais.`
  },
  {
    id: 'casamento-fine-art',
    title: 'Casamento & Ensaio Romântico',
    subtitle: 'Golden hour & Atmosfera etérea',
    badge: 'Casamentos & Noivados',
    paletteDescription: 'Champagne, marfim suave, dourado sutil e tons terrosos quentes.',
    suggestedTypography: 'Caligrafia fina clássica com serifa suave',
    description: 'Ideal para celebrações a dois: foto romântica, Nome do Projeto (Casal), Descrição do Evento e data/subtexto.',
    promptText: `Crie uma arte de capa fotográfica vertical 15x20 cm para álbum de casamento no estilo Fine Art Romântico.
Instruções de composição:
- FOTOGRAFIA: Destaque o casal com luz suave e atmosfera calorosa e cinematográfica, refletindo o contexto do casamento.
- TEXTOS: Apenas o Nome do Projeto / Noivos (Título Principal) e o Subtítulo (Data / Local / Subtexto) gravados de forma delicada.
- FUNDO: Textura de linho marfim ou couro vegetal claro com paspatur elegante.
- ACABAMENTO: Visual clássico e limpo, sem selos, logotipos ou inscrições de empresas.`
  },
  {
    id: 'familia-afeto',
    title: 'Família & Infantil Aconchegante',
    subtitle: 'Luz natural & Momentos espontâneos',
    badge: 'Família & Crianças',
    paletteDescription: 'Tons de baunilha, amêndoa, terracota suave e linho lavado.',
    suggestedTypography: 'Serifada humanista acolhedora',
    description: 'Perfeito para celebrar momentos em família, aniversários e encontros de afeto com o contexto do evento em destaque.',
    promptText: `Crie uma capa para álbum fotográfico de família em formato vertical 15x20 cm (proporção 2:3).
Instruções de composição:
- FOTOGRAFIA: Integre a foto de família selecionada com iluminação natural acolhedora e atmosfera calorosa de lar e carinho.
- TEXTOS: Inclua estritamente o Nome do Projeto / Família (Título Principal) e Subtítulo (Ano / Subtexto).
- FUNDO: Textura suave e orgânica em tons neutros terrosos (bege, baunilha e linho lavado).
- ACABAMENTO: Visual nobre e atemporal, sem logotipos comerciais ou textos estranhos à família.`
  },
  {
    id: 'editorial-feminino',
    title: 'Ensaio Feminino / Editorial',
    subtitle: 'Elegância contemporânea & Estilo revista',
    badge: 'Moda & Retratos',
    paletteDescription: 'Neutros sofisticados, bege quente, fendi e iluminação de estúdio.',
    suggestedTypography: 'Sans-serif geométrica minimalista',
    description: 'Diagramação de livro de fotografia de autor com recorte marcante, Nome do Projeto e luz sofisticada.',
    promptText: `Gere uma capa de fotolivro vertical 15x20 cm (proporção 2:3) no estilo Retrato Editorial.
Instruções de composição:
- FOTOGRAFIA: Valorize a expressão e presença da pessoa na foto com iluminação suave de estúdio e bokeh sofisticado.
- TEXTOS: Apenas o Nome do Projeto / Título Principal e o Subtítulo/Ano com hierarquia tipográfica limpa e contemporânea.
- FUNDO: Tom neutro sofisticado com textura de papel de arte fosco.
- ACABAMENTO: Sem marcas comerciais, logotipos ou elementos promocionais.`
  },
  {
    id: 'debutante-15anos',
    title: '15 Anos & Celebração',
    subtitle: 'Brilho sutil & Sofisticação jovem',
    badge: '15 Anos & Debutante',
    paletteDescription: 'Rose gold, lavanda suave, marfim e detalhes delicados de brilho.',
    suggestedTypography: 'Moderna refinada com detalhes elegantes',
    description: 'Perfeita para eternizar festas de 15 anos com Nome da Debutante (Projeto) e Descrição da Festa.',
    promptText: `Crie uma capa de álbum vertical 15x20 cm para celebração de 15 Anos / Debutante.
Instruções de composição:
- FOTOGRAFIA: Destaque a debutante com iluminação brilhante e suave, capturando a energia e encanto da celebração.
- TEXTOS: Apenas o Nome do Projeto / Debutante como Título Principal e a Data / Idade / Subtexto como secundário.
- FUNDO: Textura em linho marfim com toques discretos em tom metálico delicado.
- ACABAMENTO: Limpo, nobre e sem qualquer logotipo ou texto comercial.`
  },
  {
    id: 'gestante-newborn',
    title: 'Gestante & Bebê (Newborn)',
    subtitle: 'Delicadeza, pureza e ternura',
    badge: 'Maternidade',
    paletteDescription: 'Tons pastéis terrosos, camomila, areia e branco quente.',
    suggestedTypography: 'Tipografia suave e orgânica',
    description: 'Aconchegante e suave para os primeiros dias e a doce espera da maternidade com contexto em destaque.',
    promptText: `Gere uma capa de álbum de maternidade e gestante no formato vertical 15x20 cm (proporção 2:3).
Instruções de composição:
- FOTOGRAFIA: Fotografia selecionada em primeiro plano com suavidade extrema, tons claros e iluminação difusa etérea.
- TEXTOS: Apenas o Nome do Bebê / Família (Título Principal / Projeto) e Data de Nascimento / Subtexto (Secundário).
- FUNDO: Textura de algodão puro ou veludo suave no fundo, evocando ternura e cuidado.
- ACABAMENTO: Puro, atemporal, sem logotipos ou textos de empresas.`
  },
  {
    id: 'viagem-paisagem',
    title: 'Viagens & Aventuras',
    subtitle: 'Fotografia de paisagem & Exploração',
    badge: 'Viagens',
    paletteDescription: 'Tons da natureza, areia dourada, céu suave e terracota.',
    suggestedTypography: 'Display clean ou serifa contemporânea',
    description: 'Destaque para cenários inesquecíveis, passeios e registros de férias com Nome do Destino em destaque.',
    promptText: `Crie uma capa de livro de memórias de viagem em formato vertical 15x20 cm (proporção 2:3).
Instruções de composição:
- FOTOGRAFIA: Destaque a foto da paisagem ou dos viajantes com profundidade de campo e cores ricas.
- TEXTOS: Apenas o Nome do Projeto / Destino (Título Principal) e Ano / Subtexto (Secundário).
- FUNDO: Textura de diário de bordo refinado em linho cru ou areia.
- ACABAMENTO: Sem logotipos de agências ou empresas, mantendo foco total na viagem.`
  }
];

export function buildFormattedChatGPTMessage(
  prompt: CoverPromptDef,
  albumTitle: string,
  albumSubtitle: string,
  clientName: string,
  occasion?: string,
  eventDescription?: string
): string {
  const isFormatura = prompt.id === 'formatura-graduacao' || occasion === 'Conquistas & Formatura';

  // Resolved dynamic values with sensible fallbacks
  const projectName = (albumTitle || '').trim() || (isFormatura ? 'Formatura em Medicina' : 'Nossas Melhores Memórias');
  const projectSubtitle = (albumSubtitle || '').trim() || (isFormatura ? 'Turma de 2026 • Colação de Grau' : 'Momentos Inesquecíveis • 2026');
  const projectClient = (clientName || '').trim() || (isFormatura ? 'Dr(a). Formando(a)' : 'Família & Memórias');
  
  // Resolved event context / description
  let resolvedDescription = (eventDescription || '').trim();
  if (!resolvedDescription) {
    if (occasion && occasion !== 'Outro') {
      resolvedDescription = `Celebração especial de ${occasion}, registrando momentos inesquecíveis com alta carga emocional e elegância.`;
    } else {
      resolvedDescription = 'Álbum comemorativo de memórias fotográficas especiais, com estética refinada e atemporal.';
    }
  }

  const occasionBadge = occasion && occasion !== 'Outro' ? occasion : (isFormatura ? 'Formatura & Graduação' : 'Celebração Especial');

  return `Olá ChatGPT! Por favor, crie uma imagem de capa de álbum fotográfico profissional em FORMATO VERTICAL 15x20 cm (proporção 2:3 ou 3:4) utilizando com MÁXIMO DESTAQUE os dados pré-enviados do projeto abaixo:

=======================================================
🌟 DADOS PRINCIPAIS EM DESTAQUE NA OBRA
=======================================================
📌 NOME DO PROJETO (TÍTULO PRINCIPAL DA CAPA):
👉 "${projectName}"

📝 DESCRIÇÃO DO EVENTO & CONTEXTO VISUAL:
👉 "${resolvedDescription}"

🎉 OCASIÃO DO EVENTO: ${occasionBadge}
👤 CLIENTE / HOMENAGEADO(A): "${projectClient}"
✨ SUBTÍTULO / DATA / ANO: "${projectSubtitle}"
=======================================================

📸 FOTOGRAFIA DE CAPA:
(Utilize a fotografia principal selecionada em anexo como o elemento visual central e de maior destaque na composição).

✍️ TEXTOS A GRAVAR NA CAPA (CONTER ESTRITAMENTE APENAS ESTES ELEMENTOS):
${isFormatura ? `1. 🎓 TÍTULO PRINCIPAL (NOME DO CURSO): "${projectName}"
2. 👤 NOME DO ALUNO(A) / FORMANDO(A): "${projectClient}"
3. ✨ SUBTEXTO (TURMA / ANO / FRASE): "${projectSubtitle}"` : `1. 📖 TÍTULO PRINCIPAL DA CAPA: "${projectName}"
2. ✨ SUBTÍTULO / DATA / SUBTEXTO: "${projectSubtitle}"
3. 👤 NOME / IDENTIFICAÇÃO: "${projectClient}"`}

🎨 ESTILO VISUAL SELECIONADO: ${prompt.title} (${prompt.subtitle})
${prompt.promptText}

📐 ESPECIFICAÇÕES TÉCNICAS E DE DESIGN:
- Orientação: Estritamente Vertical (15x20 cm / Proporção 2:3 ou 3:4)
- Resolução: Alta definição fotográfica (300 DPI)
- Hierarquia Visual: O Nome do Projeto "${projectName}" e a atmosfera descrita em "${resolvedDescription}" devem conduzir a composição e o clima da arte.
- Regra de Arte: Conter apenas a foto selecionada, o título principal e o subtítulo/subtexto informados. NÃO adicionar marcas d'água, logotipos comerciais ou textos institucionais de empresas.
- Acabamento: Estética editorial de luxo, com enquadramento perfeito e área de respiro harmônica para a encadernação.

Por favor, gere a imagem de capa pronta para uso no formato vertical 15x20 cm!`;
}
