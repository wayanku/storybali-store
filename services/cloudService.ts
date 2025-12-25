
import { Product } from '../types';

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
    
    // Parsing data yang aman
    const sanitizedData = Array.isArray(data) ? data.map((p: any) => {
      let parsedImages: string[] = [];
      try {
        // Handle if images is already array or still JSON string from Sheets
        parsedImages = Array.isArray(p.images) 
          ? p.images 
          : (typeof p.images === 'string' ? JSON.parse(p.images) : []);
      } catch (e) {
        // Fallback jika parsing JSON gagal (misal isinya cuma 1 URL string biasa)
        parsedImages = typeof p.images === 'string' && p.images ? [p.images] : [];
      }

      return {
        ...p,
        id: String(p.id),
        price: Number(p.price || 0),
        originalPrice: p.originalPrice ? Number(p.originalPrice) : undefined,
        images: parsedImages.filter(img => typeof img === 'string' && img.startsWith('http')),
        rating: Number(p.rating || 5),
        soldCount: Number(p.soldCount || 0)
      };
    }) : [];

    return sanitizedData as Product[];
  } catch (error) {
    console.error('Fetch Cloud Data Error:', error);
    return null;
  }
};

export const updateStoreData = async (scriptUrl: string, products: Product[]): Promise<boolean> => {
  if (!scriptUrl) return false;

  try {
    // Pastikan images dikirim sebagai JSON string agar aman di kolom Google Sheets
    const payload = products.map(p => ({
      ...p,
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
