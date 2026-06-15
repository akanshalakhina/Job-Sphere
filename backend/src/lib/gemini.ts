const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export type GeminiPart =
  | { text: string }
  | { inline_data: { mime_type: string; data: string } };

export interface GeminiMessage {
  role: "user" | "model";
  parts: GeminiPart[];
}

const extractGeminiText = (data: unknown): string => {
  const candidate = (data as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  }).candidates?.[0];
  const text = candidate?.content?.parts?.find((part) => part.text)?.text;

  if (!text) {
    console.error("[Gemini] No text in response:", JSON.stringify(data));
    throw new Error("No response from Gemini");
  }

  return text;
};

const generateContent = async (
  systemPrompt: string,
  contents: GeminiMessage[],
  maxOutputTokens = 800,
): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY not set");
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Gemini] API error (${response.status}):`, errorText);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return extractGeminiText(data);
};

export const callGemini = async (
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[],
): Promise<string> => {
  const geminiContents: GeminiMessage[] = messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  try {
    return await generateContent(systemPrompt, geminiContents);
  } catch (error) {
    console.error("[Gemini] Request failed:", error);
    throw error;
  }
};

export const callGeminiWithInlineFile = async (
  systemPrompt: string,
  prompt: string,
  file: { mimeType: string; data: Buffer },
): Promise<string> => {
  const contents: GeminiMessage[] = [
    {
      role: "user",
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: file.mimeType,
            data: file.data.toString("base64"),
          },
        },
      ],
    },
  ];

  try {
    return await generateContent(systemPrompt, contents, 1200);
  } catch (error) {
    console.error("[Gemini] Inline file request failed:", error);
    throw error;
  }
};

export const isGeminiAvailable = (): boolean => {
  return !!GEMINI_API_KEY;
};
