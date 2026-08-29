import { createClient } from '@supabase/supabase-js';

const DEFAULT_BUCKET = 'Villa7 Fotografia';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { supabaseUrl, supabaseKey, bucket, fileName, pdfBase64 } = req.body || {};

    if (!fileName || !pdfBase64) {
      return res.status(400).json({
        success: false,
        error: 'Arquivo PDF ou nome do arquivo ausente.',
      });
    }

    const targetUrl = (supabaseUrl || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const targetKey = (supabaseKey || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || '').trim();
    let requestedBucket = (bucket || process.env.VITE_SUPABASE_BUCKET || DEFAULT_BUCKET).trim();

    if (requestedBucket.includes('@') || requestedBucket.includes("'") || requestedBucket.length < 2) {
      requestedBucket = DEFAULT_BUCKET;
    }

    if (!targetUrl || !targetKey) {
      return res.status(400).json({
        success: false,
        error: 'Credenciais do Supabase não configuradas no servidor (SUPABASE_URL e SUPABASE_SECRET_KEY).',
      });
    }

    const supabase = createClient(targetUrl, targetKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const cleanFileName = fileName
      .replace(/^\/+/, '')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');

    const buffer = Buffer.from(pdfBase64, 'base64');
    const fileSizeMB = buffer.length / (1024 * 1024);

    console.log(`[Vercel Supabase Upload] Gravando "${cleanFileName}" (${fileSizeMB.toFixed(2)} MB) no bucket "${requestedBucket}"...`);

    // 1. List buckets to check existence
    const { data: existingBuckets } = await supabase.storage.listBuckets();
    const bucketList = existingBuckets || [];
    let targetBucketId = requestedBucket;

    const matchedBucket = bucketList.find(
      (b: any) =>
        b.name?.toLowerCase() === requestedBucket.toLowerCase() ||
        b.id?.toLowerCase() === requestedBucket.toLowerCase() ||
        b.name?.toLowerCase() === requestedBucket.replace(/\s+/g, '-').toLowerCase() ||
        b.id?.toLowerCase() === requestedBucket.replace(/\s+/g, '-').toLowerCase()
    );

    if (matchedBucket) {
      targetBucketId = matchedBucket.id || matchedBucket.name;
    } else {
      const { data: newBucket, error: createErr } = await supabase.storage.createBucket(requestedBucket, {
        public: true,
        fileSizeLimit: 52428800,
      });

      if (!createErr && newBucket) {
        targetBucketId = requestedBucket;
      } else if (bucketList.length > 0) {
        targetBucketId = bucketList[0].id || bucketList[0].name;
      }
    }

    // 2. Upload
    const { error: uploadError } = await supabase.storage
      .from(targetBucketId)
      .upload(cleanFileName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      // Try slug bucket retry
      const slugBucket = targetBucketId.replace(/\s+/g, '-').toLowerCase();
      const { error: retryErr } = await supabase.storage
        .from(slugBucket)
        .upload(cleanFileName, buffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (retryErr) {
        return res.status(400).json({ success: false, error: retryErr.message });
      }
      targetBucketId = slugBucket;
    }

    const { data: publicData } = supabase.storage
      .from(targetBucketId)
      .getPublicUrl(cleanFileName);

    const publicUrl = publicData?.publicUrl || `${targetUrl}/storage/v1/object/public/${encodeURIComponent(targetBucketId)}/${encodeURIComponent(cleanFileName)}`;

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
}
