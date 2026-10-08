import { Buffer } from 'buffer';
import { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SELECTION_BUCKET } from '../src/services/clientStorage';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { token, fileName, filename, name, pdfBase64, base64 } = req.body || {};
    const targetFile = fileName || filename || name;
    const targetData = pdfBase64 || base64;

    if (!targetData || !targetFile) {
      return res.status(400).json({ success: false, error: 'PDF ou nome de arquivo não fornecido.' });
    }

    const buffer = Buffer.from(targetData, 'base64');
    const cleanFileName = targetFile
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_.-]+/g, '_');

    const folder = token ? `selecoes/${token}` : 'selecoes';
    const cleanPath = `${folder}/${cleanFileName}`;

    const headers = {
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Content-Type': 'application/pdf',
      'x-upsert': 'true',
    };

    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SELECTION_BUCKET}/${cleanPath}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers,
      body: buffer,
    });

    if (uploadRes.ok) {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${SELECTION_BUCKET}/${cleanPath}`;
      return res.status(200).json({
        success: true,
        publicUrl,
        bucket: SELECTION_BUCKET,
        fileName: cleanFileName,
        fileSizeKB: (buffer.length / 1024).toFixed(1),
      });
    }

    const errText = await uploadRes.text();
    return res.status(400).json({
      success: false,
      error: `Erro ao enviar PDF para o Supabase: ${errText}`,
    });
  } catch (err: any) {
    console.error('[Selection PDF Upload Exception]:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Erro interno no upload.' });
  }
}
