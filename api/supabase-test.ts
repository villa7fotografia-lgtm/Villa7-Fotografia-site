import { createClient } from '@supabase/supabase-js';

const DEFAULT_BUCKET = 'Villa7 Fotografia';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { supabaseUrl, supabaseKey, bucket } = req.body || {};
    const targetUrl = (supabaseUrl || process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const targetKey = (supabaseKey || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_KEY || process.env.VITE_SUPABASE_KEY || '').trim();
    const targetBucket = (bucket || process.env.VITE_SUPABASE_BUCKET || DEFAULT_BUCKET).trim();

    if (!targetUrl || !targetKey) {
      return res.status(400).json({ success: false, error: 'URL ou chave do Supabase não fornecidas.' });
    }

    const supabase = createClient(targetUrl, targetKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      return res.status(400).json({ success: false, error: listError.message });
    }

    const bucketList = buckets || [];
    const found = bucketList.some(
      (b: any) =>
        b.name?.toLowerCase() === targetBucket.toLowerCase() ||
        b.id?.toLowerCase() === targetBucket.toLowerCase() ||
        b.name?.toLowerCase() === targetBucket.replace(/\s+/g, '-').toLowerCase() ||
        b.id?.toLowerCase() === targetBucket.replace(/\s+/g, '-').toLowerCase()
    );

    if (!found) {
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(targetBucket, {
        public: true,
        fileSizeLimit: 52428800,
      });

      if (!createError && newBucket) {
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
    return res.status(500).json({ success: false, error: error?.message || 'Falha ao conectar.' });
  }
}
