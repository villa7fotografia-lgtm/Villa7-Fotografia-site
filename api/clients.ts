import { Buffer } from 'buffer';

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

export async function getClientsFromSupabase(): Promise<ClientData[]> {
  try {
    const url = `${SUPABASE_URL}/storage/v1/object/public/${SELECTION_BUCKET}/database/clients.json?t=${Date.now()}`;
    const res = await fetch(url);
    if (res.ok) {
      const text = await res.text();
      if (text && (text.startsWith('[') || text.startsWith('{'))) {
        const data = JSON.parse(text);
        if (Array.isArray(data)) return data;
      }
    }
  } catch (err) {
    console.warn('[Vercel API getClientsFromSupabase]:', err);
  }
  return [];
}

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
    console.warn('[Vercel API saveClientsToSupabase]:', err);
    return false;
  }
}

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
    console.warn('[Vercel API saveSingleClientToSupabase]:', err);
    return false;
  }
}

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
    console.warn('[Vercel API uploadClientHtmlToSupabase]:', err);
  }
  return null;
}

export default async function handler(req: any, res: any) {
  const method = req.method;
  const url = req.url || '';

  // Extract query or URL parameters
  const query = req.query || {};
  const tokenParam = query.token || query.id || '';

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. GET /api/clients (all) or /api/clients?token=XYZ (single)
    if (method === 'GET') {
      const clients = await getClientsFromSupabase();
      if (tokenParam) {
        const client = clients.find(c => c.token === tokenParam);
        if (!client) {
          return res.status(404).json({ success: false, error: 'Cliente não encontrado.' });
        }
        return res.json({ success: true, client });
      }
      return res.json({ success: true, clients });
    }

    // 2. POST /api/clients (create or approve)
    if (method === 'POST') {
      const isApprove = url.includes('/approve') || req.body?.action === 'approve';

      if (isApprove) {
        const token = tokenParam || req.body?.token;
        if (!token) {
          return res.status(400).json({ success: false, error: 'Token não fornecido para aprovação.' });
        }

        const clients = await getClientsFromSupabase();
        const clientIdx = clients.findIndex(c => c.token === token);
        const { fotos_selecionadas, pdf_url, notes } = req.body || {};
        const approved_at = new Date().toISOString();

        let client = clientIdx >= 0 ? clients[clientIdx] : null;
        if (client) {
          client.status = 'aprovado';
          client.fotos_selecionadas = Array.isArray(fotos_selecionadas) ? fotos_selecionadas : [];
          client.approved_at = approved_at;
          if (pdf_url) client.pdf_url = pdf_url;
          if (notes !== undefined) client.notes = notes;
          clients[clientIdx] = client;
        } else {
          client = {
            token,
            nome: req.body?.nome || 'Cliente',
            email: req.body?.email || '',
            link_pasta: req.body?.link_pasta || '#',
            status: 'aprovado',
            created_at: approved_at,
            approved_at,
            fotos_selecionadas: Array.isArray(fotos_selecionadas) ? fotos_selecionadas : [],
            pdf_url,
            notes,
          };
          clients.unshift(client);
        }

        await saveSingleClientToSupabase(client);
        await saveClientsToSupabase(clients);

        return res.json({ success: true, client, message: 'Seleção aprovada com sucesso!' });
      }

      // Create new client
      const { nome, email, link_pasta, pasta_drive } = req.body || {};
      const effectiveLink = link_pasta || pasta_drive;

      if (!nome || !String(nome).trim()) {
        return res.status(400).json({ success: false, error: 'O Nome do Cliente é obrigatório.' });
      }
      if (!email || !String(email).trim()) {
        return res.status(400).json({ success: false, error: 'O E-mail do Cliente é obrigatório.' });
      }
      if (!effectiveLink || !String(effectiveLink).trim()) {
        return res.status(400).json({ success: false, error: 'O Link da pasta de fotos é obrigatório.' });
      }

      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const cleanSlug = String(nome).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const token = `${cleanSlug || 'cliente'}-${Date.now().toString(36)}-${randomSuffix}`;

      const newClient: ClientData = {
        id: `c_${Date.now()}_${randomSuffix}`,
        token,
        nome: String(nome).trim(),
        email: String(email).trim().toLowerCase(),
        link_pasta: String(effectiveLink).trim(),
        status: 'pendente',
        created_at: new Date().toISOString(),
        fotos_selecionadas: [],
      };

      // Save client in database
      await saveSingleClientToSupabase(newClient);
      const clients = await getClientsFromSupabase();
      clients.unshift(newClient);
      await saveClientsToSupabase(clients);

      return res.json({
        success: true,
        client: newClient,
        message: 'Cliente cadastrado no Supabase com sucesso!',
      });
    }

    // 3. DELETE /api/clients (remove)
    if (method === 'DELETE') {
      const token = tokenParam || req.body?.token;
      if (!token) {
        return res.status(400).json({ success: false, error: 'Token não fornecido.' });
      }

      let clients = await getClientsFromSupabase();
      clients = clients.filter(c => c.token !== token);
      await saveClientsToSupabase(clients);

      return res.json({ success: true, message: 'Cliente removido com sucesso.' });
    }

    return res.status(405).json({ success: false, error: 'Método não permitido.' });
  } catch (err: any) {
    console.error('[API Clients Handler Exception]:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Erro no servidor.' });
  }
}
