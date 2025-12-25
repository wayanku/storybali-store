
import { Product } from '../types';

/**
 * Membersihkan URL dari spasi atau karakter ilegal
 */
const sanitizeUrl = (url: string): string => {
  return url.trim().replace(/\s/g, '');
};

/**
 * Fungsi untuk mengambil data dari Google Sheets.
 */
export const getStoreData = async (scriptUrl: string): Promise<Product[] | null> => {
  if (!scriptUrl) return null;
  
  const cleanUrl = sanitizeUrl(scriptUrl);
  
  try {
    const urlObj = new URL(cleanUrl);
    urlObj.searchParams.set('_t', Date.now().toString()); // Anti-cache

    const response = await fetch(urlObj.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    
    const data = await response.json();
    
    if (!Array.isArray(data)) return [];

    return data.map((p: any) => {
      // LOGIKA PARSING GAMBAR (Mencari di berbagai kemungkinan nama kolom)
      let rawImages = p.image || p.images || p.gambar || p.Gambar || '';
      let parsedImages: string[] = [];

      try {
        if (Array.isArray(rawImages)) {
          parsedImages = rawImages;
        } else if (typeof rawImages === 'string' && rawImages.trim() !== '') {
          const trimmed = rawImages.trim();
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            parsedImages = JSON.parse(trimmed);
          } else if (trimmed.includes(',')) {
            parsedImages = trimmed.split(',').map(s => s.trim());
          } else {
            parsedImages = [trimmed];
          }
        }
      } catch (e) {
        parsedImages = [];
      }

      parsedImages = parsedImages.filter(img => typeof img === 'string' && img.startsWith('http'));

      return {
        ...p,
        id: String(p.id || Date.now()),
        name: String(p.name || 'Produk Tanpa Nama'),
        price: Number(p.price || 0),
        images: parsedImages.length > 0 ? parsedImages : ['https://via.placeholder.com/600x600?text=No+Image'],
        category: String(p.category || 'Umum'),
        description: String(p.description || ''),
        story: String(p.story || ''),
        rating: Number(p.rating || 5),
        soldCount: Number(p.soldCount || 0)
      };
    });
  } catch (error) {
    console.error('Fetch Cloud Data Error:', error);
    return null;
  }
};

/**
 * Mengirim data ke Google Sheets.
 */
export const updateStoreData = async (scriptUrl: string, products: Product[]): Promise<boolean> => {
  if (!scriptUrl) return false;
  
  const cleanUrl = sanitizeUrl(scriptUrl);

  try {
    // Masalah utama: Google Script mengharapkan kolom bernama "image" (singular)
    // sedangkan aplikasi menggunakan "images" (plural).
    // Kita kirimkan kedua kunci agar Google Script bisa memetakan data dengan benar.
    const payload = products.map(p => {
      const imagesString = Array.isArray(p.images) ? p.images.join(',') : String(p.images || '');
      return {
        ...p,
        image: imagesString,  // UNTUK GOOGLE SHEETS (Kolom 'image')
        images: imagesString  // Fallback
      };
    });

    await fetch(cleanUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain', 
      },
      body: JSON.stringify({ products: payload }),
    });

    console.log("✅ Payload Terkirim dengan kunci 'image'.");
    return true;
  } catch (error) {
    console.error('Update Cloud Data Error:', error);
    return false;
  }
};

/**
 * Upload ke ImgBB.
 */
export const uploadImageToImgBB = async (file: File, apiKey: string): Promise<string | null> => {
  if (!apiKey) return null;
  
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (result.success && result.data && result.data.url) {
      return result.data.url;
    }
    return null;
  } catch (error) {
    console.error('ImgBB Error:', error);
    return null;
  }
};
