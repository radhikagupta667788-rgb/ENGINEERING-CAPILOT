import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createServerSupabase } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // =========================
    // AUTH TOKEN
    // =========================

    const authHeader =
      request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Please login first.",
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
    // QUESTION
    // =========================

    const contentType =
      request.headers.get("content-type") || "";

    let question = "";

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      const body =
        await request.json();

      question =
        body.question ||
        body.message ||
        "";
    } else {
      const formData =
        await request.formData();

      question =
        formData
          .get("question")
          ?.toString() ||
        formData
          .get("message")
          ?.toString() ||
        "";
    }

    if (!question.trim()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please ask a question.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // CHECK GROQ KEY
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

    // =========================
    // GROQ AI
    // =========================

    const groq =
      new Groq({
        apiKey:
          process.env.GROQ_API_KEY,
      });

    const response =
      await groq.chat.completions.create({
        model:
          "llama-3.1-8b-instant",

        temperature: 0.3,

        messages: [
          {
            role: "system",

            content: `
You are the Neural Guide inside AI Engineering Copilot.

You help engineering students with:

- Java
- Data Structures and Algorithms
- SQL
- DBMS
- Operating Systems
- Computer Networks
- Machine Learning
- Software Projects
- Placement Preparation
- Interview Preparation

Rules:

- Explain clearly.
- Explain step by step when needed.
- Use simple examples.
- Give code when useful.
- Keep answers practical for engineering students.
- If the user gives code, explain or debug it carefully.
`,
          },

          {
            role: "user",
            content:
              question.trim(),
          },
        ],
      });

    const answer =
      response.choices[0]
        ?.message?.content ||
      "No response generated.";

    const userId =
      user.id;

    // =========================
    // TODAY
    // =========================

    const today =
      new Date()
        .toISOString()
        .split("T")[0];

    // =========================
    // GET CURRENT PROGRESS
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
        "PROGRESS READ ERROR:",
        progressError
      );
    }

    // =========================
    // UPDATE PROGRESS
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
              (progress.streak || 0) +
              1;
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
          ai_chats:
            (progress.ai_chats ||
              0) + 1,

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
          "PROGRESS UPDATE ERROR:",
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

          ai_chats:
            1,

          coding_count:
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
          "PROGRESS INSERT ERROR:",
          insertError
        );
      }
    }

    // =========================
    // SAVE ACTIVITY
    // =========================

    const {
      error: activityError,
    } = await supabase
      .from("activities")
      .insert({
        user_id:
          userId,

        action:
          "Used Neural Guide",
      });

    if (activityError) {
      console.log(
        "ACTIVITY INSERT ERROR:",
        activityError
      );
    }

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json({
      success: true,
      result: answer,
      answer,
    });
  } catch (error: unknown) {
    console.log(
      "MENTOR ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Mentor failed.",
      },
      {
        status: 500,
      }
    );
  }
}