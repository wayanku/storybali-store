
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getProductEnhancement = async (productName: string, currentDesc: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Anda adalah copywriter e-commerce profesional. Tulis deskripsi produk yang persuasif, menonjolkan fitur utama, dan menggunakan bahasa Indonesia yang menarik untuk "${productName}". Deskripsi aslinya: "${currentDesc}". Maks 100 kata.`,
    });
    return response.text || currentDesc;
  } catch (error) {
    return currentDesc;
  }
};

export const chatWithStoreAssistant = async (history: any[], message: string): Promise<string> => {
  try {
    const ai = getAI();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'Anda adalah StoryBot, asisten virtual dari StoryBali Store. Anda ramah, solutif, dan profesional. Bantu pelanggan menemukan produk terbaik, berikan rekomendasi belanja, dan informasi promo. Jangan gunakan sapaan khusus daerah.',
      }
    });
    const response = await chat.sendMessage({ message });
    return response.text || "Ada lagi yang bisa saya bantu?";
  } catch (error) {
    return "Sistem sedang sibuk, silakan coba lagi nanti.";
  }
};

export const getShoppingLiveTrends = async (): Promise<{text: string, sources: any[]}> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Sebutkan 3 kategori produk e-commerce atau barang yang sedang tren dicari pembeli di Indonesia saat ini.",
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    return {
      text: response.text || "Sedang memuat tren belanja terbaru.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    return { text: "Gagal memuat tren.", sources: [] };
  }
};

export const findNearestServiceCenters = async (lat: number, lng: number): Promise<{text: string, sources: any[]}> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Sebutkan 3 pusat perbelanjaan atau service center gadget terdekat dari lokasi koordinat ini.",
      config: {
        tools: [{googleMaps: {}}],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });
    return {
      text: response.text || "Informasi lokasi tidak tersedia.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    return { text: "Gagal memuat data lokasi.", sources: [] };
  }
};
