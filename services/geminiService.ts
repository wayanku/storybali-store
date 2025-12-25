
import { GoogleGenAI } from "@google/genai";

export const getProductEnhancement = async (productName: string, currentDesc: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Anda adalah copywriter e-commerce global profesional untuk StoryStore. Tulis deskripsi produk yang persuasif, menonjolkan fitur utama, dan menggunakan bahasa Indonesia yang elegan dan modern untuk "${productName}". Deskripsi aslinya adalah: "${currentDesc}". Buat pembaca merasa produk ini adalah solusi terbaik untuk gaya hidup mereka. Tetap di bawah 80 kata.`,
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
        systemInstruction: 'Anda adalah Aira, asisten belanja virtual pintar dari StoryStore. Anda sangat ahli dalam tren teknologi, fashion global, dan lifestyle. Sapa pelanggan dengan ramah secara profesional (misal: "Halo! Selamat datang di StoryStore"). Bantu mereka membandingkan produk, memberikan rekomendasi hadiah, atau menjawab pertanyaan teknis tentang barang di toko kami dengan bahasa yang cerdas dan efisien.',
      }
    });
    const response = await chat.sendMessage({ message });
    return response.text || "Mohon maaf, sistem asisten sedang dalam pemeliharaan singkat. Ada yang bisa saya bantu lainnya?";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Maaf, koneksi saya terputus. Bisa Anda ulangi pertanyaannya?";
  }
};

export const generateMarketingImage = async (productName: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A clean, professional minimalist commercial photography for "${productName}". Studio lighting, neutral grey background, high-end commercial aesthetic, 8k resolution, sharp focus.` }]
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
