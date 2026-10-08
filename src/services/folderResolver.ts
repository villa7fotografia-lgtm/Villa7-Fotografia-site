/**
 * Villa7 Fotografia - Repository & Cloud Folder Photo Resolver
 * Automatically detects and extracts photo listings and image preview URLs
 * from photo repositories (Google Drive, Dropbox, Google Photos, Supabase Storage, Web Galleries).
 */

export interface ResolvedPhoto {
  id: string | number;
  name: string;
  url: string;
  thumbnailUrl?: string;
  size?: number;
}

export interface FolderResolveResult {
  success: boolean;
  type: 'google_drive' | 'dropbox' | 'google_photos' | 'supabase' | 'direct' | 'unknown';
  folderId?: string;
  folderUrl: string;
  photos: ResolvedPhoto[];
  requiresAuth?: boolean;
  message?: string;
}

/**
 * Extract Google Drive folder ID from various URL patterns
 */
export function extractGoogleDriveFolderId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/) ||
                url.match(/[?&]id=([a-zA-Z0-9_-]+)/) ||
                url.match(/\/open\?id=([a-zA-Z0-9_-]+)/) ||
                url.match(/\/folderview\?id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Parse file listings from Google Drive public folder HTML
 */
export function parseGoogleDriveHtmlFiles(html: string): ResolvedPhoto[] {
  const photos: ResolvedPhoto[] = [];
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();

  // Normalize and unescape JSON quotes in HTML
  const unescaped = html.replace(/\\"/g, '"');

  // Match pattern: ["FILE_ID","FILENAME.EXT"
  const regex1 = /\["([a-zA-Z0-9_-]{20,})","([^"]+\.(?:jpe?g|png|webp|gif|cr[23]|nef|arw|dng|raw|tif|tiff))"/gi;
  let m: RegExpExecArray | null;
  while ((m = regex1.exec(unescaped)) !== null) {
    const id = m[1];
    const name = m[2];
    if (!seenIds.has(id) && !seenNames.has(name.toLowerCase())) {
      seenIds.add(id);
      seenNames.add(name.toLowerCase());
      photos.push({
        id,
        name,
        url: `https://lh3.googleusercontent.com/d/${id}`,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1600`
      });
    }
  }

  // Match pattern: "FILE_ID" ... "FILENAME.EXT"
  const regex2 = /"([a-zA-Z0-9_-]{25,45})"[^\]]{1,80}?"([^"\\]+?\.(?:jpe?g|png|webp|cr[23]|nef|arw|dng|raw|tif))"/gi;
  while ((m = regex2.exec(unescaped)) !== null) {
    const id = m[1];
    const name = m[2];
    if (!seenIds.has(id) && !seenNames.has(name.toLowerCase())) {
      seenIds.add(id);
      seenNames.add(name.toLowerCase());
      photos.push({
        id,
        name,
        url: `https://lh3.googleusercontent.com/d/${id}`,
        thumbnailUrl: `https://drive.google.com/thumbnail?id=${id}&sz=w1600`
      });
    }
  }

  return photos;
}

/**
 * Main resolver function for repository links
 */
export async function resolveFolderPhotos(folderUrl: string, token?: string): Promise<FolderResolveResult> {
  const cleanUrl = (folderUrl || '').trim();
  if (!cleanUrl) {
    return {
      success: false,
      type: 'unknown',
      folderUrl: '',
      photos: [],
      message: 'URL do repositório não informada.'
    };
  }

  // 1. Google Drive Folder
  const driveFolderId = extractGoogleDriveFolderId(cleanUrl);
  if (driveFolderId) {
    try {
      // A. Try Google Drive API if any API key is configured
      const apiKey = process.env.GOOGLE_DRIVE_API_KEY || process.env.GOOGLE_API_KEY;
      if (apiKey) {
        try {
          const apiUrl = `https://www.googleapis.com/drive/v3/files?q='${driveFolderId}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,webContentLink,thumbnailLink)&pageSize=1000&key=${apiKey}`;
          const apiRes = await fetch(apiUrl);
          if (apiRes.ok) {
            const apiData: any = await apiRes.json();
            if (Array.isArray(apiData.files) && apiData.files.length > 0) {
              const photos: ResolvedPhoto[] = apiData.files
                .filter((f: any) => {
                  const n = (f.name || '').toLowerCase();
                  return n.match(/\.(jpe?g|png|webp|gif|cr[23]|nef|arw|dng|raw|tif|tiff)$/) ||
                    (f.mimeType && f.mimeType.startsWith('image/'));
                })
                .map((f: any, idx: number) => ({
                  id: f.id || idx + 1,
                  name: f.name || `Foto_${idx + 1}.jpg`,
                  url: `https://lh3.googleusercontent.com/d/${f.id}`,
                  thumbnailUrl: f.thumbnailLink ? f.thumbnailLink.replace(/=s\d+/, '=s1600') : `https://drive.google.com/thumbnail?id=${f.id}&sz=w1600`
                }));

              if (photos.length > 0) {
                return {
                  success: true,
                  type: 'google_drive',
                  folderId: driveFolderId,
                  folderUrl: cleanUrl,
                  photos,
                  message: `${photos.length} fotografia(s) encontradas na pasta do Google Drive via API!`
                };
              }
            }
          }
        } catch (apiErr) {
          console.warn('[Google Drive API attempt warning]:', apiErr);
        }
      }

      // B. Fetch public Google Drive folder web page
      const drivePublicUrl = `https://drive.google.com/drive/folders/${driveFolderId}`;
      const pageRes = await fetch(drivePublicUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });

      if (pageRes.ok) {
        const html = await pageRes.text();
        const photos = parseGoogleDriveHtmlFiles(html);
        if (photos.length > 0) {
          return {
            success: true,
            type: 'google_drive',
            folderId: driveFolderId,
            folderUrl: cleanUrl,
            photos,
            message: `${photos.length} fotografia(s) detectadas e carregadas da pasta do Google Drive!`
          };
        }
      }

      // If page is restricted / requires login
      return {
        success: true,
        type: 'google_drive',
        folderId: driveFolderId,
        folderUrl: cleanUrl,
        photos: [],
        requiresAuth: true,
        message: 'Pasta do Google Drive vinculada com sucesso. Caso esteja com permissão restrita, use a opção de seleção de pasta para importar as fotos instantaneamente.'
      };
    } catch (gErr: any) {
      console.warn('[Google Drive Resolution Warning]:', gErr);
      return {
        success: false,
        type: 'google_drive',
        folderId: driveFolderId,
        folderUrl: cleanUrl,
        photos: [],
        message: `Não foi possível carregar a pasta do Google Drive: ${gErr?.message || 'Erro de conexão'}`
      };
    }
  }

  // 2. Google Photos Shared Album
  if (cleanUrl.includes('photos.app.goo.gl') || cleanUrl.includes('photos.google.com')) {
    try {
      const gPhotosRes = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        }
      });
      if (gPhotosRes.ok) {
        const text = await gPhotosRes.text();
        const photos: ResolvedPhoto[] = [];
        const seenUrls = new Set<string>();
        const regex = /"https:\/\/(lh3\.googleusercontent\.com\/[^"]+?)"/g;
        let match: RegExpExecArray | null;
        let count = 0;
        while ((match = regex.exec(text)) !== null) {
          const rawUrl = match[1];
          if (!seenUrls.has(rawUrl) && !rawUrl.includes('googlelogo') && rawUrl.length > 60) {
            seenUrls.add(rawUrl);
            count++;
            const highRes = `https://${rawUrl}=w1600`;
            photos.push({
              id: count,
              name: `Foto_${String(count).padStart(3, '0')}.jpg`,
              url: highRes,
              thumbnailUrl: `https://${rawUrl}=w600`
            });
          }
        }
        if (photos.length > 0) {
          return {
            success: true,
            type: 'google_photos',
            folderUrl: cleanUrl,
            photos,
            message: `${photos.length} fotos encontradas no álbum do Google Fotos!`
          };
        }
      }
    } catch (gpErr) {
      console.warn('[Google Photos Warning]:', gpErr);
    }
  }

  // 3. Dropbox Folder
  if (cleanUrl.includes('dropbox.com')) {
    try {
      const directUrl = cleanUrl.includes('?') ? `${cleanUrl}&raw=1` : `${cleanUrl}?raw=1`;
      return {
        success: true,
        type: 'dropbox',
        folderUrl: directUrl,
        photos: [],
        message: 'Link Dropbox conectado. Utilize o upload rápido para sincronizar fotos.'
      };
    } catch (dbErr) {
      console.warn('[Dropbox Warning]:', dbErr);
    }
  }

  // 4. Supabase Storage Folder
  if (cleanUrl.includes('supabase.co') && cleanUrl.includes('/storage/v1/object')) {
    return {
      success: true,
      type: 'supabase',
      folderUrl: cleanUrl,
      photos: [],
      message: 'Repositório Supabase Storage conectado.'
    };
  }

  return {
    success: true,
    type: 'unknown',
    folderUrl: cleanUrl,
    photos: [],
    message: 'Link de repositório registrado.'
  };
}
