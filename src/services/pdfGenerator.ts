import { jsPDF } from 'jspdf';
import { AlbumProject, PhotoItem, SpreadItem } from '../types';

/**
 * Generates a unique, timestamped and versioned filename for each update
 */
export function generateUniqueAlbumFileName(project: AlbumProject): string {
  const clientSanitized = (project.clientData.name || 'Cliente')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '_');

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  const timestamp = `${year}${month}${day}_${hours}${minutes}${seconds}`;
  return `VILLA7_ALBUM_15x20_${clientSanitized}_${timestamp}.pdf`;
}

// Helper to create a fallback image if an image completely fails
function createFallbackImage(label: string): HTMLImageElement {
  const fallbackCanvas = document.createElement('canvas');
  fallbackCanvas.width = 600;
  fallbackCanvas.height = 400;
  const ctx = fallbackCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 600, 400);
    ctx.strokeStyle = '#E0D6C8';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 580, 380);
    ctx.fillStyle = '#8C7A6B';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Villa7 Fotografia', 300, 190);
    ctx.font = '15px sans-serif';
    ctx.fillText(label || 'Foto do Álbum', 300, 230);
  }
  const img = new Image();
  img.src = fallbackCanvas.toDataURL('image/jpeg', 0.9);
  return img;
}

// Helper to safely load any image (data URL, blob URL, or remote URL)
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    if (!src || typeof src !== 'string' || src.trim() === '') {
      resolve(createFallbackImage('Foto não encontrada'));
      return;
    }

    const img = new Image();

    // NEVER set crossOrigin for data: or blob: URLs (causes CORS errors and blank renders in browsers)
    const isDataOrBlob = src.startsWith('data:') || src.startsWith('blob:');
    if (!isDataOrBlob) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      resolve(img);
    };

    img.onerror = () => {
      if (img.crossOrigin) {
        const retryImg = new Image();
        retryImg.onload = () => resolve(retryImg);
        retryImg.onerror = () => {
          console.warn('Could not load image (retry failed):', src.substring(0, 50));
          resolve(createFallbackImage('Foto'));
        };
        retryImg.src = src;
        return;
      }
      console.warn('Could not load image:', src.substring(0, 50));
      resolve(createFallbackImage('Foto'));
    };

    img.src = src;
  });
}

// Render single spread onto an offscreen canvas in 3:2 ratio (2400 x 1600 px for print crispness)
// MIOLO BRANCO PURO (#FFFFFF) - Zero linhas, zero vincos impressos, zero textos internos.
export async function renderSpreadToCanvas(
  spread: SpreadItem,
  photosMap: Map<string, PhotoItem>,
  loadedImages: Map<string, HTMLImageElement>,
  project: AlbumProject,
  spreadIndex: number
): Promise<HTMLCanvasElement> {
  const canvasWidth = 2400; // 30cm aberto (3:2 ratio)
  const canvasHeight = 1600; // 20cm aberto
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // MIOLO 100% BRANCO PURO - Sem fundos bege ou marcas
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Draw Slots with pure white background & no unwanted lines
  for (const slot of spread.slots) {
    const slotX = (slot.x / 100) * canvasWidth;
    const slotY = (slot.y / 100) * canvasHeight;
    const slotW = (slot.width / 100) * canvasWidth;
    const slotH = (slot.height / 100) * canvasHeight;

    if (slot.photoId && (photosMap.has(slot.photoId) || loadedImages.has(slot.photoId))) {
      const photo = photosMap.get(slot.photoId);
      let img = loadedImages.get(slot.photoId);
      if (!img && photo) {
        img = loadedImages.get(photo.id);
      }

      if (!img && photo?.url) {
        img = await loadImage(photo.url);
        loadedImages.set(photo.id, img);
      }

      if (img) {
        ctx.save();
        // Clip to slot rectangle
        ctx.beginPath();
        ctx.rect(slotX, slotY, slotW, slotH);
        ctx.clip();

        // Calculate aspect ratio crop or fit
        const imgNaturalW = img.naturalWidth || img.width || 1200;
        const imgNaturalH = img.naturalHeight || img.height || 800;
        const imgAspect = imgNaturalW / imgNaturalH;
        const slotAspect = slotW / slotH;

        let drawW = slotW;
        let drawH = slotH;
        let drawX = slotX;
        let drawY = slotY;

        const zoom = slot.zoom || 1;
        const panX = ((slot.panX || 0) / 100) * slotW;
        const panY = ((slot.panY || 0) / 100) * slotH;

        if (slot.fit === 'contain') {
          // Pure white background for contain mode
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(slotX, slotY, slotW, slotH);

          if (imgAspect > slotAspect) {
            drawW = slotW * zoom;
            drawH = (slotW / imgAspect) * zoom;
          } else {
            drawH = slotH * zoom;
            drawW = slotH * imgAspect * zoom;
          }
          drawX = slotX + (slotW - drawW) / 2 + panX;
          drawY = slotY + (slotH - drawH) / 2 + panY;
        } else {
          // 'cover' default
          if (imgAspect > slotAspect) {
            drawH = slotH * zoom;
            drawW = slotH * imgAspect * zoom;
          } else {
            drawW = slotW * zoom;
            drawH = (slotW / imgAspect) * zoom;
          }
          drawX = slotX + (slotW - drawW) / 2 + panX;
          drawY = slotY + (slotH - drawH) / 2 + panY;
        }

        // Apply filters if any
        if (slot.filter === 'bw') {
          ctx.filter = 'grayscale(100%) contrast(105%)';
        } else if (slot.filter === 'warm') {
          ctx.filter = 'sepia(30%) saturate(120%)';
        } else if (slot.filter === 'vintage') {
          ctx.filter = 'sepia(50%) contrast(90%) brightness(105%)';
        } else if (slot.filter === 'soft') {
          ctx.filter = 'brightness(108%) contrast(92%)';
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
      }
    }
  }

  // Entire area of the spread is 100% clean for photography (NO footer text, NO fold line drawn inside).
  return canvas;
}

// Render Album Cover onto canvas (15x20 vertical closed -> 30x20 cm full open wrap with spine)
export async function renderCoverToCanvas(
  project: AlbumProject,
  loadedImages: Map<string, HTMLImageElement>
): Promise<HTMLCanvasElement> {
  const canvasWidth = 2400; // 30cm wide (Back cover 14.5cm + Spine 1cm + Front cover 14.5cm)
  const canvasHeight = 1600; // 20cm high
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background
  ctx.fillStyle = project.cover.bgColor || '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Front Cover Area (right half: x from 1250 to 2350, y from 80 to 1520)
  const frontX = 1250;
  const frontY = 80;
  const frontW = 1070;
  const frontH = 1440;

  // If cover has a photograph
  let coverImg = loadedImages.get('cover-image');
  if (!coverImg && project.cover.imageUrl) {
    coverImg = await loadImage(project.cover.imageUrl);
    loadedImages.set('cover-image', coverImg);
  }

  if (coverImg) {
    ctx.save();
    // Capa fotográfica vertical 15x20
    const photoW = 860;
    const photoH = 1000;
    const photoX = frontX + (frontW - photoW) / 2;
    const photoY = frontY + 60;

    // Foto da capa
    ctx.drawImage(coverImg, photoX, photoY, photoW, photoH);
    ctx.restore();
  }

  // Cover Typography
  ctx.save();
  ctx.fillStyle = project.cover.textColor || '#2C2420';
  ctx.textAlign = 'center';

  // Front Cover Title
  ctx.font = 'bold 52px "Cinzel", "Cormorant Garamond", serif';
  ctx.fillText(
    project.cover.title || project.clientData.albumTitle || 'VILLA7 MEMÓRIAS',
    frontX + frontW / 2,
    frontY + 1200
  );

  // Front Cover Subtitle
  ctx.font = 'italic 30px "Cormorant Garamond", serif';
  ctx.fillStyle = '#6E5C50';
  ctx.fillText(
    project.cover.subtitle || project.clientData.albumSubtitle || 'Coleção de Momentos',
    frontX + frontW / 2,
    frontY + 1265
  );

  // Year / Date
  ctx.font = '22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#8C7A6B';
  ctx.fillText(
    project.cover.yearOrDate || new Date().getFullYear().toString(),
    frontX + frontW / 2,
    frontY + 1320
  );

  // Spine Title (center column x: 1160 - 1240)
  ctx.save();
  ctx.translate(1200, canvasHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#8C7A6B';
  ctx.fillText(
    `${project.cover.title || project.clientData.albumTitle || 'VILLA7 ÁLBUNS'} • ${project.clientData.name || ''}`,
    0,
    0
  );
  ctx.restore();

  // Back cover branding
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px "Cinzel", serif';
  ctx.fillStyle = '#8C7A6B';
  ctx.fillText('VILLA7 ÁLBUNS', 600, canvasHeight / 2 - 15);
  ctx.font = '16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#A39282';
  ctx.fillText('MEMÓRIAS COLECIONÁVEIS • 15x20 VERTICAL', 600, canvasHeight / 2 + 20);

  ctx.restore();
  return canvas;
}

// Render Technical Certificate & Production Approval Page (2400 x 1600 px)
export function renderCertificateToCanvas(project: AlbumProject): HTMLCanvasElement {
  const canvasWidth = 2400;
  const canvasHeight = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Left page: Brand & Certificate Statement
  const leftCenterX = 600;
  ctx.fillStyle = '#3D2C24';
  ctx.textAlign = 'center';

  ctx.font = 'bold 46px "Cinzel", serif';
  ctx.fillText('VILLA7 ÁLBUNS', leftCenterX, 280);

  ctx.font = '22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#8C7A6B';
  ctx.fillText('HOMOLOGAÇÃO TÉCNICA DE PRODUÇÃO', leftCenterX, 330);

  ctx.strokeStyle = '#E0D6C8';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(leftCenterX - 250, 380);
  ctx.lineTo(leftCenterX + 250, 380);
  ctx.stroke();

  ctx.font = 'italic 28px "Cormorant Garamond", serif';
  ctx.fillStyle = '#5A4A3E';
  ctx.fillText('“Cada imagem guarda um fragmento eterno de afeto,', leftCenterX, 470);
  ctx.fillText('conquistas e histórias compartilhadas.”', leftCenterX, 515);

  // Technical Specs Box
  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(leftCenterX - 400, 600, 800, 750);
  ctx.strokeStyle = '#E0D6C8';
  ctx.strokeRect(leftCenterX - 400, 600, 800, 750);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#3D2C24';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('ESPECIFICAÇÕES TÉCNICAS DO ÁLBUM', leftCenterX - 350, 670);

  ctx.font = '20px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#5A4A3E';
  const specs = [
    `• Formato Fechado: 15 x 20 cm (Vertical)`,
    `• Formato Aberto (Lâmina Dupla): 20 x 30 cm (30 x 20 cm)`,
    `• Tipo de Capa: Capa Fotográfica 15x20 Vertical`,
    `• Miolo: Branco Puro (#FFFFFF) com Impressão Livre de Linhas`,
    `• Imposição Gráfica: 2 Lâminas por Folha A3 (Papel 297 x 420 mm)`,
    `• Total de Lâminas: ${project.spreadCount} lâminas duplas (${project.spreadCount * 2} páginas)`,
    `• Total de Fotos: ${project.photos.length} fotografias em alta resolução`,
    `• Abertura Panorâmica: 180° Flat-lay (Abertura Total sem perda na dobra)`,
    `• Proporção: Enquadramento fotográfico sem cortes indesejados`,
    `• Data de Aprovação: ${project.clientData.approvalDate || new Date().toLocaleDateString('pt-BR')}`,
  ];

  specs.forEach((spec, i) => {
    ctx.fillText(spec, leftCenterX - 350, 740 + i * 54);
  });

  // Right page: Client & Production details
  const rightCenterX = 1800;

  ctx.fillStyle = '#FAF7F2';
  ctx.fillRect(rightCenterX - 420, 240, 840, 1110);
  ctx.strokeStyle = '#E0D6C8';
  ctx.strokeRect(rightCenterX - 420, 240, 840, 1110);

  // Approval Stamp
  ctx.save();
  ctx.strokeStyle = '#8C5E3C';
  ctx.lineWidth = 3;
  ctx.strokeRect(rightCenterX - 370, 300, 740, 150);
  ctx.fillStyle = '#8C5E3C';
  ctx.textAlign = 'center';
  ctx.font = 'bold 30px "Cinzel", serif';
  ctx.fillText('✓ CONTEÚDO APROVADO PARA IMPRESSÃO', rightCenterX, 360);
  ctx.font = '20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `APROVAÇÃO REGISTRADA EM ${project.clientData.approvalDate || new Date().toLocaleString('pt-BR')}`,
    rightCenterX,
    410
  );
  ctx.restore();

  // Client Data list
  ctx.textAlign = 'left';
  ctx.fillStyle = '#2C2420';
  ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('DADOS DO CLIENTE & PROJETO', rightCenterX - 370, 530);

  const clientInfo = [
    { label: 'Nome do Cliente', value: project.clientData.name || 'Cliente Villa7' },
    { label: 'E-mail de Contato', value: project.clientData.email || 'contato@cliente.com' },
    { label: 'Telefone / WhatsApp', value: project.clientData.phone || '(11) 99999-9999' },
    { label: 'Título do Álbum', value: project.clientData.albumTitle || 'Álbum de Memórias' },
    { label: 'Subtítulo', value: project.clientData.albumSubtitle || 'Momentos Únicos' },
    { label: 'Ocasião', value: project.clientData.occasion || 'Ensaio / Evento' },
  ];

  clientInfo.forEach((item, idx) => {
    const y = 600 + idx * 80;
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#8C7A6B';
    ctx.fillText(item.label.toUpperCase(), rightCenterX - 370, y);

    ctx.font = '22px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#2C2420';
    ctx.fillText(item.value, rightCenterX - 370, y + 30);
  });

  // Stamp Signature
  ctx.fillStyle = '#8C7A6B';
  ctx.font = 'italic 18px "Cormorant Garamond", serif';
  ctx.textAlign = 'center';
  ctx.fillText('Villa7 Álbuns — 15x20 Vertical com Capa Fotográfica', rightCenterX, 1260);

  return canvas;
}

// Render Quality Control / Closing sheet when total spreads is odd
export function renderQualityControlToCanvas(project: AlbumProject): HTMLCanvasElement {
  const canvasWidth = 2400;
  const canvasHeight = 1600;
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.strokeStyle = '#E0D6C8';
  ctx.lineWidth = 2;
  ctx.strokeRect(80, 80, canvasWidth - 160, canvasHeight - 160);

  ctx.fillStyle = '#3D2C24';
  ctx.font = 'bold 40px "Cinzel", serif';
  ctx.textAlign = 'center';
  ctx.fillText('CONTROLE DE QUALIDADE GRÁFICA & ENCADERNAÇÃO', canvasWidth / 2, 220);

  ctx.font = '22px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#8C7A6B';
  ctx.fillText(
    `VILLA7 ÁLBUNS • 15x20 VERTICAL • ${project.clientData.albumTitle || 'Álbum'} • CLIENTE: ${project.clientData.name || 'Cliente'}`,
    canvasWidth / 2,
    280
  );

  const checklistItems = [
    '✓ Miolo 100% Branco Puro com Impressão Livre de Linhas',
    '✓ Formato 15x20 cm Vertical (Lâmina Aberta 20x30 cm)',
    '✓ Verificação de Dobra Central 180° Flat-lay',
    '✓ Resolução Fotográfica e Perfil de Cores Fine Art',
    '✓ Homologação e Assinatura Digital de Aprovação Registrada',
  ];

  ctx.textAlign = 'left';
  ctx.font = '24px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#2C2420';
  checklistItems.forEach((item, idx) => {
    ctx.fillText(item, 450, 480 + idx * 100);
  });

  ctx.textAlign = 'center';
  ctx.font = 'italic 20px "Cormorant Garamond", serif';
  ctx.fillStyle = '#8C7A6B';
  ctx.fillText('Villa7 Fotografia & Design — Impressão Fine Art em Papel Fotográfico Profissional', canvasWidth / 2, 1380);

  return canvas;
}

export interface PDFGenerationProgress {
  step: string;
  percent: number;
}

export interface PDFGenerationOptions {
  layoutMode?: 'a3_two_spreads' | 'single_spreads';
}

// Compact helper to draw discrete registration marks and ultra-compact single-line metadata outside the image area
function drawA3SheetGuides(
  pdf: jsPDF,
  sheetNumber: number,
  totalSheets: number,
  project: AlbumProject,
  topLabel: string,
  bottomLabel: string
) {
  const pageWidth = 297; // mm
  const pageHeight = 420; // mm
  const spreadW = 270; // mm (3:2 ratio: 270 x 180 mm)
  const spreadH = 180; // mm (3:2 ratio: 270 x 180 mm)
  const spreadX = (pageWidth - spreadW) / 2; // 13.5 mm

  const topSpreadY = 18; // mm (extends 18 to 198 mm)
  const cutLineY = 208; // mm
  const bottomSpreadY = 218; // mm (extends 218 to 398 mm)

  const clientName = (project.clientData.name || 'Cliente').toUpperCase();
  const albumTitle = (project.cover.title || project.clientData.albumTitle || 'Álbum').toUpperCase();

  // Top spread compact metadata (small 6pt font, 1 single line at margin)
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(110, 95, 85);
  pdf.text(
    `VILLA7 • 15x20 VERTICAL (ABERTO 20x30 CM) • FOLHA ${sheetNumber}/${totalSheets} • ${topLabel} • ${clientName} — ${albumTitle}`,
    spreadX,
    topSpreadY - 3
  );

  // Top spread crop marks at 4 corners (outside the spread area)
  const markLen = 3.5;
  pdf.setDrawColor(160, 140, 120);
  pdf.setLineWidth(0.2);

  // Top-left
  pdf.line(spreadX - markLen, topSpreadY, spreadX, topSpreadY);
  pdf.line(spreadX, topSpreadY - markLen, spreadX, topSpreadY);
  // Top-right
  pdf.line(spreadX + spreadW, topSpreadY, spreadX + spreadW + markLen, topSpreadY);
  pdf.line(spreadX + spreadW, topSpreadY - markLen, spreadX + spreadW, topSpreadY);
  // Bottom-left
  pdf.line(spreadX - markLen, topSpreadY + spreadH, spreadX, topSpreadY + spreadH);
  pdf.line(spreadX, topSpreadY + spreadH, spreadX, topSpreadY + spreadH + markLen);
  // Bottom-right
  pdf.line(spreadX + spreadW, topSpreadY + spreadH, spreadX + spreadW + markLen, topSpreadY + spreadH);
  pdf.line(spreadX + spreadW, topSpreadY + spreadH, spreadX + spreadW + markLen, topSpreadY + spreadH);

  // Top spread fold mark (center at x = 148.5 mm, outside the spread)
  pdf.line(pageWidth / 2, topSpreadY - 3, pageWidth / 2, topSpreadY);
  pdf.line(pageWidth / 2, topSpreadY + spreadH, pageWidth / 2, topSpreadY + spreadH + 3);

  // Intermediate Cut Line (Linha de Corte entre Lâminas na folha A3)
  pdf.saveGraphicsState();
  pdf.setDrawColor(180, 160, 140);
  pdf.setLineWidth(0.2);
  pdf.setLineDashPattern([2, 2], 0);
  pdf.line(8, cutLineY, pageWidth - 8, cutLineY);
  pdf.restoreGraphicsState();

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5.5);
  pdf.setTextColor(150, 130, 115);
  pdf.text('✂ CORTE / SEPARAÇÃO DE LÂMINAS (20x30 cm)', pageWidth / 2, cutLineY - 1.2, {
    align: 'center',
  });

  // Bottom spread compact metadata
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(110, 95, 85);
  pdf.text(
    `VILLA7 • 15x20 VERTICAL (ABERTO 20x30 CM) • FOLHA ${sheetNumber}/${totalSheets} • ${bottomLabel} • ${clientName} — ${albumTitle}`,
    spreadX,
    bottomSpreadY - 3
  );

  // Bottom spread crop marks
  pdf.line(spreadX - markLen, bottomSpreadY, spreadX, bottomSpreadY);
  pdf.line(spreadX, bottomSpreadY - markLen, spreadX, bottomSpreadY);
  pdf.line(spreadX + spreadW, bottomSpreadY, spreadX + spreadW + markLen, bottomSpreadY);
  pdf.line(spreadX + spreadW, bottomSpreadY - markLen, spreadX + spreadW, bottomSpreadY);
  pdf.line(spreadX - markLen, bottomSpreadY + spreadH, spreadX, bottomSpreadY + spreadH);
  pdf.line(spreadX, bottomSpreadY + spreadH, spreadX, bottomSpreadY + spreadH + markLen);
  pdf.line(spreadX + spreadW, bottomSpreadY + spreadH, spreadX + spreadW + markLen, bottomSpreadY + spreadH);
  pdf.line(spreadX + spreadW, bottomSpreadY + spreadH, spreadX + spreadW + markLen, bottomSpreadY + spreadH);

  // Bottom spread fold mark (center at x = 148.5 mm, outside the spread)
  pdf.line(pageWidth / 2, bottomSpreadY - 3, pageWidth / 2, bottomSpreadY);
  pdf.line(pageWidth / 2, bottomSpreadY + spreadH, pageWidth / 2, bottomSpreadY + spreadH + 3);

  // Footer CMYK Color Calibration Bars at bottom margin of A3 sheet (Y = 407 mm)
  const colorBarY = 407;
  const swatchW = 6;
  const swatchH = 3;
  const colors = [
    { name: 'C', r: 0, g: 174, b: 239 },
    { name: 'M', r: 236, g: 0, b: 140 },
    { name: 'Y', r: 255, g: 242, b: 0 },
    { name: 'K', r: 35, g: 31, b: 32 },
    { name: '100%', r: 40, g: 40, b: 40 },
    { name: '75%', r: 90, g: 90, b: 90 },
    { name: '50%', r: 150, g: 150, b: 150 },
    { name: '25%', r: 210, g: 210, b: 210 },
  ];

  colors.forEach((c, idx) => {
    pdf.setFillColor(c.r, c.g, c.b);
    pdf.rect(spreadX + idx * (swatchW + 1.5), colorBarY, swatchW, swatchH, 'F');
  });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5.5);
  pdf.setTextColor(150, 130, 110);
  pdf.text(
    `VILLA7 FOTOGRAFIA • IMPOSIÇÃO A3 (2 LÂMINAS POR FOLHA) • MIOLO BRANCO • CONTROLE DE COR & SANGRIA`,
    spreadX + colors.length * (swatchW + 1.5) + 5,
    colorBarY + 2.3
  );
}

// Primary Export Function: Generates the A3 PDF with 2 spreads (20x30 cm) per page
export async function generateAlbumPDF(
  project: AlbumProject,
  onProgress?: (progress: PDFGenerationProgress) => void,
  options?: PDFGenerationOptions
): Promise<{ blob: Blob; fileName: string; dataUri: string }> {
  // Pre-load all photo images
  onProgress?.({ step: 'Carregando fotografias em alta resolução...', percent: 10 });
  const loadedImages = new Map<string, HTMLImageElement>();
  const photosMap = new Map<string, PhotoItem>();

  project.photos.forEach((p) => photosMap.set(p.id, p));

  const loadPromises: Promise<void>[] = [];

  for (const photo of project.photos) {
    if (photo.url) {
      loadPromises.push(
        loadImage(photo.url).then((img) => {
          loadedImages.set(photo.id, img);
        })
      );
    }
  }

  if (project.cover.imageUrl) {
    loadPromises.push(
      loadImage(project.cover.imageUrl).then((img) => {
        loadedImages.set('cover-image', img);
      })
    );
  }

  await Promise.all(loadPromises);

  const spreadW = 270; // mm (3:2 ratio on A3 sheet: 270 x 180 mm)
  const spreadH = 180; // mm
  const spreadX = (297 - spreadW) / 2; // 13.5 mm (centered)
  const topSpreadY = 18; // mm
  const bottomSpreadY = 218; // mm

  onProgress?.({ step: 'Configurando formato de impressão A3 (2 Lâminas 20x30 cm por Página)...', percent: 25 });

  // Initialize jsPDF in A3 portrait format (297 mm x 420 mm)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a3',
    compress: true,
  });

  // Calculate total A3 sheets needed:
  // Sheet 1: Certificado (Top) + Capa Aberta (Bottom)
  // Subsequent sheets: 2 spreads per sheet
  const totalSpreads = project.spreads.length;
  const spreadSheetsCount = Math.ceil(totalSpreads / 2);
  const totalSheets = 1 + spreadSheetsCount;

  // =========================================================================
  // SHEET 1: Certificado de Produção (Top) + Capa do Álbum 15x20 (Bottom)
  // =========================================================================
  onProgress?.({ step: 'Gerando Folha 1 de Impressão A3 (Certificado & Capa Fotográfica 15x20)...', percent: 35 });

  const certCanvas = renderCertificateToCanvas(project);
  const certData = certCanvas.toDataURL('image/jpeg', 0.95);
  pdf.addImage(certData, 'JPEG', spreadX, topSpreadY, spreadW, spreadH, undefined, 'FAST');

  const coverCanvas = await renderCoverToCanvas(project, loadedImages);
  const coverData = coverCanvas.toDataURL('image/jpeg', 0.95);
  pdf.addImage(coverData, 'JPEG', spreadX, bottomSpreadY, spreadW, spreadH, undefined, 'FAST');

  drawA3SheetGuides(
    pdf,
    1,
    totalSheets,
    project,
    'CERTIFICADO DE PRODUÇÃO & ESPECIFICAÇÃO',
    'CAPA FOTOGRÁFICA 15x20 VERTICAL (ABERTA 30x20 CM)'
  );

  // =========================================================================
  // SHEETS 2+: 2 Spreads (20x30 cm) per A3 Page
  // =========================================================================
  for (let sheetIdx = 0; sheetIdx < spreadSheetsCount; sheetIdx++) {
    const spreadIndexA = sheetIdx * 2;
    const spreadIndexB = sheetIdx * 2 + 1;
    const currentSheetNumber = sheetIdx + 2;

    const progressPercent = Math.round(40 + ((sheetIdx + 1) / spreadSheetsCount) * 55);
    onProgress?.({
      step: `Renderizando Folha ${currentSheetNumber} de ${totalSheets} (Lâminas ${spreadIndexA + 1}${spreadIndexB < totalSpreads ? ` e ${spreadIndexB + 1}` : ''})...`,
      percent: progressPercent,
    });

    pdf.addPage('a3', 'portrait');

    // Render Top Spread (spreadIndexA)
    const spreadA = project.spreads[spreadIndexA];
    const canvasA = await renderSpreadToCanvas(spreadA, photosMap, loadedImages, project, spreadIndexA);
    const dataA = canvasA.toDataURL('image/jpeg', 0.95);
    pdf.addImage(dataA, 'JPEG', spreadX, topSpreadY, spreadW, spreadH, undefined, 'FAST');

    const topLabel = `LÂMINA ${spreadIndexA + 1} DE ${totalSpreads} (PÁGS ${spreadIndexA * 2 + 1}-${spreadIndexA * 2 + 2})`;

    let bottomLabel = '';
    // Render Bottom Spread (spreadIndexB) if exists
    if (spreadIndexB < totalSpreads) {
      const spreadB = project.spreads[spreadIndexB];
      const canvasB = await renderSpreadToCanvas(spreadB, photosMap, loadedImages, project, spreadIndexB);
      const dataB = canvasB.toDataURL('image/jpeg', 0.95);
      pdf.addImage(dataB, 'JPEG', spreadX, bottomSpreadY, spreadW, spreadH, undefined, 'FAST');
      bottomLabel = `LÂMINA ${spreadIndexB + 1} DE ${totalSpreads} (PÁGS ${spreadIndexB * 2 + 1}-${spreadIndexB * 2 + 2})`;
    } else {
      // If odd number of spreads, render technical quality checklist
      const closingCanvas = renderQualityControlToCanvas(project);
      const closingData = closingCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(closingData, 'JPEG', spreadX, bottomSpreadY, spreadW, spreadH, undefined, 'FAST');
      bottomLabel = 'CONTROLE DE QUALIDADE GRÁFICA & FECHAMENTO';
    }

    drawA3SheetGuides(pdf, currentSheetNumber, totalSheets, project, topLabel, bottomLabel);
  }

  onProgress?.({ step: 'Finalizando arquivo PDF de impressão A3 de alta resolução...', percent: 98 });

  const fileName = generateUniqueAlbumFileName(project);

  const blob = pdf.output('blob');
  const dataUri = pdf.output('datauristring');

  onProgress?.({ step: 'PDF de Impressão A3 gerado com sucesso!', percent: 100 });

  return { blob, fileName, dataUri };
}
