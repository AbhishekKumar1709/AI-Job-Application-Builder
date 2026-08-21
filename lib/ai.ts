import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5";

function client() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  return new Anthropic({ apiKey });
}

function firstTextBlock(content: Anthropic.ContentBlock[]): string {
  const block = content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Claude returned no text content");
  }
  return block.text;
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
}

export async function askClaudeJSON<T>(system: string, userPrompt: string): Promise<T> {
  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = firstTextBlock(response.content);
  const jsonText = extractJson(text);

  try {
    return JSON.parse(jsonText) as T;
  } catch {
    throw new Error("Claude's response wasn't valid JSON");
  }
}

export async function askClaudeText(system: string, userPrompt: string): Promise<string> {
  const response = await client().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: userPrompt }],
  });

  return firstTextBlock(response.content).trim();
}
