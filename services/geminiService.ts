
import { GoogleGenAI } from "@google/genai";

// Fix: Removed the local process declaration to follow strict instructions. 
// The SDK assumes process.env.API_KEY is available globally in the execution context.

export const getProductEnhancement = async (productName: string, currentDesc: string): Promise<string> => {
  try {
    // Fix: Initialized with named parameters and directly used process.env.API_KEY.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a poetic copywriter for StoryBali Store. Write a compelling, story-driven product description for "${productName}". The original description is: "${currentDesc}". Make it feel magical and cultural. Keep it under 100 words.`,
    });
    // Fix: Accessed .text property directly as it is not a method.
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
        systemInstruction: 'You are Wayan, the virtual assistant for StoryBali Store. You are friendly, helpful, and knowledgeable about Balinese culture and the artisanal products sold in the shop. You should always maintain a helpful and welcoming tone like a true Balinese host.',
      }
    });
    
    // Fix: Used the correct sendMessage method signature for Gemini Chat.
    const response = await chat.sendMessage({ message });
    // Fix: Accessed .text property directly.
    return response.text || "I am sorry, my connection to the island spirits is weak right now.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I am sorry, I am having trouble connecting. How else can I help you?";
  }
};

export const generateMarketingImage = async (productName: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Fix: Using the correct model gemini-2.5-flash-image for image generation tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `A high-end cinematic advertisement for a Balinese product called "${productName}". The setting is a luxury villa in Ubud at sunset, with tropical plants and soft lighting. 4k, professional photography.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        // Fix: Properly iterated through parts to find and extract inlineData for image generation.
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
