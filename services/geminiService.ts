
import { GoogleGenAI, Type } from "@google/genai";

// Always use the named parameter and direct process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getProductEnhancement = async (productName: string, currentDesc: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a poetic copywriter for StoryBali Store. Write a compelling, story-driven product description for "${productName}". The original description is: "${currentDesc}". Make it feel magical and cultural. Keep it under 100 words.`,
    });
    // response.text is a property, not a method.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return currentDesc;
  }
};

export const chatWithStoreAssistant = async (history: { role: string, parts: { text: string }[] }[], message: string) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: 'You are Wayan, the virtual assistant for StoryBali Store. You are friendly, helpful, and knowledgeable about Balinese culture and the artisanal products sold in the shop. You should always maintain a helpful and welcoming tone like a true Balinese host.',
      }
    });
    
    // sendMessage returns GenerateContentResponse
    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "I am sorry, my connection to the island spirits is weak right now. How else can I help you?";
  }
};

export const generateMarketingImage = async (productName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high-end cinematic advertisement for a Balinese product called "${productName}". The setting is a luxury villa in Ubud at sunset, with tropical plants and soft lighting. 4k, professional photography.` }]
      }
    });

    // Iterate through all parts to find the image part as recommended.
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
