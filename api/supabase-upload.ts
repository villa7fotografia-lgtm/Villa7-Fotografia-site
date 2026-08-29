import { Buffer } from 'buffer';

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

    const targetUrl = (supabaseUrl || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/^["']|["']$/g, '');
    const targetKey = (supabaseKey || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || '').trim().replace(/^["']|["']$/g, '');
    let requestedBucket = (bucket || process.env.VITE_SUPABASE_BUCKET || DEFAULT_BUCKET).trim().replace(/^["']|["']$/g, '');

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

    // 1. List buckets via REST API
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
          // Try to create bucket
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
            // Try slug format if creation failed
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

    // 2. Upload Object via REST API
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
      // Try slug bucket fallback
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
            error: `Erro no Supabase Storage (${uploadRes.status}): ${errText || retryErr}. Dica: Verifique se a chave SUPABASE_SECRET_KEY na Vercel é a chave "service_role" do seu projeto e se o bucket "${requestedBucket}" existe.`,
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          error: `Erro no Supabase Storage (${uploadRes.status}): ${errText}. Dica: Verifique se a chave SUPABASE_SECRET_KEY na Vercel é a chave "service_role" do seu projeto.`,
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
}
