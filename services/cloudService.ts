
import { Product } from '../types';

/**
 * Fungsi untuk mengambil data dari Google Sheets.
 * Sekarang mendukung pemetaan kolom otomatis (bahasa Indonesia/Inggris).
 */
export const getStoreData = async (scriptUrl: string): Promise<Product[] | null> => {
  if (!scriptUrl) return null;
  
  try {
    const url = new URL(scriptUrl);
    url.searchParams.set('_t', Date.now().toString());

    const response = await fetch(url.toString(), {
      method: 'GET',
      mode: 'cors'
    });

    if (!response.ok) throw new Error('Gagal mengambil data dari Google Sheets');
    const data = await response.json();
    
    // Pemetaan kolom agar fleksibel (misal di Sheet namanya 'Gambar' bukan 'images')
    const sanitizedData = Array.isArray(data) ? data.map((p: any) => {
      // Normalisasi field dari berbagai kemungkinan nama kolom di Sheets
      const rawImages = p.images || p.image || p.gambar || p.Gambar || p.url_gambar || '';
      const rawName = p.name || p.nama || p.Nama_Produk || 'Produk Tanpa Nama';
      const rawPrice = p.price || p.harga || p.Harga || 0;
      const rawDesc = p.description || p.deskripsi || p.Deskripsi || '';
      const rawCategory = p.category || p.kategori || p.Kategori || 'Umum';
      const rawId = p.id || p.ID || Date.now().toString();

      let parsedImages: string[] = [];

      if (Array.isArray(rawImages)) {
        parsedImages = rawImages;
      } else if (typeof rawImages === 'string' && rawImages.trim() !== '') {
        const trimmed = rawImages.trim();
        // Cek apakah format JSON array: ["url1", "url2"]
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
          try {
            parsedImages = JSON.parse(trimmed);
          } catch (e) {
            parsedImages = trimmed.replace(/[\[\]"]/g, '').split(',').map(s => s.trim());
          }
        } else if (trimmed.includes(',')) {
          // Format CSV: url1, url2
          parsedImages = trimmed.split(',').map(s => s.trim());
        } else {
          // Hanya satu URL
          parsedImages = [trimmed];
        }
      }

      // Pastikan hanya link valid yang masuk
      parsedImages = parsedImages.filter(img => typeof img === 'string' && img.startsWith('http'));

      return {
        ...p, // simpan data asli lainnya
        id: String(rawId),
        name: String(rawName),
        price: Number(rawPrice),
        originalPrice: p.originalPrice || p.harga_coret ? Number(p.originalPrice || p.harga_coret) : undefined,
        images: parsedImages.length > 0 ? parsedImages : ['https://via.placeholder.com/600x600?text=StoryBali+Store'],
        category: String(rawCategory),
        description: String(rawDesc),
        story: String(p.story || p.cerita || ''),
        rating: Number(p.rating || 5),
        soldCount: Number(p.soldCount || p.terjual || 0)
      };
    }) : [];

    return sanitizedData as Product[];
  } catch (error) {
    console.error('Fetch Cloud Data Error:', error);
    return null;
  }
};

/**
 * Mengirim data ke Google Sheets. 
 * Data images dikonversi ke JSON string agar tersimpan utuh di satu sel.
 */
export const updateStoreData = async (scriptUrl: string, products: Product[]): Promise<boolean> => {
  if (!scriptUrl) return false;

  try {
    const payload = products.map(p => ({
      ...p,
      // Penting: simpan images sebagai string agar tidak pecah di kolom Sheets
      images: JSON.stringify(p.images)
    }));

    const response = await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify({ products: payload }),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });

    const result = await response.json();
    return result.status === 'success';
  } catch (error) {
    console.error('Update Cloud Data Error:', error);
    return false;
  }
};

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
    if (result.success) {
      return result.data.url;
    }
    return null;
  } catch (error) {
    console.error('ImgBB Error:', error);
    return null;
  }
};
