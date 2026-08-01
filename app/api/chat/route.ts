import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body.message;

    if (!message || typeof message !== "string") {
      return Response.json(
        { error: "Message required hai." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Gemini API key missing hai." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
     model: "gemini-3.1-flash-lite",
      contents: message,
    });

    return Response.json({
      reply: response.text || "AI se response nahi mila.",
    });
  } catch (error) {
    console.error("Gemini API error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown Gemini error";

    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}