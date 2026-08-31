import { Buffer } from 'buffer';

const DEFAULT_BUCKET = 'pdfs';

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

    const targetUrl = (supabaseUrl || process.env.SUPABASE_URL || 'https://twfhqhkzabvlzkgofjyj.supabase.co').trim().replace(/\/+$/, '').replace(/^["']|["']$/g, '');
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZmhxaGt6YWJ2bHprZ29manlqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Nzk3OTU2NiwiZXhwIjoyMTAzNTU1NTY2fQ.uDMUCfyFq7rUyoZn8rFhDbGcPW4DFTWhyNlczke8Z4g').trim().replace(/^["']|["']$/g, '');
    const targetKey = (!supabaseKey || supabaseKey.startsWith('sb_publishable_') ? serviceRoleKey : supabaseKey.trim().replace(/^["']|["']$/g, ''));
    const requestedBucket = (bucket || DEFAULT_BUCKET).trim().replace(/^["']|["']$/g, '');

    if (!targetUrl || !targetKey) {
      return res.status(400).json({
        success: false,
        error: 'URL ou Chave do Supabase não fornecidas.',
      });
    }

    const cleanFileName = fileName
      .replace(/^\/+/, '')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');

    const cleanPath = cleanFileName.split('/').map(encodeURIComponent).join('/');

    const buffer = Buffer.from(pdfBase64, 'base64');
    const fileSizeMB = buffer.length / (1024 * 1024);

    console.log(`[Supabase Upload Robust] Enviando "${cleanFileName}" (${fileSizeMB.toFixed(2)} MB) para URL: ${targetUrl}`);

    const headers = {
      'Authorization': `Bearer ${targetKey}`,
      'apikey': targetKey,
    };

    // Candidates of bucket names to try
    const bucketCandidates = Array.from(new Set([
      requestedBucket,
      DEFAULT_BUCKET,
      'pdfs',
      'documentos',
      'Villa7 Fotografia',
      'villa7-fotografia',
      'public',
      'storage'
    ]));

    let successBucket = null;
    let lastErrorMsg = '';

    for (const bName of bucketCandidates) {
      const bucketId = bName.replace(/\s+/g, '-').toLowerCase();
      const rawBucketId = bName;

      // Try uploading to bucketId (slug) and rawBucketId
      for (const targetId of [rawBucketId, bucketId]) {
        try {
          const uploadUrl = `${targetUrl}/storage/v1/object/${encodeURIComponent(targetId)}/${cleanPath}`;
          console.log(`[Supabase Upload Robust] Tentando upload no bucket ID: "${targetId}"...`);

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
            successBucket = targetId;
            break;
          } else {
            const errText = await uploadRes.text();
            lastErrorMsg = `Bucket "${targetId}" (${uploadRes.status}): ${errText}`;
            console.warn(`[Supabase Upload Robust] Falha no bucket "${targetId}":`, errText);
          }
        } catch (err: any) {
          lastErrorMsg = err?.message || 'Erro de rede';
        }
      }

      if (successBucket) break;

      // Try creating bucket if it doesn't exist
      try {
        const createRes = await fetch(`${targetUrl}/storage/v1/bucket`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: bucketId,
            name: rawBucketId,
            public: true,
            file_size_limit: 104857600,
          }),
        });

        if (createRes.ok) {
          console.log(`[Supabase Upload Robust] Bucket "${bucketId}" criado com sucesso. Tentando upload novamente...`);
          const uploadUrl = `${targetUrl}/storage/v1/object/${encodeURIComponent(bucketId)}/${cleanPath}`;
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
            successBucket = bucketId;
            break;
          }
        }
      } catch (createErr) {
        // ignore creation error and continue
      }
    }

    if (!successBucket) {
      return res.status(400).json({
        success: false,
        error: `Não foi possível enviar o PDF para nenhum bucket do Supabase. Último erro: ${lastErrorMsg}. Certifique-se de que a chave fornecida é válida e que o bucket "${requestedBucket}" existe no painel do Supabase.`,
      });
    }

    const publicUrl = `${targetUrl}/storage/v1/object/public/${encodeURIComponent(successBucket)}/${cleanPath}`;
    console.log(`[Supabase Upload Robust] Sucesso total! URL pública: ${publicUrl}`);

    return res.status(200).json({
      success: true,
      publicUrl,
      bucket: successBucket,
      fileName: cleanFileName,
    });
  } catch (err: any) {
    console.error('[Supabase Upload Robust Exception]:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Erro crítico interno no upload para o Supabase.',
    });
  }
}
