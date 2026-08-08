import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createServerSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";

type AIInterviewResult = {
  score?: number;
  feedback?: string;
  nextQuestion?: string;
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

    const {
      type,
      question,
      answer,
    } = await request.json();

    if (
      !type ||
      !question ||
      !answer ||
      !answer.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Interview data missing",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // GROQ KEY
    // =========================

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "GROQ_API_KEY missing",
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

    // =========================
    // AI EVALUATION
    // =========================

    const response =
      await groq.chat.completions.create({
        model:
          "llama-3.1-8b-instant",

        temperature: 0.3,

        messages: [
          {
            role: "system",

            content: `
You are the AI Interviewer inside AI Engineering Copilot.

The candidate is preparing for engineering placements.

Interview type:
${type}

Evaluate the candidate's answer and generate the next relevant interview question.

Return ONLY valid JSON in exactly this format:

{
  "score": 8,
  "feedback": "Clear structured feedback here",
  "nextQuestion": "Next interview question here"
}

Feedback must include:

What was good:
- point 1
- point 2

What can improve:
- point 1
- point 2

Better answer:
Give a concise interview-ready improved answer.

Rules:

- Score must be from 0 to 10.
- Next question must match the interview type.
- For Technical interviews, ask engineering/coding/CS questions.
- For HR interviews, ask communication, behavioral or placement questions.
- Do not repeat the current question.
- Be practical.
- Be student-friendly.
- Be accurate.
- Do not return markdown code fences.
- Return valid JSON only.
`,
          },

          {
            role: "user",

            content: `
Current Question:
${question}

Candidate Answer:
${answer}
`,
          },
        ],
      });

    const raw =
      response.choices[0]
        ?.message?.content || "";

    const cleaned =
      raw
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    let parsed:
      AIInterviewResult;

    try {
      parsed =
        JSON.parse(cleaned);
    } catch {
      console.log(
        "INVALID INTERVIEW JSON:",
        raw
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "AI returned invalid interview feedback.",
        },
        {
          status: 500,
        }
      );
    }

    const score =
      Math.max(
        0,
        Math.min(
          10,
          Number(parsed.score) || 0
        )
      );

    const feedback =
      typeof parsed.feedback ===
      "string"
        ? parsed.feedback
        : "No feedback generated.";

    const nextQuestion =
      typeof parsed.nextQuestion ===
      "string"
        ? parsed.nextQuestion
        : type === "Technical"
        ? "Explain the difference between an array and a linked list."
        : "Why should we hire you?";

    // =========================
    // USER PROGRESS
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
      .eq("userid", userId)
      .maybeSingle();

    if (progressError) {
      console.log(
        "INTERVIEW PROGRESS READ ERROR:",
        progressError
      );
    }

    if (progress) {
      let newStreak =
        progress.streak || 1;

      const lastDate =
        progress.last_active_date;

      if (lastDate !== today) {
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
            lastDate === yesterdayDate
          ) {
            newStreak =
              (progress.streak || 0) + 1;
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
          streak: newStreak,
          last_active_date: today,
        })
        .eq("userid", userId);

      if (updateError) {
        console.log(
          "INTERVIEW PROGRESS UPDATE ERROR:",
          updateError
        );
      }
    } else {
      const {
        error: insertError,
      } = await supabase
        .from("progress")
        .insert({
          userid: userId,
          coding_count: 0,
          ai_chats: 0,
          resume_score: 0,
          streak: 1,
          last_active_date: today,
        });

      if (insertError) {
        console.log(
          "INTERVIEW PROGRESS INSERT ERROR:",
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
        user_id: userId,
        action:
          `Completed ${type} Interview - ${score}/10`,
      });

    if (activityError) {
      console.log(
        "INTERVIEW ACTIVITY ERROR:",
        activityError
      );
    }

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      success: true,
      score,
      feedback,
      nextQuestion,
    });
  } catch (error: unknown) {
    console.log(
      "INTERVIEW API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Interview evaluation failed",
      },
      {
        status: 500,
      }
    );
  }
}