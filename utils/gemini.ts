import { GoogleGenAI, Type, Part, Modality } from "@google/genai";
import { Priority } from "../types";

// Keep a single instance of the AI client
let ai: GoogleGenAI | null = null;
const getAI = () => {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    }
    return ai;
}

interface TaskDetails {
  text: string;
  priority: Priority;
  due: string | null;
}

const taskSchema = {
  type: Type.OBJECT,
  properties: {
    text: {
      type: Type.STRING,
      description: 'The main action or description of the task. Should be concise and clear.',
    },
    priority: {
      type: Type.STRING,
      description: "The task's priority. Must be one of: 'high', 'normal', or 'low'. Infer from words like 'urgent' or 'important'. Defaults to 'normal' if not specified.",
    },
    due: {
      type: Type.STRING,
      description: "The task's due date in YYYY-MM-DD format. If the user says 'tomorrow' or 'next monday', calculate the correct date based on the current date. Return null if no date is specified.",
    },
  },
  required: ['text'],
};


export const getTaskDetailsFromTranscript = async (transcript: string): Promise<TaskDetails | null> => {
  const model = getAI();
  const prompt = `Analyze the following user request and extract the task details into the specified JSON format.
The current date is ${new Date().toISOString()}.
For the 'due' field, if the user mentions a specific time of day, ignore it and only return the date in YYYY-MM-DD format.
For the 'priority' field, default to 'normal' if not explicitly or implicitly mentioned.

User request: "${transcript}"`;

  try {
    const response = await model.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: taskSchema,
        },
    });

    const jsonText = response.text.trim();
    if (jsonText) {
        return JSON.parse(jsonText) as TaskDetails;
    }
    return null;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return null;
  }
};

const fileToGenerativePart = async (file: File): Promise<Part> => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

// Define types for actions and results
export type ImageAction = 'TRANSCRIBE' | 'ENHANCE' | 'ANALYZE_FOOD' | 'IDENTIFY_OBJECT' | 'GENERAL_INFO';

export interface Suggestion {
    label: string;
    action: ImageAction;
}

export interface ActionResult {
    type: 'text' | 'image';
    data: string; // text content or base64 image data
}

// Schema for structured suggestions from Gemini
const suggestionsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            label: {
                type: Type.STRING,
                description: 'A short, user-facing label for the suggested action button. E.g., "Transcribe Text". Must be concise.'
            },
            action: {
                type: Type.STRING,
                description: "An identifier for the action from the following list: 'TRANSCRIBE', 'ENHANCE', 'ANALYZE_FOOD', 'IDENTIFY_OBJECT', 'GENERAL_INFO'."
            }
        },
        required: ['label', 'action']
    }
};

export const analyzeImageWithSuggestions = async (imageFile: File): Promise<Suggestion[] | null> => {
    const ai = getAI();
    const model = 'gemini-2.5-flash';

    const imagePart = await fileToGenerativePart(imageFile);
    const promptPart = {
        text: `Analyze this image and provide a list of intelligent and helpful action suggestions based on its content. Return the suggestions as a JSON array adhering to the provided schema. Be creative and context-aware.
Examples of suggestions:
- For a document: { "label": "Transcribe Text", "action": "TRANSCRIBE" }
- For a blurry photo: { "label": "Enhance Quality", "action": "ENHANCE" }
- For a food label: { "label": "Analyze Nutrition", "action": "ANALYZE_FOOD" }
- For a product or device: { "label": "Identify Item", "action": "IDENTIFY_OBJECT" }
- For a landmark or location: { "label": "Tell Me About This", "action": "GENERAL_INFO" }
- Always provide at least 2-3 relevant suggestions.`
    };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [promptPart, imagePart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: suggestionsSchema,
            },
        });
        const jsonText = response.text.trim();
        if (jsonText) {
            return JSON.parse(jsonText) as Suggestion[];
        }
        return null;
    } catch (error) {
        console.error("Gemini image suggestion failed:", error);
        return null;
    }
};

export const performImageAction = async (imageFile: File, action: ImageAction): Promise<ActionResult | null> => {
    const ai = getAI();
    const imagePart = await fileToGenerativePart(imageFile);
    let prompt: string;
    let modelName = 'gemini-2.5-flash';

    switch (action) {
        case 'TRANSCRIBE':
            prompt = "Transcribe all visible text in this image accurately. Return only the transcribed text.";
            break;
        case 'ENHANCE':
            // Enhancement requires the image model
            modelName = 'gemini-2.5-flash-image';
            prompt = "Enhance and upscale this photo, making it sharper, clearer, and improving the lighting and color balance. Make it look like a high-quality photograph.";
            try {
                const response = await ai.models.generateContent({
                    model: modelName,
                    contents: { parts: [{ text: prompt }, imagePart] },
                    config: {
                        responseModalities: [Modality.IMAGE],
                    },
                });
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        return { type: 'image', data: part.inlineData.data };
                    }
                }
                return null;
            } catch(error) {
                console.error(`Gemini action '${action}' failed:`, error);
                return { type: 'text', data: "Sorry, I couldn't enhance the image. Please try another action." };
            }
        case 'ANALYZE_FOOD':
            prompt = "This is a food label. Analyze its ingredients. List any common allergens (like nuts, gluten, dairy) you find. Provide a simple summary of its nutritional value and comment on whether it's generally considered a healthy option for children. Format your response in clear, easy-to-read markdown.";
            break;
        case 'IDENTIFY_OBJECT':
            prompt = "Identify the main object, product, or device in this image. Provide its common name, a brief description, and what it's typically used for. If it's a specific model, try to identify that too.";
            break;
        case 'GENERAL_INFO':
        default:
            prompt = "Tell me about this image. What is it, what's happening, or what's interesting about it? Provide a concise summary.";
            break;
    }

    // Default text-based generation for actions other than ENHANCE
    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts: [{ text: prompt }, imagePart] },
        });
        return { type: 'text', data: response.text };
    } catch (error) {
        console.error(`Gemini action '${action}' failed:`, error);
        return { type: 'text', data: `Sorry, I couldn't complete the action. Please try again.` };
    }
};
