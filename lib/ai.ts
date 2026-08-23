import { GoogleGenAI } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview";

export const MAX_JOB_DESCRIPTION_LENGTH = 10000;

function client() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
}

export async function askAIJSON<T>(system: string, userPrompt: string): Promise<T> {
  const response = await client().models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: system,
      maxOutputTokens: 4096,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("AI returned no text content");
  }
  const jsonText = extractJson(text);

  try {
    return JSON.parse(jsonText) as T;
  } catch {
    throw new Error("AI's response wasn't valid JSON");
  }
}

export async function askAIText(system: string, userPrompt: string): Promise<string> {
  const response = await client().models.generateContent({
    model: MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: system,
      maxOutputTokens: 4096,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("AI returned no text content");
  }
  return text.trim();
}
