
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
          // Jika formatnya JSON array: ["url1","url2"]
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

      // Filter link valid
      parsedImages = parsedImages.filter(img => typeof img === 'string' && img.startsWith('http'));

      if (parsedImages.length === 0) {
        parsedImages = ['https://via.placeholder.com/600x600?text=StoryBali+Store'];
      }

      return {
        ...p,
        id: String(p.id || Date.now()),
        name: String(p.name || 'Produk Tanpa Nama'),
        price: Number(p.price || 0),
        images: parsedImages,
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
    // FORMAT BARU: Gunakan pemisah koma (CSV) daripada JSON string agar aman di Google Sheets
    const payload = products.map(p => {
      const imagesString = Array.isArray(p.images) ? p.images.join(',') : p.images;
      console.log(`📦 Menyiapkan link gambar untuk ${p.name}:`, imagesString);
      return {
        ...p,
        images: imagesString
      };
    });

    // Gunakan mode no-cors dengan Content-Type text/plain 
    // agar permintaan diklasifikasikan sebagai 'simple request' dan menghindari kegagalan preflight CORS.
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain', 
      },
      body: JSON.stringify({ products: payload }),
    });

    // Karena mode no-cors, kita tidak bisa membaca body respon, 
    // tapi kita asumsikan berhasil jika tidak ada error lemparan.
    console.log("✅ Permintaan sinkronisasi telah dikirim ke Google Sheets.");
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
