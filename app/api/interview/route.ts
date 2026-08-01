import { GoogleGenAI } from "@google/genai";

type InterviewFeedback = {
  score: number;
  feedback: string;
  strongPoints: string[];
  missingPoints: string[];
  betterAnswer: string;
  nextQuestion: string;
};

function cleanJson(text: string) {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

export async function POST(request: Request) {
  try {
    const { role, interviewType, question, answer } =
      await request.json();

    if (!role || !interviewType) {
      return Response.json(
        { error: "Role aur interview type required hai." },
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

    // New question generate karna
    if (!answer) {
      const prompt = `
You are an expert interviewer.

Candidate role: ${role}
Interview type: ${interviewType}

Ask exactly one suitable interview question.
Return only the question without numbering, headings, markdown, or extra explanation.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
      });

      return Response.json({
        question:
          response.text?.trim() ||
          "Tell me about yourself and your technical skills.",
      });
    }

    // Candidate answer evaluate karna
    const feedbackPrompt = `
You are an expert technical and HR interviewer.

Candidate role: ${role}
Interview type: ${interviewType}
Question: ${question}
Candidate answer: ${answer}

Evaluate the candidate honestly.

Return ONLY valid JSON in exactly this structure:

{
  "score": 7,
  "feedback": "Short overall feedback",
  "strongPoints": [
    "Strong point 1",
    "Strong point 2"
  ],
  "missingPoints": [
    "Missing point 1",
    "Missing point 2"
  ],
  "betterAnswer": "A complete interview-ready improved answer",
  "nextQuestion": "One suitable next interview question"
}

Rules:
- score must be a number from 0 to 10
- do not include markdown
- do not include code fences
- do not add text outside JSON
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: feedbackPrompt,
    });

    const rawText = response.text || "";
    const cleanedText = cleanJson(rawText);

    let feedback: InterviewFeedback;

    try {
      feedback = JSON.parse(cleanedText) as InterviewFeedback;
    } catch {
      console.error("Invalid interview JSON:", rawText);

      return Response.json(
        {
          error:
            "AI feedback format read nahi ho paya. Dobara submit karo.",
        },
        { status: 500 }
      );
    }

    return Response.json({ feedback });
  } catch (error) {
    console.error("Interview API error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unknown interview error";

    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}