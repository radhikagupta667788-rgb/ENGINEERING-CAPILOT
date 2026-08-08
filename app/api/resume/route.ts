import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  extractText,
  getDocumentProxy,
} from "unpdf";

import { createServerSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";

type ATSResult = {
  score?: number;
  summary?: string;
  strengths?: string[];
  missingSkills?: string[];
  improvements?: string[];
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
          error: "Invalid user session.",
        },
        {
          status: 401,
        }
      );
    }

    // =========================
    // RESUME FILE
    // =========================

    const formData =
      await request.formData();

    const file =
      formData.get("resume");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please upload a resume PDF.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      file.type !== "application/pdf"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Only PDF resumes are supported.",
        },
        {
          status: 400,
        }
      );
    }

    // Maximum 10 MB
    if (
      file.size >
      10 * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Resume PDF is too large. Maximum size is 10 MB.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // EXTRACT REAL PDF TEXT
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

    const resumeText =
      typeof text === "string"
        ? text
            .replace(
              /\u0000/g,
              ""
            )
            .trim()
        : "";

    if (!resumeText) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Resume text could not be extracted. Please upload a text-based PDF.",
        },
        {
          status: 400,
        }
      );
    }

    // Prevent huge prompts
    const resumeForAI =
      resumeText.slice(
        0,
        18000
      );

    // =========================
    // GROQ
    // =========================

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "GROQ_API_KEY missing.",
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

    const response =
      await groq.chat.completions.create({
        model:
          "llama-3.1-8b-instant",

        temperature: 0.2,

        messages: [
          {
            role: "system",

            content: `
You are the Career Scanner inside AI Engineering Copilot.

You are an ATS resume analyzer for engineering students and early-career software candidates.

Analyze ONLY the resume text provided.

Return ONLY valid JSON in exactly this structure:

{
  "score": 70,
  "summary": "Short ATS assessment",
  "strengths": [
    "Strength 1",
    "Strength 2",
    "Strength 3"
  ],
  "missingSkills": [
    "Missing skill 1",
    "Missing skill 2",
    "Missing skill 3"
  ],
  "improvements": [
    "Improvement 1",
    "Improvement 2",
    "Improvement 3"
  ]
}

Evaluate:

- ATS readability
- Resume structure
- Technical skills
- Programming languages
- DSA / CS fundamentals
- Frameworks and tools
- Projects
- Internships or experience
- Education
- Certifications
- Action verbs
- Quantified achievements
- Relevant engineering keywords
- Placement readiness

Scoring:

0-30 = major problems
31-50 = weak resume
51-70 = average / needs improvement
71-85 = strong resume
86-100 = excellent ATS-friendly resume

Rules:

- Score must be between 0 and 100.
- Do not invent experience or skills.
- Base feedback only on the resume.
- Give specific practical suggestions.
- Do not return markdown.
- Do not return code fences.
- Return JSON only.
`,
          },

          {
            role: "user",

            content: `
Resume File:
${file.name}

PDF Pages:
${totalPages}

Extracted Resume Text:

================ RESUME START ================

${resumeForAI}

================ RESUME END ==================

Analyze the resume and return the ATS JSON.
`,
          },
        ],
      });

    // =========================
    // AI RESPONSE
    // =========================

    const raw =
      response.choices[0]
        ?.message?.content || "";

    const cleaned =
      raw
        .replace(
          /```json/gi,
          ""
        )
        .replace(
          /```/g,
          ""
        )
        .trim();

    let parsedResult:
      ATSResult;

    try {
      parsedResult =
        JSON.parse(
          cleaned
        );
    } catch {
      console.log(
        "INVALID ATS JSON:",
        raw
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "AI returned an invalid ATS response.",
        },
        {
          status: 500,
        }
      );
    }

    // =========================
    // SCORE
    // =========================

    const score =
      Math.max(
        0,
        Math.min(
          100,
          Number(
            parsedResult.score
          ) || 0
        )
      );

    const userId =
      user.id;

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    // =========================
    // READ USER PROGRESS
    // =========================

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
        "RESUME PROGRESS ERROR:",
        progressError
      );
    }

    // =========================
    // STREAK
    // =========================

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
            newStreak =
              1;
          }
        } else {
          newStreak =
            1;
        }
      }

      const {
        error: updateError,
      } = await supabase
        .from("progress")
        .update({
          resume_score:
            score,

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
          "RESUME PROGRESS UPDATE ERROR:",
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
            score,

          streak:
            1,

          last_active_date:
            today,
        });

      if (insertError) {
        console.log(
          "RESUME PROGRESS INSERT ERROR:",
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
          `Career Scanner - ATS ${score}%`,
      });

    if (activityError) {
      console.log(
        "RESUME ACTIVITY ERROR:",
        activityError
      );
    }

    // =========================
    // FINAL RESPONSE
    // =========================

    return NextResponse.json({
      success: true,

      result: {
        score,

        summary:
          typeof parsedResult.summary ===
          "string"
            ? parsedResult.summary
            : "",

        strengths:
          Array.isArray(
            parsedResult.strengths
          )
            ? parsedResult.strengths
            : [],

        missingSkills:
          Array.isArray(
            parsedResult.missingSkills
          )
            ? parsedResult.missingSkills
            : [],

        improvements:
          Array.isArray(
            parsedResult.improvements
          )
            ? parsedResult.improvements
            : [],
      },
    });
  } catch (error: unknown) {
    console.log(
      "RESUME ROUTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Resume analysis failed.",
      },
      {
        status: 500,
      }
    );
  }
}