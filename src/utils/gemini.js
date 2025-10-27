// file: src/utils/gemini.js
import { GoogleGenAI, Type } from "@google/genai";

let ai;

const getAI = () => {
    if (!ai) {
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
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
      description: "The task's priority. Must be one of: 'high', 'normal', or 'low'. Infer from words like 'urgent' or 'important'.",
    },
    due: {
      type: Type.STRING,
      description: "The task's due date in YYYY-MM-DD format. If the user says 'tomorrow' or 'next monday', calculate the correct date. Return null if no date is specified.",
    },
    reminder: {
        type: Type.STRING,
        description: "If the user asks for a reminder (e.g., 'remind me'), describe the request here (e.g., 'email reminder'). Otherwise, return null.",
    },
  },
  required: ['text', 'priority', 'due'],
};


export const getTaskDetailsFromTranscript = async (transcript) => {
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
        return JSON.parse(jsonText);
    }
    return null;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return null;
  }
};