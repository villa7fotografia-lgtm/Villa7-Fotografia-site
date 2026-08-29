import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const app = express();
const PORT = 3000;

// Body parser for JSON with large payload support (up to 50MB for print-ready PDFs)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Supabase environment constants (server-side secure storage)
const SERVER_SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SERVER_SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';
const SERVER_SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const SERVER_SUPABASE_JWKS_URL = process.env.SUPABASE_JWKS_URL || (SERVER_SUPABASE_URL ? `${SERVER_SUPABASE_URL}/auth/v1/.well-known/jwks.json` : '');
const DEFAULT_BUCKET = 'Villa7 Fotografia';

// Helper to get admin client with service secret key (bypasses RLS for direct storage uploads)
function getSupabaseAdmin(customUrl?: string, customKey?: string): SupabaseClient {
  const url = (customUrl || SERVER_SUPABASE_URL).trim().replace(/\/+$/, '');
  const key = (customKey || SERVER_SUPABASE_SECRET_KEY || SERVER_SUPABASE_PUBLISHABLE_KEY).trim();
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: {
      url: SERVER_SUPABASE_URL,
      jwks: SERVER_SUPABASE_JWKS_URL,
      hasSecretKey: Boolean(SERVER_SUPABASE_SECRET_KEY),
      hasPublishableKey: Boolean(SERVER_SUPABASE_PUBLISHABLE_KEY),
    },
  });
});

// Test connection and bucket discovery endpoint
app.post('/api/supabase-test', async (req, res) => {
  try {
    const targetUrl = (req.body.supabaseUrl || SERVER_SUPABASE_URL).trim().replace(/\/+$/, '');
    const targetBucket = (req.body.bucket || DEFAULT_BUCKET).trim();
    const supabase = getSupabaseAdmin(targetUrl);

    // List all existing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.warn('Error listing buckets via Supabase SDK:', listError.message);
      return res.status(400).json({
        success: false,
        error: `Falha ao conectar com o Supabase: ${listError.message}`,
      });
    }

    const bucketList = buckets || [];
    const found = bucketList.some(
      (b) =>
        b.name?.toLowerCase() === targetBucket.toLowerCase() ||
        b.id?.toLowerCase() === targetBucket.toLowerCase() ||
        b.name?.toLowerCase() === targetBucket.replace(/\s+/g, '-').toLowerCase() ||
        b.id?.toLowerCase() === targetBucket.replace(/\s+/g, '-').toLowerCase()
    );

    if (!found) {
      // Auto-create bucket if not found
      console.log(`Bucket "${targetBucket}" não encontrado. Criando bucket público automaticamente...`);
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(targetBucket, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      });

      if (!createError && newBucket) {
        return res.json({
          success: true,
          message: `Bucket "${targetBucket}" criado com sucesso e pronto para receber os álbuns!`,
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
    return res.status(500).json({
      success: false,
      error: error?.message || 'Falha ao conectar com o Supabase.',
    });
  }
});

// Endpoint to list all buckets in the Supabase project
app.get('/api/supabase-buckets', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, buckets: data || [] });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint to force-create a bucket
app.post('/api/supabase-create-bucket', async (req, res) => {
  try {
    const bucketName = (req.body.bucket || DEFAULT_BUCKET).trim();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 52428800,
    });

    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }

    return res.json({ success: true, message: `Bucket "${bucketName}" criado com sucesso!`, bucket: data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Upload PDF directly to Supabase Storage with Admin Superuser privileges (RLS bypass)
app.post('/api/supabase-upload', async (req, res) => {
  try {
    const { supabaseUrl, bucket, fileName, pdfBase64 } = req.body;

    if (!fileName || !pdfBase64) {
      return res.status(400).json({
        success: false,
        error: 'Arquivo PDF ou nome do arquivo ausente.',
      });
    }

    const targetUrl = (supabaseUrl || SERVER_SUPABASE_URL).trim().replace(/\/+$/, '');
    let requestedBucket = (bucket || DEFAULT_BUCKET).trim();

    // Clean invalid characters if pasted by mistake
    if (requestedBucket.includes('@') || requestedBucket.includes("'") || requestedBucket.length < 2) {
      requestedBucket = DEFAULT_BUCKET;
    }

    // Format clean sanitized filename without leading slash
    const cleanFileName = fileName
      .replace(/^\/+/, '')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');

    // Convert base64 to binary buffer
    const buffer = Buffer.from(pdfBase64, 'base64');
    const fileSizeMB = buffer.length / (1024 * 1024);

    console.log(`[Supabase Upload] Iniciando gravação de "${cleanFileName}" (${fileSizeMB.toFixed(2)} MB) no bucket "${requestedBucket}"...`);

    const supabase = getSupabaseAdmin(targetUrl);

    // 1. Get existing buckets to determine exact bucket ID
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const bucketList = existingBuckets || [];

    let targetBucketId = requestedBucket;

    const matchedBucket = bucketList.find(
      (b) =>
        b.name?.toLowerCase() === requestedBucket.toLowerCase() ||
        b.id?.toLowerCase() === requestedBucket.toLowerCase() ||
        b.name?.toLowerCase() === requestedBucket.replace(/\s+/g, '-').toLowerCase() ||
        b.id?.toLowerCase() === requestedBucket.replace(/\s+/g, '-').toLowerCase()
    );

    if (matchedBucket) {
      targetBucketId = matchedBucket.id || matchedBucket.name;
    } else {
      // Bucket does not exist yet -> Auto-create it!
      console.log(`[Supabase Upload] Criando bucket "${requestedBucket}"...`);
      const { data: newBucket, error: createErr } = await supabase.storage.createBucket(requestedBucket, {
        public: true,
        fileSizeLimit: 52428800,
      });

      if (!createErr && newBucket) {
        targetBucketId = requestedBucket;
      } else if (bucketList.length > 0) {
        // Fallback to first available existing bucket
        targetBucketId = bucketList[0].id || bucketList[0].name;
        console.log(`[Supabase Upload] Usando bucket existente alternativo "${targetBucketId}"`);
      }
    }

    // 2. Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(targetBucketId)
      .upload(cleanFileName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error(`[Supabase Upload] Erro no upload para o bucket "${targetBucketId}":`, uploadError.message);

      // Retry with slugified bucket name if space caused issue
      const slugBucket = targetBucketId.replace(/\s+/g, '-').toLowerCase();
      if (slugBucket !== targetBucketId) {
        console.log(`[Supabase Upload] Tentando no bucket slugificado "${slugBucket}"...`);
        await supabase.storage.createBucket(slugBucket, { public: true }).catch(() => {});
        const retryRes = await supabase.storage.from(slugBucket).upload(cleanFileName, buffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

        if (!retryRes.error) {
          const { data: linkData } = supabase.storage.from(slugBucket).getPublicUrl(cleanFileName);
          const publicUrl = linkData?.publicUrl || `${targetUrl}/storage/v1/object/public/${encodeURIComponent(slugBucket)}/${encodeURIComponent(cleanFileName)}`;
          console.log(`[Supabase Upload] Sucesso na retentativa! URL:`, publicUrl);
          return res.json({
            success: true,
            publicUrl,
            fileName: cleanFileName,
            bucket: slugBucket,
            fileSizeMB,
          });
        }
      }

      return res.status(400).json({
        success: false,
        error: `Erro ao salvar no Supabase Storage: ${uploadError.message}`,
      });
    }

    // 3. Get Public URL
    const { data: linkData } = supabase.storage.from(targetBucketId).getPublicUrl(cleanFileName);
    const publicUrl =
      linkData?.publicUrl ||
      `${targetUrl}/storage/v1/object/public/${encodeURIComponent(targetBucketId)}/${encodeURIComponent(cleanFileName)}`;

    console.log(`[Supabase Upload] Upload concluído com sucesso! URL pública: ${publicUrl}`);

    return res.json({
      success: true,
      publicUrl,
      fileName: cleanFileName,
      bucket: targetBucketId,
      fileSizeMB,
      uploadData,
    });
  } catch (error: any) {
    console.error('Error in /api/supabase-upload:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erro interno ao salvar o arquivo no Supabase Storage.',
    });
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
