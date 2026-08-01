import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "Resume PDF upload karo." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        { error: "Sirf PDF file upload karo." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { error: "PDF ka size 10 MB se kam rakho." },
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

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
You are an expert ATS resume reviewer and technical recruiter.

Analyze the attached engineering student's resume.

Return:

ATS SCORE: number out of 100

SUMMARY:
Short overall review.

STRONG POINTS:
- Points

MISSING OR WEAK SKILLS:
- Points

PROBLEMS:
- Points

IMPROVEMENT SUGGESTIONS:
- Points

RECOMMENDED KEYWORDS:
- Keywords

Do not invent any skill, project, education, or experience.
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
        response.text || "Resume analysis generate nahi hua.",
    });
  } catch (error) {
    console.error("RESUME API ERROR:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown resume error";

    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}