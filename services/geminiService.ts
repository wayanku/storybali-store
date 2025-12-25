
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client with the provided API key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Enhance product descriptions using Gemini
export const getProductEnhancement = async (productName: string, currentDesc: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Anda adalah copywriter senior untuk marketplace besar. Tulis deskripsi produk yang sangat persuasif, SEO friendly, dan elegan untuk "${productName}". Deskripsi asli: "${currentDesc}". Gunakan bullet points untuk fitur utama. Maks 150 kata.`,
    });
    return response.text || currentDesc;
  } catch (error) {
    return currentDesc;
  }
};

// Chat with virtual store assistant
export const chatWithStoreAssistant = async (history: any[], message: string): Promise<string> => {
  try {
    const ai = getAI();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `Anda adalah 'StoryAdvisor', asisten belanja cerdas dari StoryBali Store. 
        Tugas Anda:
        1. Bantu pengguna mencari produk (Elektronik, Fashion, Gadget, dll).
        2. Berikan saran belanja berdasarkan tren terbaru di Indonesia.
        3. Jawab pertanyaan tentang garansi, pengiriman, dan stok dengan ramah dan profesional.
        4. Jika ditanya soal Bali, jelaskan bahwa meskipun namanya StoryBali, toko ini adalah marketplace umum nasional yang mengutamakan kualitas.
        Gunakan bahasa Indonesia yang santun tapi modern.`,
      }
    });
    const response = await chat.sendMessage({ message });
    return response.text || "Mohon maaf, saya sedang memproses informasi. Ada lagi yang bisa saya bantu?";
  } catch (error) {
    return "Ada gangguan koneksi, tapi saya tetap di sini untuk Anda!";
  }
};

// Get viral shopping trends using Google Search grounding
export const getShoppingLiveTrends = async (): Promise<{text: string, sources: any[]}> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Berikan update 3 tren belanja online paling viral di Indonesia minggu ini. Fokus pada barang elektronik, gadget, atau fashion.",
      config: {
        tools: [{googleSearch: {}}],
      },
    });
    return {
      text: response.text || "Gagal memuat tren terbaru.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    return { text: "Tren belanja sedang diperbarui.", sources: [] };
  }
};

/**
 * findNearestServiceCenters finds physical service locations using Google Maps grounding.
 * Maps grounding is supported in Gemini 2.5 series models.
 */
export const findNearestServiceCenters = async (lat?: number, lng?: number): Promise<{text: string, sources: any[]}> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-latest",
      contents: "Sebutkan 3 lokasi service center resmi gadget atau elektronik terkemuka di Indonesia.",
      config: {
        tools: [{googleMaps: {}}],
        toolConfig: {
          retrievalConfig: {
            latLng: (lat !== undefined && lng !== undefined) ? { latitude: lat, longitude: lng } : undefined
          }
        }
      },
    });
    return {
      text: response.text || "Informasi layanan servis tidak tersedia.",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (error) {
    return { text: "Gagal memuat informasi layanan terdekat.", sources: [] };
  }
};
