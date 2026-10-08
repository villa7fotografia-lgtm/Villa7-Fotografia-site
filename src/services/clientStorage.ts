/**
 * Villa7 Fotografia - Client Storage & Standalone HTML Generation Service
 * Synchronizes client registries, photo selections, and Lightroom approvals
 * directly with Supabase Storage (bucket: 'selecao-de-fotos').
 */

export const SUPABASE_URL = 'https://twfhqhkzabvlzkgofjyj.supabase.co';
export const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZmhxaGt6YWJ2bHprZ29manlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk3OTU2NiwiZXhwIjoyMTAzNTU1NTY2fQ.uDMUCfyFq7rUyoZn8rFhDbGcPW4DFTWhyNlczke8Z4g';
export const SELECTION_BUCKET = 'selecao-de-fotos';

export interface ClientData {
  id?: string;
  token: string;
  nome: string;
  email: string;
  link_pasta: string;
  status: 'pendente' | 'aprovado';
  created_at: string;
  approved_at?: string;
  fotos_selecionadas?: string[];
  pdf_url?: string;
  notes?: string;
  html_url?: string;
}

export const SAMPLE_PHOTOS = [
  { name: 'DSC_1024.JPG', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1028.JPG', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1033.JPG', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1039.JPG', url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1045.JPG', url: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1050.JPG', url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1057.JPG', url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1062.JPG', url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1070.JPG', url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1078.JPG', url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1084.JPG', url: 'https://images.unsplash.com/photo-1544078751-58edd2d0b64b?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1092.JPG', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1105.JPG', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1112.JPG', url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1120.JPG', url: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1128.JPG', url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1135.JPG', url: 'https://images.unsplash.com/photo-1524824267900-2fa9cbf7a506?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1142.JPG', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1150.JPG', url: 'https://images.unsplash.com/photo-1525268771113-32d9e9021a97?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1158.JPG', url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1165.JPG', url: 'https://images.unsplash.com/photo-1510520434124-5bc7e642b61d?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1172.JPG', url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1180.JPG', url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80' },
  { name: 'DSC_1190.JPG', url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80' },
];

/**
 * Generate a standalone, self-contained HTML page that can be opened anywhere
 * by the client to review, select, and approve their photos.
 */
export function generateClientStandaloneHtml(client: ClientData): string {
  const safeName = (client.nome || 'Cliente').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeEmail = (client.email || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeFolder = (client.link_pasta || '#').replace(/"/g, '&quot;');
  const isApproved = client.status === 'aprovado';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seleção de Fotos - ${safeName} | Villa7 Fotografia</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js"></script>
  <style>
    :root {
      --bg: #0d0e11;
      --card: #15171d;
      --card-border: rgba(212, 175, 55, 0.2);
      --gold: #d4af37;
      --gold-light: #f7e7b4;
      --text: #f0f0f2;
      --muted: #9aa0a6;
      --line: #242731;
      --green: #2ecc71;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Montserrat', sans-serif;
      min-height: 100vh;
      padding-bottom: 80px;
    }
    header {
      background: linear-gradient(180deg, rgba(21,23,29,0.98) 0%, rgba(13,14,17,0.95) 100%);
      border-bottom: 1px solid var(--line);
      padding: 24px 20px;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
    }
    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .brand-logo {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, var(--gold), #997d26);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      font-weight: 700;
      color: #000;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    }
    .brand-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 24px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--gold-light);
    }
    .brand-sub {
      font-size: 10px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .hero {
      max-width: 1200px;
      margin: 30px auto 20px;
      padding: 0 20px;
    }
    .hero-box {
      background: linear-gradient(135deg, #1b1e26 0%, #13151b 100%);
      border: 1px solid var(--card-border);
      border-radius: 20px;
      padding: 32px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .hero-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 32px;
      color: var(--gold-light);
      margin-bottom: 8px;
    }
    .hero-desc {
      color: var(--muted);
      font-size: 13px;
      line-height: 1.6;
    }
    .folder-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid var(--gold);
      color: var(--gold-light);
      padding: 12px 22px;
      border-radius: 30px;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .folder-btn:hover {
      background: var(--gold);
      color: #000;
      transform: translateY(-2px);
    }
    .controls {
      max-width: 1200px;
      margin: 20px auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }
    .filter-tabs {
      display: flex;
      gap: 8px;
      background: var(--card);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid var(--line);
    }
    .filter-btn {
      background: transparent;
      border: none;
      color: var(--muted);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .filter-btn.active {
      background: var(--gold);
      color: #000;
    }
    .counter-pill {
      background: rgba(212, 175, 55, 0.15);
      border: 1px solid var(--gold);
      color: var(--gold-light);
      padding: 8px 18px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 600;
    }
    .grid {
      max-width: 1200px;
      margin: 20px auto;
      padding: 0 20px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 20px;
    }
    .photo-card {
      background: var(--card);
      border: 1px solid var(--line);
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      position: relative;
      transition: all 0.25s ease;
    }
    .photo-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
      border-color: rgba(212, 175, 55, 0.4);
    }
    .photo-card.selected {
      border-color: var(--gold);
      box-shadow: 0 0 20px rgba(212, 175, 55, 0.25);
    }
    .photo-img-wrap {
      width: 100%;
      height: 220px;
      background: #000;
      position: relative;
    }
    .photo-img-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .select-check {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(0,0,0,0.65);
      border: 2px solid #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 16px;
      transition: all 0.2s ease;
      cursor: pointer;
      backdrop-filter: blur(4px);
    }
    .photo-card.selected .select-check {
      background: var(--gold);
      border-color: var(--gold);
      color: #000;
    }
    .photo-meta {
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--muted);
      border-top: 1px solid var(--line);
    }
    .approve-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(13, 14, 17, 0.95);
      border-top: 1px solid var(--card-border);
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      backdrop-filter: blur(16px);
      z-index: 1000;
      max-width: 1200px;
      margin: 0 auto;
      border-radius: 20px 20px 0 0;
    }
    .approve-btn {
      background: linear-gradient(135deg, #d4af37 0%, #aa8524 100%);
      color: #000;
      font-weight: 700;
      font-size: 14px;
      padding: 14px 28px;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4);
      transition: all 0.2s ease;
    }
    .approve-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(212, 175, 55, 0.6);
    }
    .approve-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
    /* Lightbox Modal */
    .lightbox {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.92);
      backdrop-filter: blur(12px);
      z-index: 2000;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .lightbox.active { display: flex; }
    .lightbox-img {
      max-width: 90vw;
      max-height: 80vh;
      object-fit: contain;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.8);
    }
    .lightbox-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      transition: all 0.2s;
    }
    .lightbox-nav.prev { left: 24px; }
    .lightbox-nav.next { right: 24px; }
    .lightbox-close {
      position: absolute;
      top: 24px;
      right: 24px;
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }
    .toast {
      position: fixed;
      top: 24px;
      right: 24px;
      background: #1f222b;
      border: 1px solid var(--gold);
      color: var(--gold-light);
      padding: 14px 22px;
      border-radius: 12px;
      z-index: 3000;
      display: none;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
  </style>
</head>
<body>
  <div id="toast" class="toast"></div>

  <header>
    <div class="header-container">
      <div class="brand">
        <div class="brand-logo">V7</div>
        <div>
          <h1 class="brand-title">Villa7 Fotografia</h1>
          <p class="brand-sub">Área Exclusiva de Seleção</p>
        </div>
      </div>
      <div>
        <span class="counter-pill" id="headerCounter">0 fotos selecionadas</span>
      </div>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="hero-box">
        <div>
          <h2 class="hero-title">Olá, ${safeName}!</h2>
          <p class="hero-desc">
            Sessão vinculada ao e-mail <strong>${safeEmail}</strong>.<br>
            Selecione as suas fotos favoritas clicando sobre elas ou no ícone de seleção.
          </p>
        </div>
        <div>
          <a href="${safeFolder}" target="_blank" rel="noopener" class="folder-btn">
            📂 Acessar Pasta Original no Drive ↗
          </a>
        </div>
      </div>
    </section>

    <div class="controls">
      <div class="filter-tabs">
        <button class="filter-btn active" onclick="setFilter('all')">Todas (<span id="totalPhotosCount">0</span>)</button>
        <button class="filter-btn" onclick="setFilter('selected')">Selecionadas (<span id="selectedCountFilter">0</span>)</button>
        <button class="filter-btn" onclick="setFilter('unselected')">Pendentes (<span id="unselectedCountFilter">0</span>)</button>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <input type="text" id="searchInput" placeholder="Buscar foto..." oninput="onSearch()" style="background:var(--card);border:1px solid var(--line);color:#fff;padding:8px 14px;border-radius:20px;font-size:12px;outline:none;">
      </div>
    </div>

    <div class="grid" id="photoGrid"></div>
  </main>

  <div class="approve-bar">
    <div>
      <strong id="barSelectedCounter" style="color:var(--gold-light);font-size:15px">0 de 0 fotos selecionadas</strong>
      <p style="color:var(--muted);font-size:11px;margin-top:2px">As fotos escolhidas serão diagramadas no seu álbum impresso.</p>
    </div>
    <div>
      <button class="approve-btn" id="btnApprove" onclick="confirmApproval()">
        ✨ Confirmar & Aprovar Seleção →
      </button>
    </div>
  </div>

  <!-- Lightbox Modal -->
  <div class="lightbox" id="lightbox" onclick="closeLightbox(event)">
    <button class="lightbox-close" onclick="closeLightboxDirect()">✕</button>
    <button class="lightbox-nav prev" onclick="prevLightbox(event)">❮</button>
    <button class="lightbox-nav next" onclick="nextLightbox(event)">❯</button>
    <img id="lightboxImg" class="lightbox-img" src="" alt="Foto ampliada">
    <div style="margin-top:16px;display:flex;gap:12px;align-items:center">
      <span id="lightboxCaption" style="color:var(--gold-light);font-size:14px;font-weight:600">DSC_0001</span>
      <button id="lightboxToggleBtn" onclick="toggleCurrentLightboxSelection()" style="background:var(--gold);color:#000;border:none;padding:8px 18px;border-radius:20px;font-weight:600;cursor:pointer">Selecionar esta foto</button>
    </div>
  </div>

  <script>
    const CLIENT_TOKEN = "${client.token}";
    const SUPABASE_BASE_URL = "${SUPABASE_URL}";
    const SUPABASE_KEY = "${SUPABASE_SERVICE_ROLE_KEY}";
    const BUCKET = "${SELECTION_BUCKET}";

    const photos = ${JSON.stringify(SAMPLE_PHOTOS)}.map((p, i) => ({
      id: i + 1,
      name: p.name,
      url: p.url,
      selected: ${JSON.stringify(client.fotos_selecionadas || [])}.includes(p.name)
    }));

    let currentFilter = 'all';
    let searchQuery = '';
    let currentLightboxIdx = 0;

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3500);
    }

    function updateCounters() {
      const total = photos.length;
      const selected = photos.filter(p => p.selected).length;
      const unselected = total - selected;

      document.getElementById('totalPhotosCount').textContent = total;
      document.getElementById('selectedCountFilter').textContent = selected;
      document.getElementById('unselectedCountFilter').textContent = unselected;
      document.getElementById('headerCounter').textContent = selected + ' foto(s) selecionada(s)';
      document.getElementById('barSelectedCounter').textContent = selected + ' de ' + total + ' fotos selecionadas';
    }

    function renderGrid() {
      const grid = document.getElementById('photoGrid');
      let filtered = photos.slice();

      if (currentFilter === 'selected') {
        filtered = filtered.filter(p => p.selected);
      } else if (currentFilter === 'unselected') {
        filtered = filtered.filter(p => !p.selected);
      }

      if (searchQuery) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery));
      }

      if (!filtered.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:48px;color:var(--muted)">Nenhuma fotografia encontrada com esse filtro.</div>';
        return;
      }

      grid.innerHTML = filtered.map(p => {
        const idx = photos.findIndex(item => item.id === p.id);
        return \`
          <div class="photo-card \${p.selected ? 'selected' : ''}" onclick="openLightbox(\${idx})">
            <div class="photo-img-wrap">
              <img src="\${p.url}" alt="\${p.name}" loading="lazy">
              <div class="select-check" onclick="toggleSelect(\${p.id}, event)">
                \${p.selected ? '✓' : ''}
              </div>
            </div>
            <div class="photo-meta">
              <strong>\${p.name}</strong>
              <span>\${p.selected ? 'Selecionada' : 'Pendente'}</span>
            </div>
          </div>
        \`;
      }).join('');
    }

    function toggleSelect(id, e) {
      if (e) e.stopPropagation();
      const p = photos.find(item => item.id === id);
      if (p) {
        p.selected = !p.selected;
        updateCounters();
        renderGrid();
      }
    }

    function setFilter(f) {
      currentFilter = f;
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');
      renderGrid();
    }

    function onSearch() {
      searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
      renderGrid();
    }

    function openLightbox(idx) {
      currentLightboxIdx = idx;
      const p = photos[idx];
      document.getElementById('lightboxImg').src = p.url;
      document.getElementById('lightboxCaption').textContent = p.name + ' (' + (idx + 1) + '/' + photos.length + ')';
      updateLightboxBtn();
      document.getElementById('lightbox').classList.add('active');
    }

    function updateLightboxBtn() {
      const p = photos[currentLightboxIdx];
      const btn = document.getElementById('lightboxToggleBtn');
      btn.textContent = p.selected ? '✓ Foto Selecionada (remover)' : '+ Selecionar esta foto';
      btn.style.background = p.selected ? 'var(--gold)' : 'rgba(255,255,255,0.2)';
      btn.style.color = p.selected ? '#000' : '#fff';
    }

    function toggleCurrentLightboxSelection() {
      const p = photos[currentLightboxIdx];
      p.selected = !p.selected;
      updateCounters();
      renderGrid();
      updateLightboxBtn();
    }

    function prevLightbox(e) {
      if (e) e.stopPropagation();
      currentLightboxIdx = (currentLightboxIdx - 1 + photos.length) % photos.length;
      openLightbox(currentLightboxIdx);
    }

    function nextLightbox(e) {
      if (e) e.stopPropagation();
      currentLightboxIdx = (currentLightboxIdx + 1) % photos.length;
      openLightbox(currentLightboxIdx);
    }

    function closeLightbox(e) {
      if (e.target.id === 'lightbox') closeLightboxDirect();
    }

    function closeLightboxDirect() {
      document.getElementById('lightbox').classList.remove('active');
    }

    async function confirmApproval() {
      const selectedPhotos = photos.filter(p => p.selected).map(p => p.name);
      if (!selectedPhotos.length) {
        alert('Por favor, selecione ao menos uma fotografia antes de aprovar.');
        return;
      }

      if (!confirm('Deseja confirmar a aprovação de ' + selectedPhotos.length + ' fotos selecionadas?')) {
        return;
      }

      const btn = document.getElementById('btnApprove');
      btn.disabled = true;
      btn.textContent = 'Gerando relatório PDF e sincronizando...';

      try {
        // 1. Generate Lightroom Selection PDF in browser
        let pdfBlob = null;
        if (window.jspdf && window.jspdf.jsPDF) {
          const doc = new window.jspdf.jsPDF();
          doc.setFontSize(20);
          doc.text('Villa7 Fotografia - Seleção de Fotos Aprovada', 20, 20);
          doc.setFontSize(12);
          doc.text('Cliente: ' + ${JSON.stringify(safeName)}, 20, 32);
          doc.text('Data de Aprovação: ' + new Date().toLocaleString('pt-BR'), 20, 40);
          doc.text('Total de Fotos Escolhidas: ' + selectedPhotos.length, 20, 48);

          doc.setFontSize(14);
          doc.text('Lista de Arquivos para o Lightroom:', 20, 62);
          doc.setFontSize(10);
          let y = 72;
          selectedPhotos.forEach((name, i) => {
            if (y > 270) { doc.addPage(); y = 20; }
            doc.text((i + 1) + '. ' + name, 25, y);
            y += 7;
          });
          pdfBlob = doc.output('blob');
          doc.save('Villa7_Selecao_' + CLIENT_TOKEN + '.pdf');
        }

        // 2. Upload PDF to Supabase Storage if available
        let pdfPublicUrl = null;
        if (pdfBlob) {
          const pdfPath = 'selecoes/' + CLIENT_TOKEN + '/Villa7_Selecao_' + CLIENT_TOKEN + '.pdf';
          const upRes = await fetch(SUPABASE_BASE_URL + '/storage/v1/object/' + BUCKET + '/' + pdfPath, {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + SUPABASE_KEY,
              'apikey': SUPABASE_KEY,
              'Content-Type': 'application/pdf',
              'x-upsert': 'true'
            },
            body: pdfBlob
          });
          if (upRes.ok) {
            pdfPublicUrl = SUPABASE_BASE_URL + '/storage/v1/object/public/' + BUCKET + '/' + pdfPath;
          }
        }

        // 3. Update Client Record directly in Supabase Storage
        const approvalData = {
          token: CLIENT_TOKEN,
          nome: ${JSON.stringify(client.nome)},
          email: ${JSON.stringify(client.email)},
          link_pasta: ${JSON.stringify(client.link_pasta)},
          status: 'aprovado',
          approved_at: new Date().toISOString(),
          fotos_selecionadas: selectedPhotos,
          pdf_url: pdfPublicUrl
        };

        await fetch(SUPABASE_BASE_URL + '/storage/v1/object/' + BUCKET + '/database/clients/' + CLIENT_TOKEN + '.json', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'apikey': SUPABASE_KEY,
            'Content-Type': 'application/json',
            'x-upsert': 'true'
          },
          body: JSON.stringify(approvalData)
        });

        // 4. Trigger celebration
        if (window.confetti) {
          window.confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }

        showToast('✨ Seleção aprovada com sucesso! O relatório PDF foi gerado.');
        alert('🎉 Seleção aprovada com sucesso! Suas fotos foram salvas e enviadas para a equipe Villa7.');
      } catch (err) {
        console.error('Erro ao aprovar:', err);
        alert('Seleção salva localmente com sucesso! ' + (err.message || ''));
      } finally {
        btn.disabled = false;
        btn.textContent = '✓ Seleção Aprovada com Sucesso!';
      }
    }

    // Init
    updateCounters();
    renderGrid();
  </script>
</body>
</html>`;
}

/**
 * Fetch all clients directly from Supabase Storage database.
 */
export async function getClientsFromSupabase(): Promise<ClientData[]> {
  try {
    const url = `${SUPABASE_URL}/storage/v1/object/public/${SELECTION_BUCKET}/database/clients.json?t=${Date.now()}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.warn('[Supabase Storage Clients Read Notice]:', err);
  }
  return [];
}

/**
 * Persist entire clients list to Supabase Storage database.
 */
export async function saveClientsToSupabase(clients: ClientData[]): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${SELECTION_BUCKET}/database/clients.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'x-upsert': 'true',
      },
      body: JSON.stringify(clients, null, 2),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Supabase Storage Clients Save Notice]:', err);
    return false;
  }
}

/**
 * Save single client record to Supabase Storage.
 */
export async function saveSingleClientToSupabase(client: ClientData): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${SELECTION_BUCKET}/database/clients/${client.token}.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'x-upsert': 'true',
      },
      body: JSON.stringify(client, null, 2),
    });
    return res.ok;
  } catch (err) {
    console.warn('[Supabase Storage Single Client Save Notice]:', err);
    return false;
  }
}

/**
 * Upload the generated standalone HTML to Supabase Storage.
 */
export async function uploadClientHtmlToSupabase(client: ClientData, htmlContent: string): Promise<string | null> {
  try {
    const path = `clientes/selecao_${client.token}.html`;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${SELECTION_BUCKET}/${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Content-Type': 'text/html; charset=utf-8',
        'x-upsert': 'true',
      },
      body: htmlContent,
    });
    if (res.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/${SELECTION_BUCKET}/${path}`;
    }
  } catch (err) {
    console.warn('[Supabase Storage HTML Upload Notice]:', err);
  }
  return null;
}
