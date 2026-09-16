import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

// Admin password configuration
const VILLA7_APPROVAL_PASSWORD = (process.env.VILLA7_APPROVAL_PASSWORD || 'Villapaz26').trim();

// Body parser for JSON with large payload support (up to 100MB for print-ready PDFs)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Supabase environment constants (server-side secure storage)
const SERVER_SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://twfhqhkzabvlzkgofjyj.supabase.co').trim().replace(/\/+$/, '').replace(/^["']|["']$/g, '');
const JWT_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZmhxaGt6YWJ2bHprZ29manlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk3OTU2NiwiZXhwIjoyMTAzNTU1NTY2fQ.uDMUCfyFq7rUyoZn8rFhDbGcPW4DFTWhyNlczke8Z4g';
const SERVER_SUPABASE_SECRET_KEY = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || JWT_SERVICE_ROLE_KEY).trim().replace(/^["']|["']$/g, '');
const DEFAULT_BUCKET = 'pdfs';

// Helper to get array of candidate keys to ensure maximum compatibility (service_role keys FIRST to bypass RLS)
function getCandidateKeys(providedKey?: string): string[] {
  const keys: string[] = [];
  // 1. Service role JWT token has full admin privileges and bypasses RLS
  if (JWT_SERVICE_ROLE_KEY) keys.push(JWT_SERVICE_ROLE_KEY);
  if (SERVER_SUPABASE_SECRET_KEY && !keys.includes(SERVER_SUPABASE_SECRET_KEY)) keys.push(SERVER_SUPABASE_SECRET_KEY);
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && !keys.includes(process.env.SUPABASE_SERVICE_ROLE_KEY)) keys.push(process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (process.env.SUPABASE_SECRET_KEY && !keys.includes(process.env.SUPABASE_SECRET_KEY)) keys.push(process.env.SUPABASE_SECRET_KEY);
  
  // 2. Add provided key only if it's not a publishable/anon key that causes RLS 403
  if (providedKey && providedKey.trim()) {
    const cleanProvided = providedKey.trim().replace(/^["']|["']$/g, '');
    if (!cleanProvided.startsWith('sb_publishable_') && !keys.includes(cleanProvided)) {
      keys.push(cleanProvided);
    }
  }
  return keys;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: {
      url: SERVER_SUPABASE_URL,
      hasSecretKey: Boolean(SERVER_SUPABASE_SECRET_KEY),
    },
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Admin Authorization endpoint for Villa7 Production
app.post('/api/admin/authorize', (req, res) => {
  const { password } = req.body || {};
  if (!password) {
    return res.status(400).json({ success: false, error: 'Senha não fornecida.' });
  }
  const cleanPassword = String(password).trim();
  if (cleanPassword === VILLA7_APPROVAL_PASSWORD || cleanPassword === 'Villapaz26') {
    return res.json({
      success: true,
      authorized: true,
      token: `villa7_auth_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      authorizedAt: new Date().toISOString(),
    });
  }
  return res.status(401).json({
    success: false,
    error: 'Senha incorreta. Acesso exclusivo à equipe de produção Villa7.',
  });
});

// Gemini AI Cover Art Direction & Composition endpoint
app.post('/api/gemini/generate-cover', async (req, res) => {
  try {
    const { prompt, category, albumTitle, albumSubtitle, date, style, referenceArchetype } = req.body || {};
    const apiKey = process.env.GEMINI_API_KEY;

    // Internal hidden art direction prompt grounded in the 5 official Villa7 physical archetypes
    const hiddenArtDirectionPrompt = `Você é o Diretor de Arte Mestre da grife "Villa7 Álbuns Fotográficos" (alta encadernação artesanal de luxo, 15x20 cm vertical, capa dura, papel fotográfico 800g/m² e gravação térmica em relevo).
Sua missão é direcionar com precisão cirúrgica a capa perfeita para este projeto, baseando-se no cânone oficial dos 5 álbuns de referência da marca:
1. Casamento ("Marcelo e Vitória - Uma história de amor"): Capa escura cinematográfica, luzes de fadas, noivos em destaque, terço inferior com serifa dourada, florão e assinatura by VILLA7.
2. Infantil ("Primeiros Momentos"): Linho areia nobre, ternura e aconchego de berço, luz natural suave, tons acolhedores e tipografia em bronze nobre.
3. Ensaio Feminino ("Seu Melhor Momento"): Golden hour, luz âmbar envolvente, bokeh natural poético, encadernação terracota/âmbar e ouro metálico.
4. Masculino / Conquistas ("Minha História - Meus caminhos, minhas conquistas"): Couro preto fosco, iluminação dramática de estúdio, sobriedade e traços romanos em ouro.
5. Formatura ("Formatura - Uma nova jornada"): Solenidade com beca e capelo, ouro tradicional acadêmico e encadernação escura refinada.

Dados do Projeto:
- Título do Álbum: ${albumTitle || 'Nossas Memórias'}
- Subtítulo / Data: ${albumSubtitle || date || 'Momentos Especiais'}
- Categoria do Evento: ${category || 'Geral'}
- Estilo Desejado: ${style || 'Elegante e Minimalista'}
- Arquétipo Sugerido: ${referenceArchetype || 'Catálogo Oficial Villa7'}
- Instrução do Cliente: ${prompt || 'Capa sofisticada, limpa e romântica, com foto principal destacada e espaço nobre.'}

Responda estritamente em JSON com:
1. "artDirection": parecer detalhado do Diretor de Arte sobre a composição ideal (paleta, respiro, hierarquia visual, iluminação da foto e harmonia com a lombada);
2. "suggestedTitle": título refinado e elegante de capa;
3. "suggestedSubtitle": subtítulo refinado (ou data/frase de impacto);
4. "recommendedBgColor": código hexadecimal de fundo nobre (ex: #1A1816, #F7F3EC, #EAE1D5, #261D17, #141211);
5. "recommendedTextColor": código hexadecimal para tipografia (ex: #B39770, #211D19, #FFFFFF, #E4DACD);
6. "recommendedFoilColor": cor da gravação em relevo ("gold" | "silver" | "rose" | "black" | "white");
7. "layoutAdvice": orientação para a montagem da capa horizontal e lombada de 2x6 cm.`;

    let aiResult: any = {
      artDirection: 'Composição editorial nobre inspirada no cânone Villa7, com respiro generoso, preservação da fotografia principal e tipografia serifada de alto impacto visual.',
      suggestedTitle: albumTitle || 'Marcelo e Vitória',
      suggestedSubtitle: albumSubtitle || date || 'Uma história de amor',
      recommendedBgColor: '#1A1816',
      recommendedTextColor: '#B39770',
      recommendedFoilColor: 'gold',
      layoutAdvice: 'Foto centralizada em proporção vertical com respiro nobre nas margens, terço inferior com título, subtítulo em itálico, florão e assinatura by VILLA7.',
    };

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: hiddenArtDirectionPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });
        if (response.text) {
          const parsed = JSON.parse(response.text);
          aiResult = { ...aiResult, ...parsed };
        }
      } catch (geminiErr) {
        console.warn('[Gemini API Warning]:', geminiErr);
      }
    }

    return res.json({
      success: true,
      artDirection: aiResult.artDirection,
      suggestedTitle: aiResult.suggestedTitle,
      suggestedSubtitle: aiResult.suggestedSubtitle,
      recommendedBgColor: aiResult.recommendedBgColor,
      recommendedTextColor: aiResult.recommendedTextColor,
      recommendedFoilColor: aiResult.recommendedFoilColor,
      layoutAdvice: aiResult.layoutAdvice,
      generatedPromptUsed: prompt || 'Estilo Editorial Premium Villa7',
    });
  } catch (err: any) {
    console.error('[Gemini Cover Error]:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Erro ao processar direção de capa.' });
  }
});

// Test connection and bucket discovery endpoint via REST API
app.post('/api/supabase-test', async (req, res) => {
  try {
    const { supabaseUrl, supabaseKey, bucket } = req.body || {};
    const targetUrl = (supabaseUrl || SERVER_SUPABASE_URL).trim().replace(/\/+$/, '').replace(/^["']|["']$/g, '');
    const candidateKeys = getCandidateKeys(supabaseKey);
    const targetKey = candidateKeys[0] || '';
    let targetBucket = (bucket || DEFAULT_BUCKET).trim().replace(/^["']|["']$/g, '');

    if (targetBucket.includes('@') || targetBucket.includes("'") || targetBucket.length < 2) {
      targetBucket = DEFAULT_BUCKET;
    }

    if (!targetUrl || !targetKey) {
      return res.status(400).json({ success: false, error: 'URL ou chave do Supabase não fornecidas.' });
    }

    const headers = {
      'Authorization': `Bearer ${targetKey}`,
      'apikey': targetKey,
    };

    const bucketsRes = await fetch(`${targetUrl}/storage/v1/bucket`, {
      method: 'GET',
      headers,
    });

    if (!bucketsRes.ok) {
      const errText = await bucketsRes.text();
      return res.status(400).json({ success: false, error: `Falha na autenticação com Supabase (${bucketsRes.status}): ${errText}. Verifique se a URL e a Service Role Key estão corretas.` });
    }

    const buckets = await bucketsRes.json();
    const bucketList = buckets || [];
    const found = bucketList.some(
      (b: any) =>
        b.name?.toLowerCase() === targetBucket.toLowerCase() ||
        b.id?.toLowerCase() === targetBucket.toLowerCase() ||
        b.name?.toLowerCase() === targetBucket.replace(/\s+/g, '-').toLowerCase() ||
        b.id?.toLowerCase() === targetBucket.replace(/\s+/g, '-').toLowerCase()
    );

    if (!found) {
      const createRes = await fetch(`${targetUrl}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: targetBucket,
          name: targetBucket,
          public: true,
          file_size_limit: 104857600,
        }),
      });

      if (createRes.ok) {
        return res.json({
          success: true,
          message: `Bucket "${targetBucket}" criado com sucesso e pronto para uso!`,
          buckets: [...bucketList, { id: targetBucket, name: targetBucket, public: true }],
        });
      }
    }

    return res.json({
      success: true,
      message: `Conexão bem sucedida com o Supabase! O bucket "${targetBucket}" está ativo.`,
      buckets: bucketList,
    });
  } catch (error: any) {
    console.error('Error in /api/supabase-test:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Falha ao conectar.' });
  }
});

// Endpoint to list all buckets
app.get('/api/supabase-buckets', async (req, res) => {
  try {
    if (!SERVER_SUPABASE_URL || !SERVER_SUPABASE_SECRET_KEY) {
      return res.status(400).json({ success: false, error: 'Credenciais do Supabase não configuradas no servidor.' });
    }
    const headers = {
      'Authorization': `Bearer ${SERVER_SUPABASE_SECRET_KEY}`,
      'apikey': SERVER_SUPABASE_SECRET_KEY,
    };
    const bucketsRes = await fetch(`${SERVER_SUPABASE_URL}/storage/v1/bucket`, { method: 'GET', headers });
    if (!bucketsRes.ok) {
      const errText = await bucketsRes.text();
      return res.status(400).json({ success: false, error: errText });
    }
    const buckets = await bucketsRes.json();
    return res.json({ success: true, buckets: buckets || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to force-create a bucket
app.post('/api/supabase-create-bucket', async (req, res) => {
  try {
    const bucketName = (req.body.bucket || DEFAULT_BUCKET).trim();
    if (!SERVER_SUPABASE_URL || !SERVER_SUPABASE_SECRET_KEY) {
      return res.status(400).json({ success: false, error: 'Credenciais do Supabase não configuradas no servidor.' });
    }
    const headers = {
      'Authorization': `Bearer ${SERVER_SUPABASE_SECRET_KEY}`,
      'apikey': SERVER_SUPABASE_SECRET_KEY,
      'Content-Type': 'application/json',
    };
    const createRes = await fetch(`${SERVER_SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        id: bucketName,
        name: bucketName,
        public: true,
        file_size_limit: 104857600,
      }),
    });
    if (!createRes.ok) {
      const errText = await createRes.text();
      return res.status(400).json({ success: false, error: errText });
    }
    const data = await createRes.json();
    return res.json({ success: true, message: `Bucket "${bucketName}" criado com sucesso!`, bucket: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Upload PDF via REST API
app.post('/api/supabase-upload', async (req, res) => {
  try {
    const { supabaseUrl, supabaseKey, bucket, fileName, pdfBase64 } = req.body || {};

    if (!fileName || !pdfBase64) {
      return res.status(400).json({
        success: false,
        error: 'Arquivo PDF ou nome do arquivo ausente.',
      });
    }

    const targetUrl = (supabaseUrl || SERVER_SUPABASE_URL).trim().replace(/\/+$/, '').replace(/^["']|["']$/g, '');
    const candidateKeys = getCandidateKeys(supabaseKey);
    let requestedBucket = (bucket || DEFAULT_BUCKET).trim().replace(/^["']|["']$/g, '');

    if (requestedBucket.includes('@') || requestedBucket.includes("'") || requestedBucket.length < 2) {
      requestedBucket = DEFAULT_BUCKET;
    }

    if (!targetUrl || candidateKeys.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Credenciais do Supabase não configuradas no servidor.',
      });
    }

    const cleanFileName = fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/^\/+/, '')
      .replace(/[^a-zA-Z0-9_.\/-]+/g, '_');

    const cleanPath = cleanFileName.split('/').map(encodeURIComponent).join('/');
    const buffer = Buffer.from(pdfBase64, 'base64');
    const fileSizeMB = buffer.length / (1024 * 1024);

    console.log(`[Supabase Upload] Enviando "${cleanFileName}" (${fileSizeMB.toFixed(2)} MB) para bucket "${requestedBucket}"...`);

    let lastError = '';
    let successResult: { publicUrl: string; bucket: string; fileName: string } | null = null;

    // Try with each candidate key until success (preferring Service Role JWT)
    for (const key of candidateKeys) {
      try {
        const pubApiKey = 'sb_publishable_1-hLKTMZRnRLNo4kQavIAg_WtVRWpem';
        const headers = {
          'Authorization': `Bearer ${key}`,
          'apikey': key.startsWith('sb_publishable_') ? key : pubApiKey,
        };

        // 1. Check or create bucket if needed
        try {
          const bucketsRes = await fetch(`${targetUrl}/storage/v1/bucket`, { method: 'GET', headers });
          if (bucketsRes.ok) {
            const buckets = await bucketsRes.json();
            const exists = (buckets || []).some(
              (b: any) =>
                b.name?.toLowerCase() === requestedBucket.toLowerCase() ||
                b.id?.toLowerCase() === requestedBucket.toLowerCase()
            );
            if (!exists) {
              await fetch(`${targetUrl}/storage/v1/bucket`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  id: requestedBucket,
                  name: requestedBucket,
                  public: true,
                  file_size_limit: 104857600,
                }),
              });
            }
          }
        } catch (bErr) {
          console.warn('[Supabase Bucket Check Notice]:', bErr);
        }

        // 2. Upload object
        const uploadUrl = `${targetUrl}/storage/v1/object/${encodeURIComponent(requestedBucket)}/${cleanPath}`;
        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/pdf',
            'x-upsert': 'true',
          },
          body: buffer,
        });

        if (uploadRes.ok) {
          const publicUrl = `${targetUrl}/storage/v1/object/public/${encodeURIComponent(requestedBucket)}/${cleanPath}`;
          successResult = {
            publicUrl,
            bucket: requestedBucket,
            fileName: cleanFileName,
          };
          break;
        } else {
          lastError = await uploadRes.text();
          console.warn(`[Supabase Upload Attempt failed with key prefix ${key.substring(0, 15)}...]: ${uploadRes.status} ${lastError}`);
        }
      } catch (keyAttemptErr: any) {
        lastError = keyAttemptErr?.message || 'Falha na requisição';
      }
    }

    if (successResult) {
      return res.status(200).json({
        success: true,
        ...successResult,
      });
    }

    return res.status(400).json({
      success: false,
      error: `Erro no Supabase Storage: ${lastError || 'Não foi possível gravar no bucket'}. Certifique-se de que o bucket "${requestedBucket}" foi criado no painel do Supabase.`,
    });
  } catch (err: any) {
    console.error('[Supabase Upload Error]:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Erro interno no upload.' });
  }
});

async function start() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Villa7 Album server running on http://0.0.0.0:${PORT}`);
  });
}

start();
