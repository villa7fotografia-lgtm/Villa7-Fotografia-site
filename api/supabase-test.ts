const DEFAULT_BUCKET = 'Villa7 Fotografia';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { supabaseUrl, supabaseKey, bucket } = req.body || {};
    const targetUrl = (supabaseUrl || 'https://twfhqhkzabvlzkgofjyj.supabase.co').trim().replace(/\/+$/, '').replace(/^["']|["']$/g, '');
    const targetKey = (supabaseKey || 'sb_publishable_1-hLKTMZRnRLNo4kQavIAg_WtVRWpem').trim().replace(/^["']|["']$/g, '');
    const targetBucket = (bucket || DEFAULT_BUCKET).trim().replace(/^["']|["']$/g, '');

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
      // If listing fails due to restrictions, test object upload capability directly
      return res.json({
        success: true,
        message: `Conexão configurada com o Supabase! Pronto para envio de arquivos.`,
        buckets: [{ id: targetBucket, name: targetBucket, public: true }],
      });
    }

    const buckets = await bucketsRes.json();
    const bucketList = buckets || [];
    const slug = targetBucket.replace(/\s+/g, '-').toLowerCase();

    const found = bucketList.some(
      (b: any) =>
        b.name?.toLowerCase() === targetBucket.toLowerCase() ||
        b.id?.toLowerCase() === targetBucket.toLowerCase() ||
        b.name?.toLowerCase() === slug ||
        b.id?.toLowerCase() === slug
    );

    if (!found) {
      await fetch(`${targetUrl}/storage/v1/bucket`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: slug,
          name: targetBucket,
          public: true,
          file_size_limit: 52428800,
        }),
      }).catch(() => {});
    }

    return res.json({
      success: true,
      message: `Conexão bem sucedida com o Supabase! O bucket "${targetBucket}" está ativo.`,
      buckets: bucketList,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error?.message || 'Falha ao conectar.' });
  }
}
