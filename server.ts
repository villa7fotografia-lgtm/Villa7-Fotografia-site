import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Body parser for JSON with large payload support (up to 50MB for print-ready PDFs)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Supabase environment constants (server-side secure storage)
const SERVER_SUPABASE_URL = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/^["']|["']$/g, '');
const SERVER_SUPABASE_SECRET_KEY = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || '').trim().replace(/^["']|["']$/g, '');
const DEFAULT_BUCKET = 'Villa7 Fotografia';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: {
      url: SERVER_SUPABASE_URL,
      hasSecretKey: Boolean(SERVER_SUPABASE_SECRET_KEY),
    },
  });
});

// Test connection and bucket discovery endpoint via REST API
app.post('/api/supabase-test', async (req, res) => {
  try {
    const { supabaseUrl, supabaseKey, bucket } = req.body || {};
    const targetUrl = (supabaseUrl || SERVER_SUPABASE_URL).trim().replace(/\/+$/, '').replace(/^["']|["']$/g, '');
    const targetKey = (supabaseKey || SERVER_SUPABASE_SECRET_KEY).trim().replace(/^["']|["']$/g, '');
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
          file_size_limit: 52428800,
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
        file_size_limit: 52428800,
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
    const targetKey = (supabaseKey || SERVER_SUPABASE_SECRET_KEY).trim().replace(/^["']|["']$/g, '');
    let requestedBucket = (bucket || DEFAULT_BUCKET).trim().replace(/^["']|["']$/g, '');

    if (requestedBucket.includes('@') || requestedBucket.includes("'") || requestedBucket.length < 2) {
      requestedBucket = DEFAULT_BUCKET;
    }

    if (!targetUrl || !targetKey) {
      return res.status(400).json({
        success: false,
        error: 'Credenciais do Supabase não configuradas no servidor (SUPABASE_URL e SUPABASE_SECRET_KEY).',
      });
    }

    const cleanFileName = fileName
      .replace(/^\/+/, '')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');

    const buffer = Buffer.from(pdfBase64, 'base64');
    const fileSizeMB = buffer.length / (1024 * 1024);

    console.log(`[Supabase Upload REST] Gravando "${cleanFileName}" (${fileSizeMB.toFixed(2)} MB) no bucket "${requestedBucket}"...`);

    const headers = {
      'Authorization': `Bearer ${targetKey}`,
      'apikey': targetKey,
    };

    let targetBucketId = requestedBucket;
    try {
      const bucketsRes = await fetch(`${targetUrl}/storage/v1/bucket`, {
        method: 'GET',
        headers,
      });
      if (bucketsRes.ok) {
        const buckets = await bucketsRes.json();
        const found = (buckets || []).find(
          (b: any) =>
            b.name?.toLowerCase() === requestedBucket.toLowerCase() ||
            b.id?.toLowerCase() === requestedBucket.toLowerCase() ||
            b.name?.toLowerCase() === requestedBucket.replace(/\s+/g, '-').toLowerCase() ||
            b.id?.toLowerCase() === requestedBucket.replace(/\s+/g, '-').toLowerCase()
        );
        if (found) {
          targetBucketId = found.id || found.name;
        } else {
          const createRes = await fetch(`${targetUrl}/storage/v1/bucket`, {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: requestedBucket,
              name: requestedBucket,
              public: true,
              file_size_limit: 52428800,
            }),
          });
          if (createRes.ok) {
            targetBucketId = requestedBucket;
          } else {
            const slug = requestedBucket.replace(/\s+/g, '-').toLowerCase();
            const createSlugRes = await fetch(`${targetUrl}/storage/v1/bucket`, {
              method: 'POST',
              headers: {
                ...headers,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: slug,
                name: slug,
                public: true,
                file_size_limit: 52428800,
              }),
            });
            if (createSlugRes.ok) {
              targetBucketId = slug;
            } else if (buckets && buckets.length > 0) {
              targetBucketId = buckets[0].id || buckets[0].name;
            }
          }
        }
      }
    } catch (e) {
      console.warn('[Supabase Upload REST] Aviso ao listar/criar bucket, prosseguindo com upload direto:', e);
    }

    const uploadUrl = `${targetUrl}/storage/v1/object/${encodeURIComponent(targetBucketId)}/${encodeURIComponent(cleanFileName)}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/pdf',
        'x-upsert': 'true',
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      const slugBucket = targetBucketId.replace(/\s+/g, '-').toLowerCase();
      if (slugBucket !== targetBucketId) {
        const retryUrl = `${targetUrl}/storage/v1/object/${encodeURIComponent(slugBucket)}/${encodeURIComponent(cleanFileName)}`;
        const retryRes = await fetch(retryUrl, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/pdf',
            'x-upsert': 'true',
          },
          body: buffer,
        });
        if (retryRes.ok) {
          targetBucketId = slugBucket;
        } else {
          const retryErr = await retryRes.text();
          return res.status(400).json({
            success: false,
            error: `Erro no Supabase Storage (${uploadRes.status}): ${errText || retryErr}.`,
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: `Erro no Supabase Storage (${uploadRes.status}): ${errText}.`,
        });
      }
    }

    const publicUrl = `${targetUrl}/storage/v1/object/public/${encodeURIComponent(targetBucketId)}/${encodeURIComponent(cleanFileName)}`;

    return res.status(200).json({
      success: true,
      publicUrl,
      bucket: targetBucketId,
      fileName: cleanFileName,
    });
  } catch (err: any) {
    console.error('[Vercel Supabase Upload Error]:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Erro interno no upload para o Supabase.' });
  }
});

async function start() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
