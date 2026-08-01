import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("pdf");
    const question = formData.get("question");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "PDF upload karo." },
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

    const bytes = await file.arrayBuffer();

    const pdfBase64 = Buffer.from(bytes).toString("base64");

    const ai = new GoogleGenAI({
      apiKey,
    });

    const prompt = `
You are an AI study assistant.

Analyze this PDF and help the student.

If question is provided, answer it from the PDF.

If no question is provided, create:

1. Summary
2. Important Topics
3. Key Points
4. 5 Practice Questions

Question:
${question || "Generate notes"}

Give a clear engineering student friendly answer.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    return Response.json({
      result:
        response.text ||
        "AI response generate nahi hua.",
    });
  } catch (error) {
    console.error("Learning API Error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong.",
      },
      {
        status: 500,
      }
    );
  }
}