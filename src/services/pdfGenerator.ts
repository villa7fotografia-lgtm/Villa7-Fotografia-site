import { jsPDF } from 'jspdf';
import { AlbumProject, PhotoItem, SpreadItem } from '../types';
import { sanitizeSpreads } from '../utils/spreadOptimizer';

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

// Render Full Open Horizontal Hardcover Art onto canvas (Contracapa 15x20 + Lombada 2x20 com texto 2x6 cm + Capa Frontal 15x20)
export async function renderCoverToCanvas(
  project: AlbumProject,
  loadedImages: Map<string, HTMLImageElement>
): Promise<HTMLCanvasElement> {
  // Scale: 80 px/cm -> Contracapa 15cm (1200px) + Lombada 2cm (160px) + Capa 15cm (1200px) = 2560 px width x 1600 px height (20cm)
  const canvasWidth = 2560; // 32 cm wide open flat hardcover
  const canvasHeight = 1600; // 20 cm high
  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background color
  const bgColor = project.cover.bgColor || '#F7F3EC';
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Foil color resolution
  const foilType = project.cover.foilColor || 'gold';
  let foilHex = '#B39770'; // Dourado Champanhe
  if (foilType === 'silver') foilHex = '#8F969E';
  else if (foilType === 'rose') foilHex = '#B58888';
  else if (foilType === 'black') foilHex = '#211D19';
  else if (foilType === 'white') foilHex = '#FFFFFF';

  const isDarkBg = bgColor === '#211D19' || bgColor === '#1A1816';
  const textColor = project.cover.textColor || (isDarkBg ? '#FAF7F2' : '#211D19');
  const borderMuted = isDarkBg ? '#3E3730' : '#E4DACD';
  const subtextColor = isDarkBg ? '#A89E92' : '#7A685B';

  // =========================================================================
  // 1. CONTRACAPA (Back Cover - Left side: 0 to 1200 px, center at 600 px)
  // =========================================================================
  const backCenterX = 600;

  // Discrete luxury border on contracapa
  ctx.strokeStyle = borderMuted;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(80, 80, 1040, 1440);

  // Decorative inner corner accents
  const cornerSize = 16;
  ctx.lineWidth = 2;
  // Top-left
  ctx.beginPath();
  ctx.moveTo(90, 90 + cornerSize);
  ctx.lineTo(90, 90);
  ctx.lineTo(90 + cornerSize, 90);
  ctx.stroke();
  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(1110, 1510 - cornerSize);
  ctx.lineTo(1110, 1510);
  ctx.lineTo(1110 - cornerSize, 1510);
  ctx.stroke();

  // Seal / Monogram Emblem on Contracapa
  ctx.save();
  ctx.textAlign = 'center';

  // Crest circle
  ctx.strokeStyle = foilHex;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(backCenterX, 680, 52, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = borderMuted;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(backCenterX, 680, 46, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = foilHex;
  ctx.font = 'bold 34px "Cinzel", "Playfair Display", serif';
  ctx.fillText('V7', backCenterX, 692);

  // Brand text below crest
  ctx.font = 'bold 22px "Cinzel", "Playfair Display", serif';
  ctx.fillStyle = foilHex;
  ctx.fillText('VILLA7 ÁLBUNS', backCenterX, 780);

  ctx.font = '13px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = subtextColor;
  ctx.fillText('ENCADERNAÇÃO ARTESANAL FINE ART • 180° FLAT-LAY', backCenterX, 815);

  // Discrete bottom production footnote
  ctx.font = '11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = subtextColor;
  ctx.fillText('Papel Silk Fotográfico 800g/m² • Laminação UV Térmica Anti-Digital', backCenterX, 1460);
  ctx.fillText('Ateliê Villa7 • Feito à mão com padrão museológico', backCenterX, 1485);
  ctx.restore();

  // =========================================================================
  // 2. LOMBADA (Spine - Center: 1200 to 1360 px, Width: 160 px / 2 cm)
  // =========================================================================
  const spineCenterX = 1280;
  const spineWidth = 160; // 2 cm exact at 80 px/cm

  // Crease fold guide lines (left and right of spine)
  ctx.strokeStyle = borderMuted;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(1200, 40);
  ctx.lineTo(1200, 1560);
  ctx.moveTo(1360, 40);
  ctx.lineTo(1360, 1560);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash

  // =========================================================================
  // 3. CAPA FRONTAL (Front Cover - Right side: 1360 to 2560 px, center at 1960 px)
  // =========================================================================
  const frontCenterX = 1960;

  // Frame on front cover
  ctx.strokeStyle = borderMuted;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1440, 80, 1040, 1440);

  // Front corner accents
  ctx.beginPath();
  ctx.moveTo(1450, 90 + cornerSize);
  ctx.lineTo(1450, 90);
  ctx.lineTo(1450 + cornerSize, 90);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(2470, 1510 - cornerSize);
  ctx.lineTo(2470, 1510);
  ctx.lineTo(2470 - cornerSize, 1510);
  ctx.stroke();

  // Front Header brand note
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = 'bold 12px "Cinzel", serif';
  ctx.fillStyle = foilHex;
  ctx.fillText('V I L L A 7   Á L B U N S', frontCenterX, 135);
  ctx.restore();

  // Load cover image if available
  let coverImg = loadedImages.get('cover-image');
  if (!coverImg && project.cover.imageUrl) {
    coverImg = await loadImage(project.cover.imageUrl);
    loadedImages.set('cover-image', coverImg);
  }
  if (!coverImg && project.cover.coverPhotos && project.cover.coverPhotos.length > 0) {
    const mainPhoto = project.cover.coverPhotos.find(p => p.isCoverMain) || project.cover.coverPhotos[0];
    if (mainPhoto?.url) {
      coverImg = loadedImages.get(mainPhoto.id) || (await loadImage(mainPhoto.url));
    }
  }

  if (coverImg) {
    ctx.save();
    const scale = Math.max(canvasWidth / coverImg.width, canvasHeight / coverImg.height);
    const sw = canvasWidth / scale;
    const sh = canvasHeight / scale;
    const sx = (coverImg.width - sw) / 2;
    const sy = (coverImg.height - sh) / 2;
    ctx.drawImage(coverImg, sx, sy, sw, sh, 0, 0, canvasWidth, canvasHeight);
    ctx.restore();
    return canvas;
  }

  // Front Cover Typography (Below photo: y = 1260 to 1480) - Matching official Villa7 reference
  ctx.save();
  ctx.textAlign = 'center';

  const frontTitle =
    project.cover.title ||
    project.clientData.albumTitle ||
    'Marcelo e Vitória';
  const frontSubtitle =
    project.cover.subtitle ||
    project.clientData.albumSubtitle ||
    project.clientData.eventDate ||
    'Uma história de amor';

  // 1. Hot Stamping Title
  ctx.font = 'bold 36px "Cinzel", "Playfair Display", serif';
  ctx.fillStyle = foilHex;
  ctx.fillText(frontTitle, frontCenterX, 1290);

  // 2. Subtitle in delicate italic serif
  ctx.font = 'italic 20px "Cormorant Garamond", "Playfair Display", serif';
  ctx.fillStyle = textColor;
  ctx.fillText(frontSubtitle, frontCenterX, 1335);

  // 3. Delicate Centered Floral Ornament Divider (— ❦ —)
  ctx.strokeStyle = foilHex;
  ctx.lineWidth = 1;
  // Left line
  ctx.beginPath();
  ctx.moveTo(frontCenterX - 90, 1368);
  ctx.lineTo(frontCenterX - 20, 1368);
  ctx.stroke();
  // Right line
  ctx.beginPath();
  ctx.moveTo(frontCenterX + 20, 1368);
  ctx.lineTo(frontCenterX + 90, 1368);
  ctx.stroke();
  // Center small diamond / leaf ornament
  ctx.fillStyle = foilHex;
  ctx.beginPath();
  ctx.arc(frontCenterX, 1368, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // 4. Official "by VILLA7" Signature Mark with Open Book Symbol
  // Small book icon
  const bookIconX = frontCenterX - 46;
  const bookIconY = 1405;
  ctx.strokeStyle = foilHex;
  ctx.lineWidth = 1.5;
  // Open book left page
  ctx.beginPath();
  ctx.moveTo(bookIconX, bookIconY - 4);
  ctx.quadraticCurveTo(bookIconX + 6, bookIconY - 6, bookIconX + 11, bookIconY - 4);
  ctx.lineTo(bookIconX + 11, bookIconY + 8);
  ctx.quadraticCurveTo(bookIconX + 6, bookIconY + 6, bookIconX, bookIconY + 8);
  ctx.closePath();
  ctx.stroke();
  // Open book right page
  ctx.beginPath();
  ctx.moveTo(bookIconX + 11, bookIconY - 4);
  ctx.quadraticCurveTo(bookIconX + 16, bookIconY - 6, bookIconX + 22, bookIconY - 4);
  ctx.lineTo(bookIconX + 22, bookIconY + 8);
  ctx.quadraticCurveTo(bookIconX + 16, bookIconY + 6, bookIconX + 11, bookIconY + 8);
  ctx.closePath();
  ctx.stroke();

  // "by VILLA7" text
  ctx.textAlign = 'left';
  ctx.font = 'bold 13px "Cinzel", "Playfair Display", serif';
  ctx.fillStyle = foilHex;
  ctx.fillText('by VILLA7', frontCenterX - 18, 1412);

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
    `• Tipo de Capa: Capa Fotográfica 15x20 Vertical (Zero Distorção)`,
    `• Miolo: Branco Puro (#FFFFFF) com Impressão Livre de Linhas`,
    `• Formato de Impressão: 1 Lâmina por Página A4 (297 x 210 mm)`,
    `• Total de Lâminas: ${project.spreadCount} lâminas duplas (${project.spreadCount * 2} páginas)`,
    `• Total de Fotos: ${project.photos.length} fotografias em alta resolução`,
    `• Abertura Panorâmica: 180° Flat-lay (Abertura Total sem perda na dobra)`,
    `• Proporção: Enquadramento fotográfico sem distorções ou estiramento`,
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
    { label: 'Telefone de Contato', value: project.clientData.phone || '(11) 99999-9999' },
    { label: 'Título do Álbum', value: project.clientData.albumTitle || 'Álbum de Memórias' },
    { 
      label: project.clientData.isOffMlSpecial ? 'Identificação do Pedido' : 'Pedido Mercado Livre', 
      value: project.clientData.isOffMlSpecial 
        ? (project.clientData.mercadoLivreOrderId && project.clientData.mercadoLivreOrderId !== 'OFF-ML-BRINDE-PRESENTE'
            ? `Pedido #${project.clientData.mercadoLivreOrderId} (Off-ML / Liberado com Senha Especial)`
            : 'Pedido Especial (Avulso / Brinde / Presente - Liberado com Senha)')
        : (project.clientData.mercadoLivreOrderId ? `Pedido #${project.clientData.mercadoLivreOrderId}` : 'Aguardando confirmação do Mercado Livre') 
    },
    { 
      label: 'Condição de Fabricação', 
      value: project.clientData.isOffMlSpecial
        ? 'Produção autorizada via senha exclusiva (Brinde/Presente/Off-ML)'
        : 'Produção vinculada e confirmada via Mercado Livre' 
    },
  ];

  clientInfo.forEach((item, idx) => {
    const y = 590 + idx * 75;
    ctx.font = 'bold 17px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#8C7A6B';
    ctx.fillText(item.label.toUpperCase(), rightCenterX - 370, y);

    ctx.font = '21px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#2C2420';
    ctx.fillText(item.value, rightCenterX - 370, y + 26);
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

// Compact helper to draw discrete registration marks and ultra-compact single-line metadata outside the image area on A4 landscape (297 x 210 mm)
function drawA4SheetGuides(
  pdf: jsPDF,
  pageNumber: number,
  totalPages: number,
  project: AlbumProject,
  pageLabel: string
) {
  const pageWidth = 297; // mm
  const pageHeight = 210; // mm
  const spreadW = 270; // mm (3:2 ratio: 270 x 180 mm)
  const spreadH = 180; // mm (3:2 ratio: 270 x 180 mm)
  const spreadX = (pageWidth - spreadW) / 2; // 13.5 mm (centered)
  const spreadY = (pageHeight - spreadH) / 2; // 15 mm (centered)

  const clientName = (project.clientData.name || 'Cliente').toUpperCase();
  const albumTitle = (project.cover.title || project.clientData.albumTitle || 'Álbum').toUpperCase();

  // Top spread compact metadata (small 6pt font, 1 single line at margin)
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(6);
  pdf.setTextColor(110, 95, 85);
  pdf.text(
    `VILLA7 • 15x20 VERTICAL (ABERTO 20x30 CM) • PÁG ${pageNumber}/${totalPages} • ${pageLabel} • ${clientName} — ${albumTitle}`,
    spreadX,
    spreadY - 3.5
  );

  // Crop marks at 4 corners (outside the spread area)
  const markLen = 3.5;
  pdf.setDrawColor(160, 140, 120);
  pdf.setLineWidth(0.2);

  // Top-left
  pdf.line(spreadX - markLen, spreadY, spreadX, spreadY);
  pdf.line(spreadX, spreadY - markLen, spreadX, spreadY);
  // Top-right
  pdf.line(spreadX + spreadW, spreadY, spreadX + spreadW + markLen, spreadY);
  pdf.line(spreadX + spreadW, spreadY - markLen, spreadX + spreadW, spreadY);
  // Bottom-left
  pdf.line(spreadX - markLen, spreadY + spreadH, spreadX, spreadY + spreadH);
  pdf.line(spreadX, spreadY + spreadH, spreadX, spreadY + spreadH + markLen);
  // Bottom-right
  pdf.line(spreadX + spreadW, spreadY + spreadH, spreadX + spreadW + markLen, spreadY + spreadH);
  pdf.line(spreadX + spreadW, spreadY + spreadH, spreadX + spreadW + markLen, spreadY + spreadH);

  // Fold marks at center (x = 148.5 mm, outside the spread)
  pdf.line(pageWidth / 2, spreadY - 3, pageWidth / 2, spreadY);
  pdf.line(pageWidth / 2, spreadY + spreadH, pageWidth / 2, spreadY + spreadH + 3);

  // Footer CMYK Color Calibration Bars at bottom margin of A4 sheet (Y = 202 mm)
  const colorBarY = 201.5;
  const swatchW = 5;
  const swatchH = 2.5;
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
    pdf.rect(spreadX + idx * (swatchW + 1.2), colorBarY, swatchW, swatchH, 'F');
  });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5);
  pdf.setTextColor(150, 130, 110);
  pdf.text(
    `VILLA7 FOTOGRAFIA • 1 LÂMINA POR PÁGINA A4 (297x210 MM) • 300 DPI FINE ART • MIOLO BRANCO SEM LINHAS`,
    spreadX + colors.length * (swatchW + 1.2) + 4,
    colorBarY + 2
  );
}

// Primary Export Function: Generates the A4 High Quality PDF (1 spread 20x30 cm per A4 page)
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

  if (project.cover.coverPhotos && project.cover.coverPhotos.length > 0) {
    project.cover.coverPhotos.forEach((p) => {
      if (p.url) {
        loadPromises.push(
          loadImage(p.url).then((img) => {
            loadedImages.set(p.id, img);
            if (p.isCoverMain || !loadedImages.has('cover-image')) {
              loadedImages.set('cover-image', img);
            }
          })
        );
      }
    });
  }

  await Promise.all(loadPromises);

  const spreadW = 270; // mm (3:2 ratio on A4 landscape: 270 x 180 mm)
  const spreadH = 180; // mm
  const spreadX = (297 - spreadW) / 2; // 13.5 mm (centered)
  const spreadY = (210 - spreadH) / 2; // 15 mm (centered)

  onProgress?.({ step: 'Configurando formato A4 de alta qualidade (1 Lâmina 20x30 cm por Página)...', percent: 25 });

  // Initialize jsPDF in A4 landscape format (297 mm x 210 mm)
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // Sanitize spreads so that only spreads containing sent photos are rendered, and all slots in each spread are populated
  const validSpreads = project.photos.length > 0
    ? sanitizeSpreads(project.spreads, project.photos)
    : project.spreads.filter((s) => s.slots.some((slot) => slot.photoId));

  const activeSpreads = validSpreads.length > 0 ? validSpreads : project.spreads;
  const totalSpreads = activeSpreads.length;
  const totalPages = 2 + totalSpreads + 1;
  let currentPage = 1;

  // =========================================================================
  // PAGE 1: Arte Horizontal da Capa Dura (Contracapa + Lombada 2x6 cm + Capa 15x20 cm)
  // =========================================================================
  onProgress?.({
    step: 'Renderizando Arte Horizontal da Capa Dura (Contracapa + Lombada 2x6 cm + Capa Frontal)...',
    percent: 35,
  });

  const coverCanvas = await renderCoverToCanvas(project, loadedImages);
  const coverData = coverCanvas.toDataURL('image/jpeg', 0.96);
  // Cover canvas is 2560x1600 px (32x20 cm ratio: 1.6)
  const coverSpreadW = 270;
  const coverSpreadH = (270 * 1600) / 2560; // 168.75 mm
  const coverSpreadX = (297 - coverSpreadW) / 2;
  const coverSpreadY = (210 - coverSpreadH) / 2;
  pdf.addImage(coverData, 'JPEG', coverSpreadX, coverSpreadY, coverSpreadW, coverSpreadH, undefined, 'FAST');

  drawA4SheetGuides(
    pdf,
    currentPage,
    totalPages,
    project,
    'ARTE HORIZONTAL DE CAPA DURA (CONTRACAPA + LOMBADA COM TEXTO 2x6 CM + CAPA 15x20 CM)'
  );

  // =========================================================================
  // PAGE 2: Certificado de Produção & Homologação Técnica
  // =========================================================================
  currentPage++;
  pdf.addPage('a4', 'landscape');
  onProgress?.({ step: 'Renderizando Certificado de Homologação Técnica (Página 2 A4)...', percent: 45 });

  const certCanvas = renderCertificateToCanvas(project);
  const certData = certCanvas.toDataURL('image/jpeg', 0.96);
  pdf.addImage(certData, 'JPEG', spreadX, spreadY, spreadW, spreadH, undefined, 'FAST');

  drawA4SheetGuides(
    pdf,
    currentPage,
    totalPages,
    project,
    'CERTIFICADO DE PRODUÇÃO & ESPECIFICAÇÕES TÉCNICAS'
  );

  // =========================================================================
  // PAGES 3 to N+2: 1 Lâmina (20x30 cm) por Página A4
  // =========================================================================
  for (let spreadIdx = 0; spreadIdx < totalSpreads; spreadIdx++) {
    currentPage++;
    pdf.addPage('a4', 'landscape');

    const progressPercent = Math.round(45 + ((spreadIdx + 1) / totalSpreads) * 45);
    onProgress?.({
      step: `Renderizando Lâmina ${spreadIdx + 1} de ${totalSpreads} (Págs ${spreadIdx * 2 + 1}-${spreadIdx * 2 + 2}) em página A4 dedicada...`,
      percent: progressPercent,
    });

    const spread = activeSpreads[spreadIdx];
    const canvas = await renderSpreadToCanvas(spread, photosMap, loadedImages, project, spreadIdx);
    const data = canvas.toDataURL('image/jpeg', 0.96);
    pdf.addImage(data, 'JPEG', spreadX, spreadY, spreadW, spreadH, undefined, 'FAST');

    const spreadLabel = `LÂMINA ${spreadIdx + 1} DE ${totalSpreads} (PÁGINAS ${spreadIdx * 2 + 1}-${spreadIdx * 2 + 2})`;
    drawA4SheetGuides(pdf, currentPage, totalPages, project, spreadLabel);
  }

  // =========================================================================
  // FINAL PAGE: Controle de Qualidade Gráfica & Fechamento
  // =========================================================================
  currentPage++;
  pdf.addPage('a4', 'landscape');
  onProgress?.({ step: 'Renderizando Controle de Qualidade Gráfica (Página Final A4)...', percent: 95 });

  const qualityCanvas = renderQualityControlToCanvas(project);
  const qualityData = qualityCanvas.toDataURL('image/jpeg', 0.96);
  pdf.addImage(qualityData, 'JPEG', spreadX, spreadY, spreadW, spreadH, undefined, 'FAST');

  drawA4SheetGuides(
    pdf,
    currentPage,
    totalPages,
    project,
    'CONTROLE DE QUALIDADE GRÁFICA & FECHAMENTO'
  );

  onProgress?.({ step: 'Finalizando arquivo PDF A4 de alta resolução para impressão...', percent: 98 });

  const fileName = generateUniqueAlbumFileName(project);

  const blob = pdf.output('blob');
  const dataUri = pdf.output('datauristring');

  onProgress?.({ step: 'PDF A4 de Alta Qualidade gerado com sucesso!', percent: 100 });

  return { blob, fileName, dataUri };
}
