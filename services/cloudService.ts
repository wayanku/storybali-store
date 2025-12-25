
import { Product } from '../types';

/**
 * Fungsi untuk mengambil data dari Google Sheets.
 */
export const getStoreData = async (scriptUrl: string): Promise<Product[] | null> => {
  if (!scriptUrl) return null;
  
  try {
    const url = new URL(scriptUrl);
    url.searchParams.set('_t', Date.now().toString()); // Anti-cache

    const response = await fetch(url.toString(), {
      method: 'GET',
      mode: 'cors'
    });

    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    
    if (!Array.isArray(data)) return [];

    return data.map((p: any) => {
      // LOGIKA PARSING GAMBAR YANG SANGAT KUAT
      let rawImages = p.images || p.image || p.gambar || p.Gambar || '';
      let parsedImages: string[] = [];

      try {
        if (Array.isArray(rawImages)) {
          parsedImages = rawImages;
        } else if (typeof rawImages === 'string' && rawImages.trim() !== '') {
          const trimmed = rawImages.trim();
          // Jika formatnya JSON array: ["url1"]
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            parsedImages = JSON.parse(trimmed);
          } else if (trimmed.includes(',')) {
            // Jika formatnya CSV: url1,url2
            parsedImages = trimmed.split(',').map(s => s.trim());
          } else {
            // Jika link tunggal
            parsedImages = [trimmed];
          }
        }
      } catch (e) {
        console.error("Gagal parsing gambar untuk produk:", p.name, e);
        parsedImages = [];
      }

      // Pastikan hanya link http/https yang masuk dan buang string kosong
      parsedImages = parsedImages.filter(img => typeof img === 'string' && img.startsWith('http'));

      if (parsedImages.length === 0) {
        parsedImages = ['https://via.placeholder.com/600x600?text=StoryBali+Store'];
      }

      return {
        ...p,
        id: String(p.id || Date.now()),
        name: String(p.name || 'Produk Tanpa Nama'),
        price: Number(p.price || 0),
        images: parsedImages, // Sekarang dijamin berupa array of strings
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

  try {
    // Pastikan images di-stringify agar muat di satu sel Sheets
    const payload = products.map(p => {
      // Debug log per produk
      console.log(`📦 Memproses data gambar untuk: ${p.name}`, p.images);
      return {
        ...p,
        images: Array.isArray(p.images) ? JSON.stringify(p.images) : p.images
      };
    });

    const response = await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ products: payload }),
    });

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
    console.log("☁️ Mengunggah file ke ImgBB...");
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (result.success && result.data && result.data.url) {
      console.log("✅ Berhasil Upload! URL:", result.data.url);
      return result.data.url;
    }
    console.error("❌ ImgBB Fail:", result);
    return null;
  } catch (error) {
    console.error('ImgBB Error:', error);
    return null;
  }
};
