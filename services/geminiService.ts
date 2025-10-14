import { GoogleGenAI } from "@google/genai";

// FIX: Initialize the GoogleGenAI client directly with the provided API key.
// `process.env.API_KEY` is not available in a static browser environment.
const apiKey = 'AIzaSyA6e-qTczHwNel7fHrUP6I1sMbhVLqVqNI';
const ai = new GoogleGenAI({ apiKey });

export const generatePostContent = async (prompt: string): Promise<string> => {
  // FIX: Removed redundant API_KEY check.
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a short, engaging social media post based on this topic: "${prompt}". Keep it under 280 characters. Include relevant hashtags.`,
       config: {
        temperature: 0.7,
        topP: 1,
        topK: 1,
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 50 }
      }
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    return "Sorry, I couldn't come up with anything right now.";
  }
};

export const generateChatReply = async (conversationHistory: string): Promise<string> => {
    // FIX: Removed redundant API_KEY check.
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `You are a person in a direct message chat. Based on the last message, write a short, casual reply. Conversation so far: \n${conversationHistory}`,
            config: {
                temperature: 0.8,
                maxOutputTokens: 50,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating chat reply with Gemini:", error);
        return "Hmm, not sure what to say.";
    }
};

export const generateImageFromText = async (prompt: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A photorealistic image based on the following social media post: "${prompt}"`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    return null;

  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    return null;
  }
};