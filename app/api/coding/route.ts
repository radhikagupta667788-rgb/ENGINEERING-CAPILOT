import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const {
      code,
      language,
      mode,
    } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Gemini API key missing hai." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const prompt = `
You are an expert coding assistant.

Language:
${language}

Mode:
${mode}

Code:
${code}

Give response according to mode.

If Debug:
- Find errors
- Explain issue
- Give fixed code

If Explain:
- Explain line by line
- Give example

If Optimize:
- Improve code
- Give time complexity
- Give space complexity

If Test Cases:
- Generate input/output test cases

Keep answer clear for engineering students.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: prompt,
    });

    return Response.json({
      result:
        response.text ||
        "No response generated",
    });

  } catch (error) {

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      },
      {
        status: 500,
      }
    );
  }
}