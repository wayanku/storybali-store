
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
        'Content-Type': 'text/plain;charset=utf-8', // Google Script requires this for CORS sometimes
      },
    });
    const result = await response.json();
    return result.status === 'success';
  } catch (error) {
    console.error('Update Error:', error);
    return false;
  }
};
