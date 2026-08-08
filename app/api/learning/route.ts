import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  extractText,
  getDocumentProxy,
} from "unpdf";

import { createServerSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";

type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
};

type QuizAIResponse = {
  questions?: QuizQuestion[];
};

type Flashcard = {
  front: string;
  back: string;
};

type FlashcardAIResponse = {
  cards?: Flashcard[];
};

export async function POST(request: Request) {
  try {
    // =========================
    // AUTH
    // =========================

    const authHeader =
      request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const token =
      authHeader.replace("Bearer ", "");

    const supabase =
      createServerSupabase(token);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user session",
        },
        {
          status: 401,
        }
      );
    }

    // =========================
    // INPUT
    // =========================

    const formData =
      await request.formData();

    const file =
      formData.get("pdf");

    const question =
      formData
        .get("question")
        ?.toString()
        .trim() || "";

    const mode =
      formData
        .get("mode")
        ?.toString() ||
      "Quick Revision";

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload a PDF.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      file.type &&
      file.type !== "application/pdf"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Only PDF files are supported.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      file.size >
      15 * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PDF is too large. Maximum size is 15 MB.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // PDF EXTRACTION
    // =========================

    const arrayBuffer =
      await file.arrayBuffer();

    const pdf =
      await getDocumentProxy(
        new Uint8Array(arrayBuffer)
      );

    const {
      text,
      totalPages,
    } = await extractText(
      pdf,
      {
        mergePages: true,
      }
    );

    const pdfText =
      typeof text === "string"
        ? text
            .replace(/\u0000/g, "")
            .replace(/\s+/g, " ")
            .trim()
        : "";

    if (!pdfText) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PDF text could not be extracted. Please upload a text-based PDF.",
        },
        {
          status: 400,
        }
      );
    }

    // Keep prompt small for Groq TPM limit
    const MAX_PDF_CHARACTERS =
      12000;

    const material =
      pdfText.slice(
        0,
        MAX_PDF_CHARACTERS
      );

    // =========================
    // GROQ
    // =========================

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "GROQ_API_KEY missing.",
        },
        {
          status: 500,
        }
      );
    }

    const groq =
      new Groq({
        apiKey:
          process.env.GROQ_API_KEY,
      });

    let result = "";

    let quizQuestions:
      QuizQuestion[] = [];

    let flashcards:
      Flashcard[] = [];

    // =========================
    // QUIZ MODE
    // =========================

    if (mode === "Generate Quiz") {
      const quizResponse =
        await groq.chat.completions.create({
          model:
            "llama-3.1-8b-instant",

          temperature: 0.2,

          max_tokens: 1800,

          messages: [
            {
              role: "system",

              content: `
You are the Quiz Engine inside AI Engineering Copilot.

Create a quiz using ONLY the supplied study material.

Return ONLY valid JSON.

Required structure:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0,
      "explanation": "Short explanation"
    }
  ]
}

Rules:
- Create exactly 5 MCQs.
- Each question must have exactly 4 options.
- correctAnswer must be 0, 1, 2 or 3.
- Questions must be based on the supplied material.
- Do not invent unsupported information.
- Avoid duplicate questions.
- Keep explanations short.
- Do not use markdown.
- Do not use code fences.
- Return JSON only.
`,
            },

            {
              role: "user",

              content: `
Student request:
${
  question ||
  "Generate an important revision quiz."
}

Study material:

${material}
`,
            },
          ],
        });

      const raw =
        quizResponse.choices[0]
          ?.message?.content || "";

      const cleaned =
        raw
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

      let parsed:
        QuizAIResponse;

      try {
        parsed =
          JSON.parse(
            cleaned
          );
      } catch {
        console.log(
          "INVALID QUIZ RESPONSE:",
          raw
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Quiz response could not be processed. Please try again.",
          },
          {
            status: 500,
          }
        );
      }

      if (
        !Array.isArray(
          parsed.questions
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Quiz questions were not generated correctly.",
          },
          {
            status: 500,
          }
        );
      }

      quizQuestions =
        parsed.questions
          .filter(
            (
              item
            ): item is QuizQuestion =>
              typeof item.question ===
                "string" &&
              Array.isArray(
                item.options
              ) &&
              item.options.length ===
                4 &&
              item.options.every(
                (option) =>
                  typeof option ===
                  "string"
              ) &&
              Number.isInteger(
                item.correctAnswer
              ) &&
              item.correctAnswer >= 0 &&
              item.correctAnswer <= 3
          )
          .slice(
            0,
            5
          );

      if (
        quizQuestions.length ===
        0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No valid quiz questions were generated.",
          },
          {
            status: 500,
          }
        );
      }

      result =
        `Interactive quiz generated with ${quizQuestions.length} questions.`;
    }

    // =========================
    // FLASHCARD MODE
    // =========================

    else if (
      mode ===
      "Generate Flashcards"
    ) {
      const flashcardResponse =
        await groq.chat.completions.create({
          model:
            "llama-3.1-8b-instant",

          temperature: 0.2,

          max_tokens: 1800,

          messages: [
            {
              role: "system",

              content: `
You are the Flashcard Engine inside AI Engineering Copilot.

Create revision flashcards using ONLY the supplied study material.

Return ONLY valid JSON in exactly this structure:

{
  "cards": [
    {
      "front": "Question or concept",
      "back": "Answer or explanation"
    }
  ]
}

Rules:
- Create exactly 8 flashcards.
- Front should contain a useful question, term, concept or revision prompt.
- Back should contain the correct concise answer or explanation.
- Use only information found in the supplied material.
- Do not invent facts.
- Avoid duplicate cards.
- Keep each answer concise and useful for revision.
- Do not use markdown.
- Do not use code fences.
- Return JSON only.
`,
            },

            {
              role: "user",

              content: `
Student request:
${
  question ||
  "Generate important revision flashcards."
}

Study material:

${material}
`,
            },
          ],
        });

      const raw =
        flashcardResponse
          .choices[0]
          ?.message
          ?.content || "";

      const cleaned =
        raw
          .replace(/```json/gi, "")
          .replace(/```/g, "")
          .trim();

      let parsed:
        FlashcardAIResponse;

      try {
        parsed =
          JSON.parse(
            cleaned
          );
      } catch {
        console.log(
          "INVALID FLASHCARD RESPONSE:",
          raw
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "Flashcard response could not be processed. Please try again.",
          },
          {
            status: 500,
          }
        );
      }

      if (
        !Array.isArray(
          parsed.cards
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Flashcards were not generated correctly.",
          },
          {
            status: 500,
          }
        );
      }

      flashcards =
        parsed.cards
          .filter(
            (
              card
            ): card is Flashcard =>
              typeof card.front ===
                "string" &&
              typeof card.back ===
                "string" &&
              card.front.trim()
                .length > 0 &&
              card.back.trim()
                .length > 0
          )
          .slice(
            0,
            8
          );

      if (
        flashcards.length ===
        0
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No valid flashcards were generated.",
          },
          {
            status: 500,
          }
        );
      }

      result =
        `${flashcards.length} revision flashcards generated.`;
    }

    // =========================
    // NORMAL MODES
    // =========================

    else {
      const modeInstructions:
        Record<string, string> = {
        "Quick Revision": `
Create concise revision notes.

Include:
1. Short summary
2. Important concepts
3. Key definitions
4. Important points
5. Quick revision checklist
`,

        "Exam Answer": `
Prepare an exam-oriented answer.

Include:
1. Definition
2. Explanation
3. Important points
4. Example if relevant
5. Exam-ready conclusion
`,

        "Interview Preparation": `
Prepare interview revision material.

Include:
1. Simple explanation
2. Important interview questions
3. Short model answers
4. Common mistakes
5. Quick revision tips
`,
      };

      const instruction =
        modeInstructions[mode] ||
        modeInstructions[
          "Quick Revision"
        ];

      const aiResponse =
        await groq.chat.completions.create({
          model:
            "llama-3.1-8b-instant",

          temperature: 0.25,

          max_tokens: 1800,

          messages: [
            {
              role: "system",

              content: `
You are the Knowledge Deck AI inside AI Engineering Copilot.

Help engineering students study from uploaded PDF material.

Rules:
- Base the response only on supplied study material.
- Do not invent unsupported facts.
- Explain clearly.
- Use headings and bullet points.
- Keep the response useful and concise.
- If requested information is not available in the material, say so.
`,
            },

            {
              role: "user",

              content: `
Learning mode:
${mode}

Instructions:
${instruction}

Student question:
${
  question ||
  "Generate useful study material."
}

Study material:

${material}
`,
            },
          ],
        });

      result =
        aiResponse.choices[0]
          ?.message?.content ||
        "No learning response generated.";
    }

    // =========================
    // PROGRESS + STREAK
    // =========================

    const userId =
      user.id;

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    const {
      data: progress,
      error: progressError,
    } = await supabase
      .from("progress")
      .select("*")
      .eq(
        "userid",
        userId
      )
      .maybeSingle();

    if (progressError) {
      console.log(
        "LEARNING PROGRESS READ ERROR:",
        progressError
      );
    }

    if (progress) {
      let newStreak =
        progress.streak || 1;

      const lastDate =
        progress.last_active_date;

      if (
        lastDate !== today
      ) {
        if (lastDate) {
          const yesterday =
            new Date();

          yesterday.setDate(
            yesterday.getDate() - 1
          );

          const yesterdayDate =
            yesterday
              .toISOString()
              .split("T")[0];

          if (
            lastDate ===
            yesterdayDate
          ) {
            newStreak =
              (progress.streak ||
                0) + 1;
          } else {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }
      }

      const {
        error: updateError,
      } = await supabase
        .from("progress")
        .update({
          streak:
            newStreak,

          last_active_date:
            today,
        })
        .eq(
          "userid",
          userId
        );

      if (updateError) {
        console.log(
          "LEARNING PROGRESS UPDATE ERROR:",
          updateError
        );
      }
    } else {
      const {
        error: insertError,
      } = await supabase
        .from("progress")
        .insert({
          userid:
            userId,

          coding_count:
            0,

          ai_chats:
            0,

          resume_score:
            0,

          streak:
            1,

          last_active_date:
            today,
        });

      if (insertError) {
        console.log(
          "LEARNING PROGRESS INSERT ERROR:",
          insertError
        );
      }
    }

    // =========================
    // ACTIVITY
    // =========================

    const {
      error: activityError,
    } = await supabase
      .from("activities")
      .insert({
        user_id:
          userId,

        action:
          `Used Knowledge Deck - ${mode}`,
      });

    if (activityError) {
      console.log(
        "LEARNING ACTIVITY ERROR:",
        activityError
      );
    }

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      success: true,

      result,

      quizQuestions,

      flashcards,

      metadata: {
        fileName:
          file.name,

        pages:
          totalPages,

        mode,

        processedCharacters:
          material.length,
      },
    });
  } catch (error: unknown) {
    console.log(
      "LEARNING API ERROR:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Learning AI failed.";

    if (
      message.includes(
        "Request too large"
      ) ||
      message.includes(
        "tokens per minute"
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PDF content is too large for the current AI limit. Please try a smaller PDF.",
        },
        {
          status: 413,
        }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}