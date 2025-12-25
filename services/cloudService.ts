
import { Product, Order, OrderStatus } from '../types';

const sanitizeUrl = (url: string): string => {
  return url.trim().replace(/\s/g, '');
};

export const getStoreData = async (scriptUrl: string, sheet: string = "Products"): Promise<any[] | null> => {
  if (!scriptUrl) return null;
  const cleanUrl = sanitizeUrl(scriptUrl);
  try {
    const urlObj = new URL(cleanUrl);
    urlObj.searchParams.set('sheet', sheet);
    urlObj.searchParams.set('_t', Date.now().toString());

    const response = await fetch(urlObj.toString());
    if (!response.ok) throw new Error(`Server returned ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    if (sheet === "Products") {
      return data.map((p: any) => {
        let rawImages = p.image || p.images || '';
        let parsedImages: string[] = [];
        try {
          if (Array.isArray(rawImages)) parsedImages = rawImages;
          else if (typeof rawImages === 'string' && rawImages.trim() !== '') {
            const trimmed = rawImages.trim();
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) parsedImages = JSON.parse(trimmed);
            else if (trimmed.includes(',')) parsedImages = trimmed.split(',').map(s => s.trim());
            else parsedImages = [trimmed];
          }
        } catch (e) { parsedImages = []; }
        return {
          ...p,
          id: String(p.id),
          price: Number(p.price),
          images: parsedImages.length > 0 ? parsedImages : ['https://via.placeholder.com/600x600?text=No+Image']
        };
      });
    }
    return data;
  } catch (error) {
    console.error('Fetch Error:', error);
    return null;
  }
};

export const updateStoreData = async (scriptUrl: string, products: Product[]): Promise<boolean> => {
  if (!scriptUrl) return false;
  try {
    const payload = products.map(p => ({
      ...p,
      image: Array.isArray(p.images) ? p.images.join(',') : String(p.images || '')
    }));
    await fetch(sanitizeUrl(scriptUrl), {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: "sync_products", products: payload }),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const createOrderInCloud = async (scriptUrl: string, order: Order): Promise<boolean> => {
  if (!scriptUrl) return false;
  try {
    await fetch(sanitizeUrl(scriptUrl), {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: "create_order", order }),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const updateOrderStatusInCloud = async (scriptUrl: string, orderId: string, status: OrderStatus): Promise<boolean> => {
  if (!scriptUrl) return false;
  try {
    await fetch(sanitizeUrl(scriptUrl), {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ action: "update_order_status", orderId, status }),
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const uploadImageToImgBB = async (file: File, apiKey: string): Promise<string | null> => {
  const formData = new FormData();
  formData.append('image', file);
  try {
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    return result.data?.url || null;
  } catch (error) { return null; }
};
