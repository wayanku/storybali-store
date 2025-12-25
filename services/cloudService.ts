
import { Product } from '../types';

export const getStoreData = async (scriptUrl: string): Promise<Product[] | null> => {
  try {
    const response = await fetch(scriptUrl);
    if (!response.ok) throw new Error('Gagal mengambil data dari Google Script');
    const data = await response.json();
    return data as Product[];
  } catch (error) {
    console.error('Fetch Error:', error);
    return null;
  }
};

export const updateStoreData = async (scriptUrl: string, products: Product[]): Promise<boolean> => {
  try {
    const response = await fetch(scriptUrl, {
      method: 'POST',
      body: JSON.stringify({ products }),
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
    });
    const result = await response.json();
    return result.status === 'success';
  } catch (error) {
    console.error('Update Error:', error);
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
    if (result.success) {
      return result.data.url;
    }
    throw new Error(result.error?.message || 'Gagal unggah ke ImgBB');
  } catch (error) {
    console.error('ImgBB Error:', error);
    return null;
  }
};
