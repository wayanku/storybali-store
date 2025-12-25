
import { GoogleGenAI } from "@google/genai";

export const getProductEnhancement = async (productName: string, currentDesc: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Anda adalah copywriter puitis untuk StoryBali Store. Tulis deskripsi produk yang memikat, berbasis cerita, dan menggunakan bahasa Indonesia yang indah untuk "${productName}". Deskripsi aslinya adalah: "${currentDesc}". Buat pembaca merasakan keajaiban dan budaya Bali. Tetap di bawah 100 kata.`,
    });
    return response.text || currentDesc;
  } catch (error) {
    console.error("Gemini Error:", error);
    return currentDesc;
  }
};

export const chatWithStoreAssistant = async (history: any[], message: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'Anda adalah Bli Wayan, asisten virtual ramah dari StoryBali Store. Anda harus selalu menyapa dengan "Om Swastiastu" di awal percakapan jika baru mulai, dan menggunakan bahasa Indonesia yang santun, hangat, dan mengenal budaya Bali. Anda membantu pelanggan menemukan kerajinan tangan terbaik Bali.',
      }
    });
    const response = await chat.sendMessage({ message });
    return response.text || "Mohon maaf, koneksi saya sedang terganggu oleh roh halus. Bisa ulangi kembali?";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Mohon maaf, Bli Wayan sedang sibuk. Ada yang bisa saya bantu lainnya?";
  }
};

export const generateMarketingImage = async (productName: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A ultra-luxury cinematic advertisement for a Balinese artisan product called "${productName}". The scene is set in a premium Ubud jungle resort at golden hour, with tropical greenery, soft warm lighting, and shallow depth of field. 8k resolution, professional commercial photography, high-end lifestyle style.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
  } catch (error) {
    console.error("Image Generation Error:", error);
  }
  return null;
};
